"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoomSlug } from "../../../utils/roomSlug";

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
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [displayRoomName, setDisplayRoomName] = useState("");
  const [displayRoomCode, setDisplayRoomCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const router = useRouter();

  const handleNavigateToLobby = () => {
    // Navigate to lobby using new slug format that includes room name and code
    // Use displayRoomName and get nickname from localStorage since state gets cleared
    const storedNickname = localStorage.getItem('userNickname') || '';
    const roomSlug = createRoomSlug(displayRoomName, displayRoomCode);
    const params = new URLSearchParams({
      nickname: storedNickname
    });
    router.push(`/lobby/${roomSlug}?${params.toString()}`);
  };

  const handleJoin = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);
    setErrorMessage("");

    const trimmed = code.trim();
    if (!/^\d{5}$/.test(trimmed)) {
      setErrorMessage("5 оронтой кодыг зөв оруулна уу.");
      setIsLoading(false);
      return;
    }

    if (!nickname.trim()) {
      setErrorMessage("Таны хочыг оруулна уу.");
      setIsLoading(false);
      return;
    }

    try {
      // First, check if room exists
      const checkRoomResponse = await fetch(`http://localhost:4200/room/${trimmed}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const roomData: RoomDataResponse = await checkRoomResponse.json();

      if (!checkRoomResponse.ok || !roomData.room) {
        setErrorMessage(roomData.message || "Өгөгдсөн кодтой өрөө олдсонгүй.");
        setIsLoading(false);
        return;
      }

      // Room exists, now check if nickname is available in this room
      const trimmedNickname = nickname.trim();
      const checkNicknameResponse = await fetch(`http://localhost:4200/room/${trimmed}/check-nickname`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: trimmedNickname
        }),
      });

      if (!checkNicknameResponse.ok) {
        const nicknameError = await checkNicknameResponse.json();
        if (checkNicknameResponse.status === 409) {
          setErrorMessage("Энэ хочийг ашиглан өрөөнд аль хэдийн нэгдсэн байна. Өөр хоч сонгоно уу.");
        } else {
          setErrorMessage(nicknameError.message || "Хочийг шалгахад алдаа гарлаа.");
        }
        setIsLoading(false);
        return;
      }

      // Nickname is available, now add participant to the room
      const addParticipantResponse = await fetch(`http://localhost:4200/room/${trimmed}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: trimmedNickname
        }),
      });

      if (addParticipantResponse.ok) {
        const participantData = await addParticipantResponse.json();
        
        setDisplayRoomName(roomData.room.roomname);
        setDisplayRoomCode(roomData.room.code);
        setIsSuccess(true);
        setCode("");
        setNickname("");
        
        // Store room data in localStorage for persistence
        const storedRoomData = {
          roomName: roomData.room.roomname,
          roomCode: roomData.room.code,
          roomId: roomData.room.id,
          nickname: trimmedNickname,
          participantId: participantData.participantId,
          isHost: false,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('currentRoom', JSON.stringify(storedRoomData));
        localStorage.setItem('userNickname', trimmedNickname);
      } else {
        const errorData = await addParticipantResponse.json();
        if (addParticipantResponse.status === 409) {
          setErrorMessage("Энэ хочийг ашиглан өрөөнд аль хэдийн нэгдсэн байна.");
        } else {
          setErrorMessage(errorData.message || "Өрөөнд нэгдэхэд алдаа гарлаа.");
        }
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
    <>
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
          <form onSubmit={handleJoin}>
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
                name="roomCode"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Жишээ: 12345"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isLoading}
                maxLength={5}
                inputMode="numeric"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="nickname"
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Таны хоч:
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Жишээ нь: 'Батбаяр'"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={isLoading}
                maxLength={20}
              />
            </div>
            <button
              id="joinRoomBtn"
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Нэгдэж байна..." : "Өрөөнд Нэгдэх"}
            </button>
          </form>

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

      {/* Success Popup Modal */}
      {isSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Амжилттай нэгдсэн! 🎉</h3>
              <p className="text-gray-600 mb-6">Та өрөөнд амжилттай нэгдлээ</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Өрөөний нэр:</p>
                <p className="font-bold text-blue-700 text-lg mb-3">{displayRoomName}</p>
                <p className="text-sm text-gray-600 mb-1">Өрөөний код:</p>
                <p className="font-bold text-blue-700 text-2xl">{displayRoomCode}</p>
              </div>

              <div className="flex flex-col space-y-3">
                <button 
                  onClick={handleNavigateToLobby}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Лобид орох
                </button>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Хаах
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
