import React from "react";

export const Dashboard = ({ size = 30 }) => {
  const scaledSize = `${size}vw`;

  return (
    <svg
      width={scaledSize}
      height={scaledSize}
      viewBox="0 0 42 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.7599 16.5125C15.0073 16.5125 17.6399 14.0053 17.6399 10.9125C17.6399 7.8197 15.0073 5.3125 11.7599 5.3125C8.51244 5.3125 5.87988 7.8197 5.87988 10.9125C5.87988 14.0053 8.51244 16.5125 11.7599 16.5125Z"
        stroke="#374957"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M30.0655 16.4637C33.313 16.4637 35.9455 13.9565 35.9455 10.8637C35.9455 7.77087 33.313 5.26367 30.0655 5.26367C26.8181 5.26367 24.1855 7.77087 24.1855 10.8637C24.1855 13.9565 26.8181 16.4637 30.0655 16.4637Z"
        stroke="#374957"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M11.7599 34.1121C15.0073 34.1121 17.6399 31.6049 17.6399 28.5121C17.6399 25.4193 15.0073 22.9121 11.7599 22.9121C8.51244 22.9121 5.87988 25.4193 5.87988 28.5121C5.87988 31.6049 8.51244 34.1121 11.7599 34.1121Z"
        stroke="#374957"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M30.2404 34.1121C33.4878 34.1121 36.1204 31.6049 36.1204 28.5121C36.1204 25.4193 33.4878 22.9121 30.2404 22.9121C26.9929 22.9121 24.3604 25.4193 24.3604 28.5121C24.3604 31.6049 26.9929 34.1121 30.2404 34.1121Z"
        stroke="#374957"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};
