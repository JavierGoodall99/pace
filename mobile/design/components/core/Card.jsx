import React from "react";

export function Card({ children, media = false, style }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: "relative", borderRadius: "var(--radius-3xl)", overflow: "hidden",
        background: media ? "transparent" : "var(--color-ash)",
        border: media ? "1px solid var(--color-line)" : `1px solid ${hover ? "rgba(255,77,46,0.4)" : "var(--color-line)"}`,
        transform: !media && hover ? "translateY(-6px)" : "translateY(0)",
        transition: "border-color 500ms var(--ease-decel), transform 500ms var(--ease-decel)",
        ...style,
      }}>
      {children}
      {!media && (
        <span style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: 2, background: "var(--color-ember)",
          transformOrigin: "left", transform: hover ? "scaleX(1)" : "scaleX(0)", transition: "transform 500ms var(--ease-decel)",
        }} />
      )}
    </div>
  );
}
