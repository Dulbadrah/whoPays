"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Player {
  id: number;
  name: string;
  progress: number;
  isMe: boolean;
}

interface RoomData {
  participants: { id: number; name: string; progress?: number }[];
}

export default function RaceGame() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<number | null>(null);

  useEffect(() => {
    const storedRoom = localStorage.getItem("currentRoom");
    if (storedRoom) {
      try {
        const parsedRoom = JSON.parse(storedRoom);
        if (parsedRoom.roomCode) {
          setRoomId(parsedRoom.roomCode);
        } else {
          console.error("Room id байхгүй байна");
        }
      } catch {
        console.error("currentRoom-г уншихад алдаа");
      }
    } else {
      console.error("currentRoom localStorage-д байхгүй байна");
    }
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const fetchRoom = async () => {
      try {
        const res = await fetch(`http://localhost:4200/room/${roomId}`);
        if (!res.ok) throw new Error("Failed to fetch room");

        const data: { room?: RoomData } = await res.json();

        if (!data.room) {
          console.error("Room data ирсэнгүй");
          return;
        }

        const storedNickname = localStorage.getItem("userNickname") || "";

        const initialPlayers: Player[] = data.room.participants.map((p) => ({
          id: p.id,
          name: p.name,
          progress: p.progress || 0,
          isMe: p.name === storedNickname,
        }));

        setPlayers(initialPlayers);
      } catch (err) {
        console.error("Error fetching room:", err);
      }
    };

    fetchRoom();
  }, [roomId]);

  const handleClick = (id: number) => {
    if (winner) return;

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newProgress = Math.min(p.progress + 2, 100);
          if (newProgress >= 100) {
            setWinner(p.name);
          }
          return { ...p, progress: newProgress };
        }
        return p;
      })
    );
  };

  const resetGame = () => {
    setPlayers((prev) => prev.map((p) => ({ ...p, progress: 0 })));
    setWinner(null);
  };

  if (players.length === 0) return <div>Loading...</div>;

  const myPlayer = players.find((p) => p.isMe);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-indigo-500 to-blue-600 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 max-w-xl w-full border border-white/20 space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 drop-shadow-sm">
          🏁 Running Race
        </h1>

        <div className="space-y-6">
          {players.map((player) => (
            <div key={player.id} className="space-y-2">
              <div className="flex justify-between">
                <span
                  className={`${
                    player.isMe ? "font-bold text-indigo-600" : "text-gray-700"
                  }`}
                >
                  {player.name}
                </span>
                <span className="text-sm text-gray-500">
                  {player.progress}%
                </span>
              </div>

              <div className="relative h-10 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-1/2 -translate-y-1/2 text-2xl transition-all duration-300 ${
                    player.isMe ? "text-indigo-600" : "text-gray-700"
                  }`}
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
            <div className="font-bold text-green-600 text-xl drop-shadow-sm">
              🎉 {winner} is the Winner!
            </div>
            <Button onClick={resetGame}>🔄 Play Again</Button>
          </div>
        )}

        {!winner && myPlayer && (
          <div className="text-center mt-4">
            <Button
              className="w-full sm:w-auto"
              variant={"destructive"}
              onClick={() => handleClick(myPlayer.id)}
            >
              Run!
            </Button>
          </div>
        )}

        {!winner && !myPlayer && (
          <div className="text-center mt-4 text-red-600 font-bold drop-shadow-sm">
            Та тоглогчдын жагсаалтад орсонгүй.
          </div>
        )}
      </div>
    </div>
  );
}
