import { useEffect, useRef, useState } from "react";
import "./PixelCanvas.css";

export default function PixelCanvas({
  widthPx,
  heightPx,
  initialImageDataUrl,
  baseImage, // 기본 트리 이미지
  onChange,
}) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null); // getContext 매번 호출 리팩토링
  const lastPosRef = useRef(null);

  const [color, setColor] = useState("#000000");
  const [tool, setTool] = useState("pen"); // pen | eraser
  const [brushSize, setBrushSize] = useState(1); //  펜 굵기
  const [isDown, setIsDown] = useState(false);

  // 캔버스 초기화, 이미지 로드
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

    const drawAll = async () => {
      // 1. 기본 트리 먼저
      if (baseImage) {
        const baseImg = new Image();
        baseImg.src = baseImage;
        await baseImg.decode();
        ctx.drawImage(baseImg, 0, 0, widthPx, heightPx);
      }

      // 2. 기존 이미지 (수정 페이지용)
      if (initialImageDataUrl) {
        const img = new Image();
        img.src = initialImageDataUrl;
        await img.decode();
        ctx.drawImage(img, 0, 0, widthPx, heightPx);
      }
      emit();
    };

    drawAll();
  }, [widthPx, heightPx, initialImageDataUrl]);

  // png 결과 emit
  const emit = () => {
    const c = canvasRef.current;
    if (!c) return;
    const dataUrl = c.toDataURL("image/png");
    onChange?.(dataUrl);
  };

  // 마우스 -> 픽셀 좌표 변환 (태블릿, 모바일 모두 가능하게)
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

  // 선 부드럽게
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

  // 브러쉬 드로잉 (굵기 지원)
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

  // 마우스 이벤트
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

  // 전체 지우기
  const clearAll = async () => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.clearRect(0, 0, widthPx, heightPx);

    emit();
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        marginBottom: "2rem",
      }}
    >
      {/*  툴바 */}
      <div
        className="btn-row"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap", // 화면 작아지면 자연스럽게 다음 줄로
          gap: "1rem",
          marginBottom: "1.3rem",
          padding: "0 10px",
        }}
      >
        <button
          className={`nes-btn ${tool === "pen" ? "is-primary" : ""}`}
          onClick={() => setTool("pen")}
          type="button"
          style={{
            fontWeight: 600,
          }}
        >
          펜
        </button>

        <button
          className={`nes-btn ${tool === "eraser" ? "is-warning" : ""}`}
          onClick={() => setTool("eraser")}
          type="button"
          style={{ fontWeight: 600 }}
        >
          지우개
        </button>

        {/*  펜 굵기 */}
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>굵기</span>
          <div className="nes-select" style={{ width: "7rem" }}>
            <select
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
            >
              <option value={1} style={{ fontSize: "0.8rem" }}>
                1px
              </option>
              <option value={2} style={{ fontSize: "0.8rem" }}>
                2px
              </option>
              <option value={3} style={{ fontSize: "0.8rem" }}>
                3px
              </option>
              <option value={4} style={{ fontSize: "0.8rem" }}>
                4px
              </option>
              <option value={5} style={{ fontSize: "0.8rem" }}>
                5px
              </option>
            </select>
          </div>
        </label>

        {/* 색상 */}
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>색상</span>
          <div
            className="nes-container is-rounded"
            style={{
              width: "60px",
              height: "48px",
              padding: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#fff",
            }}
          >
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                width: "100%",
                height: "100%",
                cursor: "pointer",
                border: "none",
                outline: "none",
                padding: 0,
                background: "none",
              }}
            />
          </div>
        </label>

        <button
          className="nes-btn is-error"
          onClick={clearAll}
          type="button"
          style={{ fontWeight: 600 }}
        >
          전체 지우기
        </button>
      </div>

      <div
        className="nes-container is-rounded"
        style={{
          background: "#fff",
          display: "inline-block",
          width: "97%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
          aspectRatio: `${widthPx} / ${heightPx}`,
        }}
      >
        <canvas
          ref={canvasRef}
          className="canvas-transparent"
          style={{
            width: "100%",
            height: "100%",
            outline: "2px solid #111",
            imageRendering: "pixelated",
            cursor: tool === "eraser" ? "not-allowed" : "crosshair",
            touchAction: "none",
          }}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerLeave={handleUp}
          onPointerCancel={handleUp}
        />
      </div>
    </div>
  );
}
