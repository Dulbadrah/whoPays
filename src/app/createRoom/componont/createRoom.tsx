"use client";
import { useState } from "react";
 
interface CreateRoomResponse {
  message: string;
  roomCode: string;
  roomId: number;
  roomName: string;
}
 
export default function CreateRoomForm() {
  const [roomName, setRoomName] = useState<string>("");
  const [displayRoomName, setDisplayRoomName] = useState<string>("");
  const [displayRoomCode, setDisplayRoomCode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
 
  const handleCreateRoom = async () => {
    // Reset messages and states
    setErrorMessage("");
    setIsSuccess(false);
    setIsLoading(true);
 
    if (!roomName.trim()) {
      setErrorMessage("Өрөөний нэрийг оруулна уу.");
      setIsLoading(false);
      return;
    }
 
    try {
      const response = await fetch("http://localhost:4200/room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomName: roomName.trim() }),
      });
      console.log("reeees:", response);
      const data: CreateRoomResponse = await response.json();
      console.log("dtaaaaa", data);
      if (response.ok) {
        setDisplayRoomName(data.roomName);
        setDisplayRoomCode(data.roomCode);
        setIsSuccess(true);
        setRoomName("");
      } else {
        setErrorMessage(
          data.message || "Өрөө үүсгэхэд алдаа гарлаа. Дахин оролдоно уу."
        );
      }
    } catch (error) {
      setErrorMessage(
        "Сервертэй холбогдоход алдаа гарлаа. Сервер ажиллаж байгаа эсэхийг шалгана уу."
      );
      console.error("Error creating room:", error);
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
        {" "}
      
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Өрөө Үүсгэх
        </h1>
        <div className="mb-4">
          <label
            htmlFor="roomName"
            className="block text-gray-700 text-sm font-medium mb-2"
          >
            Өрөөний нэр:
          </label>
          <input
            type="text"
            id="roomName"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="Жишээ нь: 'Оройн хоолны өрөө'"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button
          id="createRoomBtn"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCreateRoom}
          disabled={isLoading}
        >
          {isLoading ? "Үүсгэж байна..." : "Өрөө Үүсгэх"}
        </button>
        {isSuccess && (
          <div
            id="result"
            className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg result-box"
          >
            <p className="text-lg font-semibold mb-2">Амжилттай үүслээ! 🎉</p>
            <p className="text-gray-700">
              Өрөөний нэр:{" "}
              <span id="displayRoomName" className="font-bold text-blue-700">
                {displayRoomName}
              </span>
            </p>
            <p className="text-gray-700">
              Өрөөний код:{" "}
              <span
                id="displayRoomCode"
                className="font-bold text-blue-700 text-xl"
              >
                {displayRoomCode}
              </span>
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
            <span className="block sm:inline" id="errorMessage">
              {errorMessage}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}