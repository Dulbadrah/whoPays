"use client";

import React from "react";

import { useRouter } from "next/navigation"; 
import { Plus, Users } from "lucide-react";

import BackgroundDot from "./components/BackgroundDot";
import ActionButton from "./components/ActionButton";
import AnimatedDot from "./components/AnimatedDot";

const AppMain: React.FC = () => {
  const router = useRouter();

  // ROOM ҮҮСГЭХ ФУНКЦ
  const handleCreateRoom = () => {
    
    router.push(`/createRoom`);
  };

  // ROOM НЭВТРЭХ ФУНКЦ
  const handleJoinRoom = () => {
   
   
    router.push(`/joinRoom`); // 12345-г өөрийн room code-оор сольж болно
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">

      {/* Background decorative dots */}
      <BackgroundDot size="large" position="top-4 left-4 sm:top-10 sm:left-10" />
      <BackgroundDot size="medium" position="top-16 right-8 sm:top-32 sm:right-20" />
      <BackgroundDot size="small" position="bottom-8 left-8 sm:bottom-20 sm:left-20" />
      <BackgroundDot size="large" position="bottom-20 right-4 sm:bottom-40 sm:right-10" />
      <BackgroundDot size="medium" position="top-1/2 left-1/4" />
      <BackgroundDot size="small" position="top-1/4 right-1/3" />

      {/* Main content */}
      <div className="relative z-10 text-center max-w-xs sm:max-w-md lg:max-w-lg w-full">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-2 sm:mb-4 drop-shadow-2xl transform -rotate-2">
            WHO
          </h1>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-yellow-300 mb-2 drop-shadow-2xl transform rotate-1">
            PAYS?
          </h1>
          <div className="w-16 sm:w-24 lg:w-32 h-1.5 sm:h-2 bg-red-500 mx-auto rounded-full shadow-lg"></div>
        </div>

        {/* Buttons */}
        <div className="space-y-4 sm:space-y-6">
       
          <ActionButton
            onClick={handleCreateRoom}
            icon={<Plus className="w-full h-full" />}
            text="CREATE ROOM"
            bgColor="bg-red-500"
            hoverColor="hover:bg-red-600"
            borderColor="bg-red-700"
            hoverBorderColor="group-hover:bg-red-800"
          />
         
          <ActionButton
            onClick={handleJoinRoom}
            icon={<Users className="w-full h-full" />}
            text="JOIN ROOM"
            bgColor="bg-green-500"
            hoverColor="hover:bg-green-600"
            borderColor="bg-green-700"
            hoverBorderColor="group-hover:bg-green-800"
          />
        </div>

        {/* Animated decorative dots */}
        <div className="mt-8 sm:mt-12 flex justify-center space-x-2 sm:space-x-4">
          <AnimatedDot color="bg-yellow-300" delay="0ms" />
          <AnimatedDot color="bg-white" delay="200ms" />
          <AnimatedDot color="bg-red-400" delay="400ms" />
        </div>
      </div>
    </div>
  );
};

export default AppMain;
