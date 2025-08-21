"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Player = "X" | "O" | "tie" | null;
type Board = Player[];

const SIZE = 5;
const WIN_LENGTH = 4;

export default function Page() {
  const [board, setBoard] = useState<Board>(Array(SIZE * SIZE).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<Player>(null);

  const getCell = (x: number, y: number) => board[y * SIZE + x];

  const checkWinner = (newBoard: Board): Player => {
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const player = getCell(x, y);
        if (!player) continue;

        if (x + WIN_LENGTH - 1 < SIZE) {
          let win = true;
          for (let i = 1; i < WIN_LENGTH; i++)
            if (getCell(x + i, y) !== player) win = false;
          if (win) return player;
        }

        if (y + WIN_LENGTH - 1 < SIZE) {
          let win = true;
          for (let i = 1; i < WIN_LENGTH; i++)
            if (getCell(x, y + i) !== player) win = false;
          if (win) return player;
        }

        if (x + WIN_LENGTH - 1 < SIZE && y + WIN_LENGTH - 1 < SIZE) {
          let win = true;
          for (let i = 1; i < WIN_LENGTH; i++)
            if (getCell(x + i, y + i) !== player) win = false;
          if (win) return player;
        }

        if (x - (WIN_LENGTH - 1) >= 0 && y + WIN_LENGTH - 1 < SIZE) {
          let win = true;
          for (let i = 1; i < WIN_LENGTH; i++)
            if (getCell(x - i, y + i) !== player) win = false;
          if (win) return player;
        }
      }
    }

    return newBoard.every((cell) => cell !== null) ? "tie" : null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  const resetGame = () => {
    setBoard(Array(SIZE * SIZE).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🦌 Буга Тоглоом
          </h1>
          <p className="text-lg text-gray-600">Tic Tac Toe</p>
        </div>

        <div className="text-center mb-6">
          {!winner && (
            <p className="text-xl font-semibold text-gray-700">
              Одоогийн тоглогч:{" "}
              <span className="text-2xl">
                {currentPlayer === "X" ? "🦌" : "🦁"}
              </span>{" "}
              <span className="text-blue-600">
                {currentPlayer === "X" ? "Буга" : "Дугуй"}
              </span>
            </p>
          )}

          {winner && (
            <div className="mb-4">
              {winner === "tie" ? (
                <p className="text-2xl font-bold text-yellow-600">
                  🤝 Тэнцсэн!
                </p>
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  {winner === "X" ? "🦌 Буга хожлоо!" : "🦁 Дугуй хожлоо!"}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-5 gap-2 mb-6 bg-gray-200 p-2 rounded-xl w-full max-w-md mx-auto">
          {board.map((value, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className={`
        w-full aspect-square bg-white rounded-lg shadow-md flex items-center justify-center text-3xl md:text-4xl font-bold
        transition-all duration-200 hover:shadow-lg hover:scale-105
        ${
          !value && !winner
            ? "hover:bg-blue-50 cursor-pointer"
            : "cursor-default"
        }
        ${value ? "bg-gray-50" : ""}
      `}
              disabled={!!value || !!winner}
            >
              {value === "X" && "🦌"}
              {value === "O" && "🦁"}
            </button>
          ))}
        </div>

        <div className="text-center space-y-4">
          <Button
            onClick={resetGame}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-lg font-semibold rounded-xl"
          >
            🔄 Шинэ тоглоом
          </Button>

          <div className="text-sm text-gray-600 space-y-1">
            <p>🦌 = X тоглогч</p>
            <p>🦁 = O тоглогч</p>
            <p className="font-medium">
              Дөрвөн дараалсан нүд цуглуулж хожоорой!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
