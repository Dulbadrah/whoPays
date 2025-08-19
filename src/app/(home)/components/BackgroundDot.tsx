"use client";
import React from "react";

interface BackgroundDotProps {
  size: "small" | "medium" | "large";
  position: string;
}

const BackgroundDot: React.FC<BackgroundDotProps> = ({ size, position }) => {
  const sizeClasses = {
    small: "w-3 h-3 sm:w-4 sm:h-4",
    medium: "w-4 h-4 sm:w-6 sm:h-6",
    large: "w-6 h-6 sm:w-8 sm:h-8",
  };

  return <div className={`absolute ${sizeClasses[size]} bg-white rounded-full ${position}`}></div>;
};

export default BackgroundDot;
