import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function EvaluationPage() {
  const { uuid } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const mode = params.get("mode") ?? "mild"; // mild | spicy

  const [treeData, setTreeData] = useState(null);

  // 최종 트리 불러오는게 없네..
  useEffect(() => {
    axios.get(`https://api.beour.store/tree/${uuid}`).then((res) => {
      if (res.data.isSuccess) {
        setTreeData(res.data.data);
      }
    });
  }, [uuid]);

  // TODO: 실제 AI 응답으로 교체
  const mockResult = {
    score: 83,
    title: "정성 가득한 크리스마스 트리",
    comment:
      mode === "mild"
        ? "따뜻한 마음이 느껴지는 트리예요. 장식 하나하나에 정성이 담겨 있어요."
        : "이 정도면 트리라기보단 장식 전시장입니다. 과하지만… 인정.",
  };

  return (
    <div className="app-shell">
      <section className="nes-container is-rounded panel">
        <h3 style={{ marginTop: 0 }}>
          평가 결과 ({mode === "mild" ? "순한맛" : "매운맛"})
        </h3>

        {/* 트리 이미지 */}
        {treeData ? (
          <div
            className="nes-container is-rounded"
            style={{ background: "#fff", marginBottom: 16 }}
          >
            <img
              src={treeData.baseImageUrl}
              alt="완성된 트리"
              style={{ width: "100%" }}
            />
          </div>
        ) : (
          <div
            className="nes-container is-rounded mini"
            style={{ background: "#fff", marginBottom: 16, padding: 16 }}
          >
            트리 불러오는 중...
          </div>
        )}

        {/* 점수 */}
        <h4 style={{ marginTop: "2rem", marginBottom: "1.3rem" }}>
          총점: {mockResult.score} 점
        </h4>

        {/* 평가 코멘트 */}
        <div
          className="nes-container is-rounded"
          style={{ background: "#fff" }}
        >
          <p>{mockResult.comment}</p>
        </div>

        {/* 버튼 */}
        <div
          className="btn-row"
          style={{
            marginTop: "2rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button className="nes-btn" onClick={() => navigate(`/tree/${uuid}`)}>
            트리로 돌아가기
          </button>
        </div>
      </section>
    </div>
  );
}
