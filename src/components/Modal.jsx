export default function Modal({ title, children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(167, 167, 167, 0.6)",
        display: "grid",
        placeItems: "center",
        zIndex: 999,
      }}
    >
      <section
        className="nes-dialog is-rounded"
        style={{
          backgroundColor: "#468365f3",
        }}
      >
        <header
          className="title"
          style={{ fontWeight: "700", fontSize: "1.4rem", lineHeight: "2" }}
        >
          {title}
        </header>

        <div className="content" style={{ fontSize: "1rem" }}>
          {children}
        </div>
        <div style={{ textAlign: "right", marginTop: 12 }}>
          <button className="nes-btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </section>
    </div>
  );
}
