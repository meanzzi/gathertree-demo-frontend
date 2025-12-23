import { useNavigate } from "react-router-dom";
import Logo from "../assets/GatherTree.png";
import Tree from "../assets/tree.png";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <section className="nes-container is-rounded panel">
        <div style={{ width: "100%" }}>
          <img
            src={Logo}
            alt="GatherTree Logo"
            style={{
              width: "100%",
              height: "auto",
              imageRendering: "pixelated", // 도트가 뭉개지지 않고 선명하게 보이게 함
            }}
          />
        </div>

        <div>
          <img
            src={Tree}
            alt="완성된 트리"
            style={{
              width: "100%",
              height: "auto",
              imageRendering: "pixelated", // 도트가 뭉개지지 않고 선명하게 보이게 함
            }}
          />
        </div>

        <h2 style={{ marginTop: 0, display: "flex", justifyContent: "center" }}>
          내 트리를 꾸며줘!
        </h2>

        <p style={{ display: "flex", justifyContent: "center" }}>
          내가 그린 트리 위에, 친구가 그린 장식으로 트리를 완성해보세요
        </p>

        <div
          className="btn-row"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <button
            className="nes-btn is-primary"
            onClick={() => navigate("/tree/new")}
          >
            <div style={{ fontWeight: 600 }}>트리 만들기</div>
          </button>
        </div>
      </section>
    </div>
  );
}
