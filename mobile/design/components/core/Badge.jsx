import React from "react";

export function Badge({ children, tone = "neutral", dot = false }) {
  const tones = {
    neutral: { border: "1px solid var(--color-line)", background: "var(--color-coal)", color: "var(--color-fog)" },
    accent: { border: "1px solid rgba(255,77,46,0.3)", background: "rgba(255,77,46,0.08)", color: "var(--color-ember)" },
    solid: { border: "none", background: "var(--color-ember)", color: "var(--color-ink)" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "8px", ...t,
      borderRadius: "var(--radius-full)", padding: "6px 14px",
      fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />}
      {children}
    </span>
  );
}
