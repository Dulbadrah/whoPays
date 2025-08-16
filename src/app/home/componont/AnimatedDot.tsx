"use client";
import React from "react";

interface AnimatedDotProps {
  color: string;
  delay: string;
}

const AnimatedDot: React.FC<AnimatedDotProps> = ({ color, delay }) => {
  return (
    <div
      className={`w-2 h-2 sm:w-3 sm:h-3 ${color} rounded-full animate-bounce`}
      style={{ animationDelay: delay }}
    ></div>
  );
};

export default AnimatedDot;
