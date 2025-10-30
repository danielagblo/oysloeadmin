import React from "react";

export default function ImageIcon({ src, size = 2, alt = "" }) {
  const scaledSize = `${size}vw`;

  const style = {
    width: scaledSize,
    height: scaledSize,
    objectFit: "contain",
    display: "inline-block",
  };

  return <img src={src} alt={alt} style={style} />;
}
