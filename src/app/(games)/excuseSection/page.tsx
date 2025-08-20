"use client";

import React from "react";
import { useState, useEffect } from "react";
import { ExcuseHeader } from "./components/ExcuseHeader";
import { AnimatedDotAll } from "@/components/ui/AnimatedDot";
import { ExcuseBackground } from "./components/ExcuseBackground";
import { ExcuseForm } from "./components/ExcuseForm";
// import { ExcuseForm } from "./components/ExcuseForm"

const ExcuseSection: React.FC = () => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [userNickname, setUserNickname] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rn = localStorage.getItem("roomName") || localStorage.getItem("roomname") || "";
    const rid = localStorage.getItem("roomId") || localStorage.getItem("roomid") || "";
    const un = localStorage.getItem("userNickname") || localStorage.getItem("usernickname") || "";
    setRoomName(rn);
    setRoomId(rid);
    setUserNickname(un);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <ExcuseBackground />
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 max-w-xs sm:max-w-md w-full border border-white/20">
        <ExcuseHeader />
        <h2 className="text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6 text-gray-700 drop-shadow-sm">
          Шалтаг аа бич
        </h2>

        {submitted ? (
          <div className="text-center py-6 sm:py-8">
            <p className="text-lg font-bold text-green-600 mb-2 drop-shadow-sm">
              Message sent successfully!
            </p>
            <p className="text-gray-600">Thank you for your submission.</p>
          </div>
        ) : (
          <ExcuseForm  />
        )}

        <AnimatedDotAll />
      </div>
    </div>
  );
};

export default ExcuseSection;
