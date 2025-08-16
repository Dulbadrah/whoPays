"use client";
import React from "react";

interface ButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  text: string;
  bgColor: string;
  hoverColor: string;
  borderColor: string;
  hoverBorderColor: string;
}

const ActionButton: React.FC<ButtonProps> = ({
  onClick,
  icon,
  text,
  bgColor,
  hoverColor,
  borderColor,
  hoverBorderColor,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full group relative overflow-hidden ${bgColor} ${hoverColor} text-white font-bold py-4 sm:py-6 px-6 sm:px-8 rounded-2xl shadow-2xl transform transition-all duration-200 hover:scale-105 hover:shadow-3xl active:scale-95`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-200`}></div>
      <div className="relative flex items-center justify-center space-x-2 sm:space-x-3">
        <div className="w-5 h-5 sm:w-6 sm:h-6">{icon}</div>
        <span className="text-lg sm:text-xl lg:text-2xl font-black tracking-wide">
          {text}
        </span>
      </div>
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 ${borderColor} ${hoverBorderColor} transition-colors duration-200`}
      ></div>
    </button>
  );
};

export default ActionButton;
