"use client";

import React from "react";
import { GameButton } from "./GameButton";
import { Game } from "@/types/type";

interface GameSelectorProps {
  games: Game[];
  isHost: boolean;
  canStart: boolean;
}

export const GameSelector: React.FC<GameSelectorProps> = ({ games, isHost, canStart }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {games.map((game) => (
        <GameButton key={game.id} game={game} isHost={isHost} canStart={canStart} />
      ))}
    </div>
  );
};
