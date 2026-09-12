import React from "react";

export function Chip({ children, selected = false, onClick, icon }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: "8px",
      height: "44px", padding: "0 18px", borderRadius: "var(--radius-full)",
      fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase",
      border: selected ? "1px solid var(--color-ember)" : "1px solid var(--color-line)",
      background: selected ? "var(--color-ember)" : "var(--color-coal)",
      color: selected ? "var(--color-ink)" : "var(--color-fog)",
      fontWeight: selected ? 700 : 500,
      cursor: "pointer", transition: "all 300ms var(--ease-decel)",
    }}>
      {icon}
      {children}
    </button>
  );
}
