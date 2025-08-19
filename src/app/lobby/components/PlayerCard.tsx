"use client";

import React from "react";
import { X } from "lucide-react";

interface PlayerCardProps {
  player: any;
  isCurrentUser: boolean;
  isHost: boolean;
  isCurrentUserHost: boolean;
  onRemove?: (nickname: string) => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isCurrentUser,
  isHost,
  isCurrentUserHost,
  onRemove,
}) => {
  return (
    <div
      className={`bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border-3 ${
        isCurrentUser 
          ? 'border-blue-400 bg-blue-50/80' 
          : isHost
            ? 'border-yellow-400 bg-yellow-50/80'
            : 'border-white/50'
      } text-center transform hover:scale-105 transition-all duration-200 relative`}
    >
      {isCurrentUserHost && !isHost && !isCurrentUser && (
        <button
          onClick={() => onRemove && onRemove(player.name)}
          className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
          title="Remove player"
        >
          <X size={14} />
        </button>
      )}

      <div className={`w-12 h-12 bg-gradient-to-br ${
        isHost 
          ? 'from-yellow-300 to-yellow-400' 
          : isCurrentUser
            ? 'from-blue-300 to-blue-400'
            : 'from-gray-300 to-gray-400'
      } rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-black ${
        isHost 
          ? 'text-yellow-800' 
          : isCurrentUser
            ? 'text-blue-800'
            : 'text-gray-800'
      } shadow-inner`}>
        {player.name.charAt(0).toUpperCase()}
      </div>

      <p className="font-bold text-blue-800 text-lg">{player.name}</p>

      <div className="flex flex-col gap-1 mt-2">
        {isHost && (
          <span className="inline-block px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full">
            👑 HOST
          </span>
        )}
        {isCurrentUser && (
          <span className="inline-block px-2 py-1 bg-blue-200 text-blue-800 text-xs font-bold rounded-full">
            YOU
          </span>
        )}
      </div>
    </div>
  );
};
