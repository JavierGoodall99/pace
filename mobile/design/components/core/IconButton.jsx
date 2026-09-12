import React from "react";

export function IconButton({ children, tone = "neutral", size = 44, onClick, ariaLabel }) {
  const [hover, setHover] = React.useState(false);
  const tones = {
    neutral: { bg: "var(--color-ash)", color: "var(--color-bone)", hoverBorder: "var(--color-line-hover)" },
    accent: { bg: "rgba(255,77,46,0.10)", color: "var(--color-ember)", hoverBorder: "var(--color-ember)" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <button aria-label={ariaLabel} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: size, height: size, borderRadius: "var(--radius-full)", background: t.bg, color: t.color,
        border: `1px solid ${hover ? t.hoverBorder : "var(--color-line)"}`,
        display: "grid", placeItems: "center", cursor: "pointer",
        transition: "border-color 300ms var(--ease-decel), transform 300ms var(--ease-decel)",
        transform: hover ? "scale(1.06)" : "scale(1)",
      }}>
      {children}
    </button>
  );
}
