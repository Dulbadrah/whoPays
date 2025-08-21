"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { io } from "socket.io-client";

type Player = {
  id: number;
  name: string;
  progress: number;
  isMe?: boolean;
  socketId?: string;
};



export default function RaceGame() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const storedRoom = localStorage.getItem("currentRoom");
    if (storedRoom) {
      try {
        const parsedRoom = JSON.parse(storedRoom);
        if (parsedRoom.roomCode) {
          setRoomId(String(parsedRoom.roomCode));
        }
      } catch (e) {
        console.error("Failed to parse currentRoom", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const socket = io(undefined, { path: '/api/socket_io' });
    socketRef.current = socket;

    const nickname = localStorage.getItem("userNickname") || "anon";

    socket.on("connect", () => {
      socket.emit("join", { roomId, name: nickname });
    });

    socket.on("room_state", (state: { participants: Player[] }) => {
      const storedNickname = localStorage.getItem("userNickname") || "";
      const mapped = state.participants.map((p) => ({ ...p, isMe: p.name === storedNickname }));
      setPlayers(mapped);
    });

    socket.on("player_update", (player: Player) => {
      setPlayers((prev) => prev.map((p) => (p.id === player.id ? { ...p, progress: player.progress } : p)));
      if (player.progress >= 100) setWinner(player.name);
    });

    socket.on("player_joined", (player: Player) => {
      setPlayers((prev) => (prev.find((p) => p.id === player.id) ? prev : [...prev, player]));
    });

    socket.on("player_left", (socketId: string) => {
      setPlayers((prev) => prev.filter((p) => p.socketId !== socketId));
    });

    return () => {
      socket.emit("leave", { roomId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  const handleRun = () => {
    if (!socketRef.current) return;
    const my = players.find((p) => p.isMe);
    if (!my || winner) return;

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === my.id) {
          const next = Math.min(p.progress + 2, 100);
          if (next >= 100) setWinner(p.name);
          return { ...p, progress: next };
        }
        return p;
      })
    );

    socketRef.current.emit("run", { roomId });
  };

  const resetGame = () => {
    socketRef.current?.emit("reset", { roomId });
    setWinner(null);
  };

  if (players.length === 0) return <div>Loading...</div>;

  const myPlayer = players.find((p) => p.isMe);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-indigo-500 to-blue-600 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 max-w-xl w-full border border-white/20 space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 drop-shadow-sm">🏁 Running Race</h1>

        <div className="space-y-6">
          {players.map((player) => (
            <div key={player.id} className="space-y-2">
              <div className="flex justify-between">
                <span className={`${player.isMe ? "font-bold text-indigo-600" : "text-gray-700"}`}>
                  {player.name}
                </span>
                <span className="text-sm text-gray-500">{player.progress}%</span>
              </div>

              <div className="relative h-10 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-1/2 -translate-y-1/2 text-2xl transition-all duration-300 ${player.isMe ? "text-indigo-600" : "text-gray-700"}`}
                  style={{ insetInlineStart: `${player.progress}%` }}
                >
                  🐌
                </div>
              </div>
            </div>
          ))}
        </div>

        {winner && (
          <div className="text-center space-y-3 mt-4">
            <div className="font-bold text-green-600 text-xl drop-shadow-sm">🎉 {winner} is the Winner!</div>
            <Button onClick={resetGame}>🔁 Play Again</Button>
          </div>
        )}

        {!winner && myPlayer && (
          <div className="text-center mt-4">
            <Button className="w-full sm:w-auto" variant={"destructive"} onClick={handleRun}>
              Run!
            </Button>
          </div>
        )}

        {!winner && !myPlayer && (
          <div className="text-center mt-4 text-red-600 font-bold drop-shadow-sm">You are not a participant in this room.</div>
        )}
      </div>
    </div>
  );
}
