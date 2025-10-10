import React from "react";

export default function ImageIcon({ src, size = 24, alt = "" }) {
  const style = {
    width: size,
    height: size,
    objectFit: "contain",
    display: "inline-block",
  };

  return <img src={src} alt={alt} style={style} />;
}
