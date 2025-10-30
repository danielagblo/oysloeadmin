import React from "react";

export const Caret = ({ size = 1 }) => {
  const scaledSize = `${size}vw`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={scaledSize}
      height={scaledSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
};
