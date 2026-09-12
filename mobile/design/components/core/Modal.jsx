import React from "react";

export function Modal({ children, onClose, width = 480 }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(10,10,13,0.8)", backdropFilter: "blur(6px)" }} />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: width }}>
        {onClose && (
          <button aria-label="Close" onClick={onClose} style={{
            position: "absolute", top: -14, right: -14, width: 36, height: 36, borderRadius: "50%",
            background: "var(--color-coal)", border: "1px solid var(--color-line)", color: "var(--color-fog)", cursor: "pointer",
          }}>✕</button>
        )}
        <div style={{
          borderRadius: "var(--radius-3xl)", border: "1px solid var(--color-line)",
          background: "rgba(21,21,28,0.95)", backdropFilter: "blur(12px)", padding: "32px",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
