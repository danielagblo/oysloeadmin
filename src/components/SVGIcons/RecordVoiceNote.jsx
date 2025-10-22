import React from "react";

export const RecordVoiceNote = ({ size = 16 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.998047 9C1.65108 20.4026 16.1555 18.8902 16.1609 9.00827"
        stroke="#374957"
        stroke-width="2"
      />
      <rect
        x="4.6582"
        y="0.5"
        width="7"
        height="12"
        rx="3.5"
        fill="#374957"
        stroke="#374957"
      />
      <rect
        x="7.6582"
        y="19.5"
        width="2"
        height="4"
        fill="#374957"
        stroke="#374957"
      />
    </svg>
  );
};
