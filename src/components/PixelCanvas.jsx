import { useEffect, useRef, useState } from "react";

export default function PixelCanvas({
  widthPx,
  heightPx,
  initialImageDataUrl,
  onChange,
}) {
  const canvasRef = useRef(null);

  const [color, setColor] = useState("#2f7141");
  const [tool, setTool] = useState("pen"); // pen | eraser
  const [brushSize, setBrushSize] = useState(2); //  펜 굵기
  const [isDown, setIsDown] = useState(false);
  const [scale, setScale] = useState(10); //확대, 축소를 위함

  const cssWidth = widthPx * scale;
  const cssHeight = heightPx * scale;

  // getContext 매번 호출 리팩토링
  const ctxRef = useRef(null);

  /* -----------------------------
   * 캔버스 초기화 & 이미지 로드
   * ----------------------------- */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    c.width = widthPx;
    c.height = heightPx;

    const ctx = c.getContext("2d", {
      willReadFrequently: true,
    });
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, widthPx, heightPx);

    ctxRef.current = ctx; // 여기서 한 번만 저장

    if (initialImageDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, widthPx, heightPx);
        ctx.drawImage(img, 0, 0, widthPx, heightPx);
        emit();
      };
      img.src = initialImageDataUrl;
    } else {
      emit();
    }
  }, [widthPx, heightPx, initialImageDataUrl]);

  /* -----------------------------
   * PNG 결과 emit
   * ----------------------------- */
  const emit = () => {
    const c = canvasRef.current;
    if (!c) return;
    const dataUrl = c.toDataURL("image/png");
    onChange?.(dataUrl);
  };

  /* -----------------------------
   * 마우스 → 픽셀 좌표 변환, 모바일, 태블릿펜 모두 가능하게
   * ----------------------------- */
  const getPixelFromEvent = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();

    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;

    const x = Math.floor(((clientX - rect.left) / rect.width) * widthPx);
    const y = Math.floor(((clientY - rect.top) / rect.height) * heightPx);

    return {
      x: Math.max(0, Math.min(widthPx - 1, x)),
      y: Math.max(0, Math.min(heightPx - 1, y)),
    };
  };

  // 선 안끊겨보이게 하려고
  const lastPosRef = useRef(null);

  const drawLine = (from, to) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    for (let i = 0; i <= steps; i++) {
      const x = Math.round(from.x + (dx * i) / steps);
      const y = Math.round(from.y + (dy * i) / steps);
      drawBrush(x, y);
    }
  };

  /* -----------------------------
   * 브러시 드로잉 (굵기 지원)
   * ----------------------------- */
  const drawBrush = (x, y) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const half = Math.floor(brushSize / 2);

    for (let dx = -half; dx < brushSize - half; dx++) {
      for (let dy = -half; dy < brushSize - half; dy++) {
        const px = x + dx;
        const py = y + dy;

        if (px < 0 || py < 0 || px >= widthPx || py >= heightPx) continue;

        if (tool === "eraser") {
          ctx.clearRect(px, py, 1, 1);
        } else {
          ctx.fillStyle = color;
          ctx.fillRect(px, py, 1, 1);
        }
      }
    }
  };

  /* -----------------------------
   * 마우스 이벤트
   * ----------------------------- */
  const handleDown = (e) => {
    setIsDown(true);
    const pos = getPixelFromEvent(e);
    lastPosRef.current = pos;
    drawBrush(pos.x, pos.y);
  };

  const handleMove = (e) => {
    if (!isDown || !lastPosRef.current) return;
    const pos = getPixelFromEvent(e);
    drawLine(lastPosRef.current, pos);
    lastPosRef.current = pos;
  };

  const handleUp = () => {
    setIsDown(false);
    emit();
  };

  /* -----------------------------
   * 전체 지우기
   * ----------------------------- */
  const clearAll = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.clearRect(0, 0, widthPx, heightPx);
    emit();
  };

  return (
    <div>
      {/*  툴바 */}
      <div className="btn-row" style={{ alignItems: "center" }}>
        <button
          className={`nes-btn ${tool === "pen" ? "is-primary" : ""}`}
          onClick={() => setTool("pen")}
          type="button"
        >
          펜
        </button>

        <button
          className={`nes-btn ${tool === "eraser" ? "is-warning" : ""}`}
          onClick={() => setTool("eraser")}
          type="button"
        >
          지우개
        </button>

        {/*  펜 굵기 */}
        <label
          className="mini"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          굵기
          <select
            className="nes-select"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          >
            <option value={1}>1px</option>
            <option value={2}>2px</option>
            <option value={3}>3px</option>
            <option value={4}>4px</option>
            <option value={5}>5px</option>
          </select>
        </label>

        {/* 색상 */}
        <label
          className="mini"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          색상
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: 44, height: 34 }}
          />
        </label>

        <button className="nes-btn is-error" onClick={clearAll} type="button">
          전체 지우기
        </button>
      </div>

      {/*  캔버스 */}
      <div
        className="nes-container is-rounded"
        style={{
          background: "#fff",
          padding: 12,
          marginTop: 12,
          display: "inline-block",

          maxWidth: "100%", // 부모보다 커지지 않게
          height: "auto",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: cssWidth,
            height: cssHeight,

            maxWidth: "100%", // 부모보다 커지지 않게
            height: "auto",

            border: "2px solid #111",
            imageRendering: "pixelated",
            cursor: tool === "eraser" ? "not-allowed" : "crosshair",
            touchAction: "none", // 모바일 스크롤 방지
          }}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerLeave={handleUp}
          onPointerCancel={handleUp}
        />
      </div>

      {/* <div className="mini" style={{ marginTop: 10 }}>
        크기: {widthPx}×{heightPx}px · 화면 표시: {cssWidth}×{cssHeight}px
      </div> */}
    </div>
  );
}
