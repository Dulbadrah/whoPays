"use client";

import { useState } from "react";

interface RoomDataResponse {
  room?: {
    id: number;
    code: string;
    roomname: string;
  };
  message?: string;
}

export default function JoinRoomForm() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [displayRoomName, setDisplayRoomName] = useState("");
  const [displayRoomCode, setDisplayRoomCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleJoin = async () => {
    setIsLoading(true);
    setIsSuccess(false);
    setErrorMessage("");

    const trimmed = code.trim();
    if (!/^\d{5}$/.test(trimmed)) {
      setErrorMessage("5 оронтой кодыг зөв оруулна уу.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:4200/room/${trimmed}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: RoomDataResponse = await response.json();

      if (response.ok && data.room) {
        setDisplayRoomName(data.room.roomname);
        setDisplayRoomCode(data.room.code);
        setIsSuccess(true);
        setCode("");
      } else {
        setErrorMessage(data.message || "Өгөгдсөн кодтой өрөө олдсонгүй.");
      }
    } catch (err) {
      console.error("Error joining room:", err);
      setErrorMessage(
        "Сервертэй холбогдоход алдаа гарлаа. Сервер ажиллаж байгаа эсэхийг шалгана уу."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4"
      style={{
        fontFamily: "Inter, sans-serif",
        background: "linear-gradient(to bottom right, #f0f9ff, #e0f2fe)",
      }}
    >
      <div className="bg-white p-8 w-full max-w-md rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Өрөөнд Нэгдэх
        </h1>

        <div className="mb-4">
          <label
            htmlFor="roomCode"
            className="block text-gray-700 text-sm font-medium mb-2"
          >
            5 оронтой өрөөний код:
          </label>
          <input
            type="text"
            id="roomCode"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="Жишээ: 12345"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isLoading}
            maxLength={5}
            inputMode="numeric"
          />
        </div>

        <button
          id="joinRoomBtn"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleJoin}
          disabled={isLoading}
        >
          {isLoading ? "Нэгдэж байна..." : "Өрөөнд Нэгдэх"}
        </button>

        {isSuccess && (
          <div
            id="result"
            className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg result-box"
          >
            <p className="text-lg font-semibold mb-2">Амжилттай нэгдсэн! 🎉</p>
            <p className="text-gray-700">
              Өрөөний нэр:{" "}
              <span className="font-bold text-blue-700">{displayRoomName}</span>
            </p>
            <p className="text-gray-700">
              Өрөөний код:{" "}
              <span className="font-bold text-blue-700 text-xl">{displayRoomCode}</span>
            </p>
          </div>
        )}

        {errorMessage && (
          <div
            id="error"
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative"
            role="alert"
          >
            <strong className="font-bold">Алдаа гарлаа!</strong>
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
