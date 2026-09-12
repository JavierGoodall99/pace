import React from "react";

const base = {
  fontFamily: "var(--font-mono)",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  borderRadius: "var(--radius-full)",
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
  transition: "background-color 300ms var(--ease-decel), color 300ms var(--ease-decel), transform 300ms var(--ease-decel)",
};

const sizes = {
  md: { padding: "16px 32px" },
  sm: { padding: "10px 20px", fontSize: "11px" },
};

const variants = {
  primary: { background: "var(--color-ember)", color: "var(--color-ink)" },
  secondary: { background: "var(--color-bone)", color: "var(--color-ink)" },
  ghost: { background: "transparent", color: "var(--color-fog)", border: "1px solid var(--color-line)" },
};

const hoverBg = { primary: "var(--color-flare)", secondary: "var(--color-ember)", ghost: "transparent" };

export function Button({ children, variant = "primary", size = "md", disabled = false, onClick }) {
  const [hover, setHover] = React.useState(false);
  const v = variants[variant] || variants.primary;
  const style = {
    ...base,
    ...sizes[size],
    ...v,
    background: disabled ? "var(--color-ash)" : hover ? hoverBg[variant] : v.background,
    color: disabled ? "rgba(143,141,151,0.4)" : v.color,
    opacity: disabled ? 1 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    transform: hover && !disabled ? "scale(0.99)" : "scale(1)",
  };
  return (
    <button style={style} disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {children}
    </button>
  );
}
