import React from "react";

export function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button key={opt} onClick={() => onChange && onChange(opt)} style={{
            padding: "10px 18px", borderRadius: "var(--radius-full)",
            fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase",
            border: active ? "1px solid var(--color-ember)" : "1px solid var(--color-line)",
            background: active ? "var(--color-ember)" : "var(--color-coal)",
            color: active ? "var(--color-ink)" : "var(--color-fog)",
            fontWeight: active ? 700 : 500, cursor: "pointer", transition: "all 300ms var(--ease-decel)",
          }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}
