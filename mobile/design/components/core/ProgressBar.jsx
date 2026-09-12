import React from "react";

export function ProgressBar({ value = 0, max = 100, width = 140 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ width, height: "4px", borderRadius: "var(--radius-full)", background: "var(--color-ash)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "var(--color-ember)", borderRadius: "var(--radius-full)", transition: "width 500ms var(--ease-decel)" }} />
    </div>
  );
}
