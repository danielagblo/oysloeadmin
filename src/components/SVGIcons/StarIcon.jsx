import React from "react";

export const StarIcon = ({ size = 1, color = "white" }) => {
  const scaledSize = `${size}vw`;

  return (
    <svg
      width={scaledSize}
      height={scaledSize}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.98633 0L12.3437 7.60081H19.9724L13.8007 12.2984L16.1581 19.8992L9.98633 15.2016L3.81458 19.8992L6.17198 12.2984L0.000234604 7.60081H7.62893L9.98633 0Z"
        fill={color}
      />
    </svg>
  );
};
