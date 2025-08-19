"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createRoomSlug } from "../../../utils/roomSlug";

interface CreateRoomFormProps {
  onRoomCreated?: (room: { roomName: string; roomCode: string; roomId: number }) => void;
}

export default function CreateRoomForm({ onRoomCreated }: CreateRoomFormProps) {
  const [roomName, setRoomName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [displayRoomName, setDisplayRoomName] = useState<string>("");
  const [displayRoomCode, setDisplayRoomCode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
  }


  const handleCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSuccess(false);
    setIsLoading(true);

    if (!roomName.trim()) {
      setErrorMessage("Өрөөний нэрийг оруулна уу.");
      setIsLoading(false);
      return;
    }

    if (!nickname.trim()) {
      setErrorMessage("Таны хочыг оруулна уу.");
      setIsLoading(false);
      return;
    }
 

    try {
      // Check if room name is unique before creating
      const checkNameResponse = await fetch(`http://localhost:4200/room/check-name`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomName: roomName.trim() }),
      });

      if (!checkNameResponse.ok) {
        const checkData = await checkNameResponse.json();
        if (checkNameResponse.status === 409) {
          setErrorMessage("Энэ нэртэй өрөө аль хэдийн байна. Өөр нэр сонгоно уу.");
        } else {
          setErrorMessage(checkData.message || "Өрөөний нэрийг шалгахад алдаа гарлаа.");
        }
        setIsLoading(false);
        return;
      }

      // Room name is unique, proceed with creation
      const trimmedNickname = nickname.trim();
      const response = await fetch("http://localhost:4200/room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          roomName: roomName.trim(),
          hostNickname: trimmedNickname
        }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setDisplayRoomName(data.roomName);
        setDisplayRoomCode(data.roomCode);
        setIsSuccess(true);
        setRoomName("");
        setNickname("");
        
        // Store room data in localStorage for persistence
        const roomData = {
          roomName: data.roomName,
          roomCode: data.roomCode,
          roomId: data.roomId,
          nickname: trimmedNickname,
          participantId: data.hostParticipantId,
          isHost: true,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('currentRoom', JSON.stringify(roomData));
        localStorage.setItem('userNickname', trimmedNickname);
        
        if (typeof onRoomCreated === "function") {
          onRoomCreated({
            roomName: data.roomName,
            roomCode: data.roomCode,
            roomId: data.roomId,
          });
        }

      } else {
        if (response.status === 409) {
          setErrorMessage("Өрөө үүсгэх явцад давхардал илэрлээ. Дахин оролдоно уу.");
        } else {
          setErrorMessage(
            data.message || "Өрөө үүсгэхэд алдаа гарлаа. Дахин оролдоно уу."
          );
        }
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
    <>
      <div className="flex items-center justify-center min-h-screen p-4" style={{ fontFamily: "Inter, sans-serif", background: "linear-gradient(to bottom right, #f0f9ff, #e0f2fe)" }}>
        <form className="bg-white p-8 w-full max-w-md rounded-xl shadow-lg" onSubmit={handleCreateRoom}>
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Өрөө Үүсгэх</h1>
          <div className="mb-4">
            <label htmlFor="roomName" className="block text-gray-700 text-sm font-medium mb-2">Өрөөний нэр:</label>
            <input
              type="text"
              id="roomName"
              name="roomName"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Жишээ нь: 'Оройн хоолны өрөө'"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="nickname" className="block text-gray-700 text-sm font-medium mb-2">Таны хоч:</label>
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
            id="createRoomBtn"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
        
          >
            {isLoading ? "Үүсгэж байна..." : "Өрөө Үүсгэх"}
          </button>

          {errorMessage && (
            <div id="error" className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
              <strong className="font-bold">Алдаа гарлаа!</strong>
              <span className="block sm:inline" id="errorMessage">{errorMessage}</span>
            </div>
          )}
        </form>
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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Амжилттай үүслээ! 🎉</h3>
              <p className="text-gray-600 mb-6">Таны өрөө амжилттай үүсгэгдлээ</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Өрөөний нэр:</p>
                <p id="displayRoomName" className="font-bold text-blue-700 text-lg mb-3">{displayRoomName}</p>
                <p className="text-sm text-gray-600 mb-1">Өрөөний код:</p>
                <p id="displayRoomCode" className="font-bold text-blue-700 text-2xl">{displayRoomCode}</p>
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
