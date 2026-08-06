import React from "react";

const HalfStar = ({ size = 24, color = "#FFDF00" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={0.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-star"
    >
      <defs>
        <linearGradient id="half-fill" x1="0" x2="100%" y1="0" y2="0">
          <stop offset="50%" stopColor={color} />
          <stop offset="50%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="half-mask">
          <rect x="0" y="0" height="100%" fill="white" />
        </mask>
      </defs>
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill="url(#half-fill)"
        strokeWidth={0.8}
      />
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill="none"
        stroke="currentColor"
        strokeWidth={0.8}
        mask="url(#half-mask)"
      />
    </svg>
  );
};

export default HalfStar;
