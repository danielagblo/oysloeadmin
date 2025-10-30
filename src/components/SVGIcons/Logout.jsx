import React from "react";

export const Logout = ({ size = 2 }) => {
  const scaledSize = `${size}vw`;

  return (
    <svg
      width={scaledSize}
      height={scaledSize}
      viewBox="0 0 42 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        opacity="0.5"
        d="M21 35C13.268 35 7 28.732 7 21C7 13.268 13.268 7 21 7"
        stroke="#1C274C"
        stroke-width="2"
        stroke-linecap="round"
      />
      <path
        d="M17.5 21H35M35 21L29.75 15.75M35 21L29.75 26.25"
        stroke="#1C274C"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};
