import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function EvaluationPage() {
  const { uuid } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const mode = params.get("mode") ?? "mild"; // mild | spicy
  const imageKey = location.state?.imageKey;
  const previewUrl = location.state?.previewUrl;

  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!imageKey) {
      alert("이미지 정보가 없습니다. 다시 시도해주세요.");
      navigate(`/tree/${uuid}`);
      return;
    }

    const fetchEvaluation = async () => {
      try {
        setLoading(true);

        const requestBody = {
          imageKey: imageKey,
        };

        const response = await axios.post(
          `https://api.beour.store/tree/${uuid}/evaluate?mode=${mode}`,
          requestBody
        );

        // 선착순 안에 못들어가면 ai 닫혀요 ~
        if (response.data.isSuccess) {
          setEvaluation(response.data.data);
        } else {
          alert(
            "AI 평가 참여가 마감되었습니다. 트리를 함께 만들어주셔서 감사합니다."
          );
          navigate(`/tree/${uuid}`);
        }
      } catch (err) {
        alert(
          "AI 평가 참여가 마감되었습니다. 트리를 함께 만들어주셔서 감사합니다."
        );
        navigate(`/tree/${uuid}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [uuid, mode, imageKey, navigate]);

  // 로딩 중 화면
  if (loading) {
    return (
      <div className="app-shell">
        <section className="nes-container is-rounded panel">
          <p className="nes-text is-dark">AI가 트리를 분석하고 있습니다...</p>
          <p>잠시만 기다려주세요! (약 5~10초 소요)</p>
          <progress
            className="nes-progress is-dark"
            value="50"
            max="100"
          ></progress>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <section className="nes-container is-rounded panel">
        <h2 style={{ marginTop: 0, marginBottom: "2rem" }}>
          {evaluation?.title ||
            `평가 결과 (${mode === "mild" ? "순한맛" : "매운맛"})`}
        </h2>

        {/* 트리 이미지 */}
        <div
          className="nes-container is-rounded"
          style={{ background: "#fff", marginBottom: 16 }}
        >
          <img
            src={evaluation?.imageUrl || previewUrl}
            alt="최종 트리"
            style={{ width: "100%", imageRendering: "pixelated" }}
          />
        </div>

        {/* 점수 */}
        <h3 style={{ marginTop: "2rem", marginBottom: "1.3rem" }}>
          총점: <span className="nes-text is-error">{evaluation?.score}</span>{" "}
          점
        </h3>
        {/* 요약 */}
        <div
          className="nes-container is-rounded"
          style={{ background: "#fff", marginBottom: "1.5rem" }}
        >
          <p style={{ fontWeight: "bold" }}>AI 한줄평</p>
          <p>{evaluation?.summary}</p>
        </div>

        {/* 상세 코멘트 리스트 */}
        <div
          className="nes-container with-title is-rounded"
          style={{ background: "#fff", textAlign: "left" }}
        >
          <p className="title" style={{ fontWeight: 700 }}>
            상세 분석
          </p>
          <ul className="nes-list is-disc" style={{ paddingLeft: "20px" }}>
            {evaluation?.comments?.map((comment, idx) => (
              <li key={idx} style={{ marginBottom: "8px", fontSize: "0.9rem" }}>
                {comment}
              </li>
            ))}
          </ul>
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
          <button
            className="nes-btn"
            onClick={() => navigate(`/tree/${uuid}`)}
            style={{ fontWeight: 700 }}
          >
            트리로 돌아가기
          </button>
        </div>
      </section>
    </div>
  );
}
