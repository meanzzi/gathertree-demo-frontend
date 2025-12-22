import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../components/Modal";
import CompositeTreeCanvas from "../components/CompositeTreeCanvas";
import axios from "axios";

export default function TreeViewPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteType, setInviteType] = useState("decorate"); // decorate || owner
  const [tree, setTree] = useState(null);
  const [finalPng, setFinalPng] = useState("");

  // 트리 조회
  const fetchTree = async () => {
    try {
      const response = await axios.get(`https://api.beour.store/tree/${uuid}`);
      if (response.data.isSuccess) {
        const treeData = response.data.data;

        const baseImageUrl = import.meta.env.DEV
          ? `/trees/${treeData.uuid}/base.png`
          : `https://cdn.beour.store/trees/${treeData.uuid}/base.png`;

        const decorations = treeData.decorations.map((d) => ({
          ...d,
          imageDataUrl: import.meta.env.DEV
            ? `/trees/${treeData.uuid}/decorations/${d.id}.png`
            : `https://cdn.beour.store/trees/${treeData.uuid}/decorations/${d.id}.png`,
        }));

        setTree({
          uuid: treeData.uuid,
          baseImageDataUrl: baseImageUrl,
          decorations,
          decorationCount: treeData.decorationCount,
        });
      } else {
        alert("트리를 불러오는 중 오류가 발생했습니다.");
      }
    } catch (err) {
      alert("트리 조회 중 오류 발생");
    }
  };

  useEffect(() => {
    fetchTree();
  }, [uuid]);

  const decorateUrl = `${window.location.origin}/tree/${uuid}/decorate`;
  const ownerUrl = window.location.href; // 현재 주소
  const decorations = tree?.decorations ?? [];
  const count = decorations.length;

  const canEvaluate = count === 10;

  const ids = useMemo(() => decorations.map((d) => d.id), [decorations]);

  // 장식 순서 변경
  const move = async (from, to) => {
    if (to < 0 || to >= ids.length) return;
    const next = [...ids];
    [next[from], next[to]] = [next[to], next[from]];

    try {
      const response = await axios.put(
        `https://api.beour.store/tree/${uuid}/decorations/reorder`,
        { order: next }
      );
      if (response.data.isSuccess) {
        fetchTree(); // 변경 후 새로 조회
      } else {
        alert("순서 변경 중 오류 발생");
      }
    } catch (err) {
      alert("순서 변경 중 오류 발생");
    }
  };

  // 장식 삭제
  const remove = async (decorationId) => {
    if (!confirm("이 장식을 삭제할까요?")) return;

    try {
      const response = await axios.delete(
        `https://api.beour.store/tree/${uuid}/decorations/${decorationId}`
      );

      if (response.data.isSuccess) {
        fetchTree(); // 삭제 후 새로 조회
      } else {
        alert("장식 삭제 중 오류 발생");
      }
    } catch (err) {
      alert("장식 삭제 중 오류 발생");
    }
  };

  const download = () => {
    if (!finalPng) return alert("아직 합성 이미지가 없어요!");
    const a = document.createElement("a");
    a.href = finalPng;
    a.download = `gathertree-${uuid}.png`;
    a.click();
  };

  if (!tree) {
    return (
      <div className="app-shell">
        <section className="nes-container is-rounded panel">
          <h3 style={{ marginTop: 0 }}>트리를 찾을 수 없어요</h3>
          <p className="mini">저장된 트리 링크가 맞는지 확인해주세요.</p>
          <div className="btn-row">
            <button className="nes-btn" onClick={() => navigate("/")}>
              홈으로
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <section className="nes-container is-rounded panel">
        <h2 style={{ marginTop: 0 }}>내 트리 확인하기</h2>
        <br />
        <p>
          <b>현재 장식 수 : {count} / 10</b>
        </p>

        {/* 합성 결과 (트리 + 장식) */}
        <CompositeTreeCanvas
          baseImageDataUrl={tree.baseImageDataUrl}
          decorations={decorations}
          onRenderedDataUrl={setFinalPng}
        />

        <div
          className="btn-row"
          style={{
            paddingTop: "15px",
            paddingBottom: "15px",
          }}
        >
          <button
            className="nes-btn is-warning"
            onClick={() => setShowInvite(true)}
            style={{ fontWeight: 600 }}
          >
            장식 요청 링크
          </button>

          {/* 버그로 잠시 주석처리할게요.. */}
          {/* <button
            className="nes-btn"
            onClick={() => navigate(`/tree/${uuid}/edit`)}
          >
            트리 수정하기
          </button> */}

          <button
            className="nes-btn"
            onClick={() => {
              setInviteType("owner");
              setShowInvite(true);
            }}
            style={{ fontWeight: 600 }}
          >
            내 트리 링크 저장
          </button>

          <button
            className="nes-btn is-success"
            onClick={download}
            style={{ fontWeight: 600 }}
          >
            이미지 다운로드
          </button>
        </div>

        <hr />

        <p style={{ fontSize: "1rem", paddingTop: "3px" }}>
          {canEvaluate
            ? "AI 평가 받기"
            : "트리를 완성하면 AI에게 평가받을 수 있어요."}
        </p>

        <div className="btn-row">
          <button
            className={`nes-btn is-success ${
              !canEvaluate ? "is-disabled" : ""
            }`}
            disabled={!canEvaluate}
            onClick={() => {
              if (!canEvaluate) return;
              navigate(`/tree/${uuid}/evaluate?mode=mild`);
            }}
            style={{ fontWeight: 600 }}
          >
            GPF 순한맛 평가
          </button>
          <button
            className={`nes-btn is-error ${!canEvaluate ? "is-disabled" : ""}`}
            disabled={!canEvaluate}
            onClick={() => {
              if (!canEvaluate) return;
              navigate(`/tree/${uuid}/evaluate?mode=spicy`);
            }}
            style={{ fontWeight: 600 }}
          >
            GPT 매운맛 평가
          </button>
        </div>
      </section>

      {/* 장식 목록 + 32×32 미리보기 + 순서/삭제 */}
      <section
        className="nes-container is-rounded panel"
        style={{ marginTop: 20 }}
      >
        <h3 style={{ marginTop: 0 }}>장식 목록</h3>

        {decorations.length === 0 ? (
          <p style={{ fontSize: "1rem" }}>
            아직 장식이 없어요. 친구에게 장식을 그려달라고 요청하세요!
          </p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {decorations.map((d, idx) => (
              <div
                key={d.id}
                className="nes-container is-rounded"
                style={{ background: "#fff" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      className="nes-container is-rounded"
                      style={{
                        width: 56,
                        height: 56,
                        background: "#fff",
                        display: "grid",
                        placeItems: "center",
                        padding: 4,
                      }}
                      title="32×32 장식 미리보기"
                    >
                      <img
                        src={d.imageDataUrl}
                        alt="decoration"
                        width={32}
                        height={32}
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>

                    <div>
                      <div className="mini">by {d.authorName}</div>
                      <div className="mini">slot: {idx + 1}</div>
                    </div>
                  </div>

                  <div className="btn-row" style={{ marginTop: 0 }}>
                    <button
                      className="nes-btn"
                      onClick={() => move(idx, idx - 1)}
                    >
                      ↑
                    </button>
                    <button
                      className="nes-btn"
                      onClick={() => move(idx, idx + 1)}
                    >
                      ↓
                    </button>
                    <button
                      className="nes-btn is-error"
                      onClick={() => remove(d.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 장식 요청 팝업 */}
      {showInvite && (
        <Modal
          title={inviteType === "decorate" ? "장식 요청 링크" : "내 트리 링크"}
          onClose={() => setShowInvite(false)}
        >
          <p>
            {inviteType === "decorate"
              ? "이 링크를 친구에게 보내면 트리를 꾸밀 수 있어요"
              : "이 링크는 내 트리를 관리하는 유일한 주소입니다."}
          </p>
          <input className="nes-input" value={decorateUrl} readOnly />
          <div className="btn-row">
            <button
              className="nes-btn is-primary"
              onClick={() => {
                const url = inviteType === "decorate" ? decorateUrl : ownerUrl;
                navigator.clipboard.writeText(url);
                alert("복사 완료!");
              }}
            >
              링크 복사
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
