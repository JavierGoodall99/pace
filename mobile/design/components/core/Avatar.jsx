import React from "react";

export function Avatar({ src, alt = "", size = 64, ring = true, overlap = false }) {
  return (
    <img src={src} alt={alt} style={{
      width: size, height: size, borderRadius: "50%", objectFit: "cover",
      filter: "grayscale(1)", marginLeft: overlap ? -size / 3.2 : 0,
      boxShadow: ring ? "0 0 0 2px var(--color-ash)" : "none",
    }} />
  );
}
