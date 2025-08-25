"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { Button } from "@/components/ui/button";

type Player = "X" | "O";
type Board = (Player | null)[];
type Winner = Player | "tie" | null;

const SIZE = 5;

const socket = io("http://localhost:4200"); // backend серверийн хаяг

export default function Page() {
  const [board, setBoard] = useState<Board>(Array(SIZE * SIZE).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Winner>(null);

  const room = "room123"; // жишээ болгож тогтмол код өглөө, чи динамик болгож болно

  useEffect(() => {
    socket.emit("joinTicTacToe", room);

    socket.on("ticTacToeState", (state: { board: Board; currentPlayer: Player; winner: Winner }) => {
      setBoard(state.board);
      setCurrentPlayer(state.currentPlayer);
      setWinner(state.winner);
    });

    return () => {
      socket.off("ticTacToeState");
    };
  }, []);

  const handleCellClick = (index: number) => {
    if (winner || board[index]) return;
    socket.emit("makeTicTacToeMove", { room, index });
  };

  const resetGame = () => {
    socket.emit("resetTicTacToe", room);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-4">🦌 Арслан vs Буга</h1>

      {winner ? (
        winner === "tie" ? (
          <p className="text-xl text-yellow-600">🤝 Тэнцлээ!</p>
        ) : (
          <p className="text-xl text-green-600">
            {winner === "X" ? "🦌 Буга хожлоо!" : "🦁 Арслан хожлоо!"}
          </p>
        )
      ) : (
        <p className="mb-2">
          Одоогийн тоглогч: {currentPlayer === "X" ? "🦌 Буга" : "🦁 Арслан"}
        </p>
      )}

      <div className="grid grid-cols-5 gap-2 mb-4">
        {board.map((value, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            disabled={!!value || !!winner}
            className="w-14 h-14 flex items-center justify-center bg-white shadow rounded-lg text-2xl"
          >
            {value === "X" && "🦌"}
            {value === "O" && "🦁"}
          </button>
        ))}
      </div>

      <Button onClick={resetGame}>🔄 Шинэ тоглоом</Button>
    </div>
  );
}
