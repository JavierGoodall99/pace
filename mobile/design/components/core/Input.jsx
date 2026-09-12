import React from "react";

export function Input({ placeholder, value, onChange, error = false, type = "text" }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <input
      type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange && onChange(e.target.value)}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{
        width: "100%", boxSizing: "border-box", background: "var(--color-coal)",
        color: "var(--color-bone)", fontFamily: "var(--font-mono)", fontSize: "14px", letterSpacing: "0.05em",
        padding: "16px 24px", borderRadius: "var(--radius-full)", outline: "none",
        border: error ? "1px solid rgba(255,77,46,0.7)" : focus ? "1px solid rgba(255,77,46,0.6)" : "1px solid var(--color-line)",
        boxShadow: (focus || error) ? "0 0 0 4px rgba(255,77,46,0.1)" : "none",
        transition: "all 300ms var(--ease-decel)",
      }}
    />
  );
}
