"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoomSlug } from "../../../utils/roomSlug";

interface Participant {
  id: number;
  name: string;
  createdAt: string;
}

interface RoomData {
  id: number;
  name: string;
  code: string;
}

interface JoinResponse {
  room?: RoomData;
  participant?: Participant;
  message?: string;
}

export default function JoinRoomForm() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [displayRoom, setDisplayRoom] = useState<RoomData | null>(null);
  const [displayParticipant, setDisplayParticipant] =
    useState<Participant | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleJoin = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);
    setErrorMessage("");

    if (!/^\d{5}$/.test(code.trim())) {
      setErrorMessage("5 оронтой кодыг зөв оруулна уу.");
      setIsLoading(false);
      return;
    }
    if (!participantName.trim()) {
      setErrorMessage("Оролцогчийн нэрийг оруулна уу.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:4200/participant/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: code.trim(),
          participantName: participantName.trim(),
        }),
      });

      const data: JoinResponse = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || `Алдаа гарлаа (${response.status})`);
        setIsLoading(false);
        return;
      }

      if (data.room && data.participant) {
        setDisplayRoom(data.room);
        setDisplayParticipant(data.participant);
        setIsSuccess(true);
        setCode("");
        setParticipantName("");
      } else {
        setErrorMessage(
          "Өрөөний мэдээлэл эсвэл participant мэдээлэл олдсонгүй."
        );
      }
    } catch (err) {
      console.error("Error joining room:", err);
      setErrorMessage(
        "Сервертэй холбогдож чадсангүй. Сервер ажиллаж байгаа эсэхийг шалгана уу."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const goToLobby = () => {
    if (displayRoom && displayParticipant) {
      // Store room data with isHost: false for joined participants
      localStorage.setItem(
        "currentRoom",
        JSON.stringify({
          roomName: displayRoom.name,
          roomCode: displayRoom.code,
          roomId: displayRoom.id,
          nickname: displayParticipant.name,
          isHost: false, // Joined participants are not hosts
          createdAt: new Date().toISOString(),
        })
      );
      localStorage.setItem("userNickname", displayParticipant.name);

      // Create room slug and navigate
      const roomSlug = createRoomSlug(displayRoom.name, displayRoom.code);
      const params = new URLSearchParams({ nickname: displayParticipant.name });
      router.push(`/lobby/${roomSlug}?${params.toString()}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-8 w-full max-w-md rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Өрөөнд Нэгдэх
        </h1>

        {!isSuccess ? (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label
                htmlFor="roomCode"
                className="block text-gray-700 mb-2 font-medium"
              >
                5 оронтой өрөөний код:
              </label>
              <input
                type="text"
                id="roomCode"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Жишээ: 12345"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isLoading}
                maxLength={5}
                inputMode="numeric"
              />
            </div>

            <div>
              <label
                htmlFor="participantName"
                className="block text-gray-700 mb-2 font-medium"
              >
                Таны нэр:
              </label>
              <input
                type="text"
                id="participantName"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="Жишээ: 'Бат-Эрдэнэ'"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Нэгдэж байна..." : "Өрөөнд Нэгдэх"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="mt-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-center animate-pulse">
              🎉 Та амжилттай нэгдлээ! <br />
              Өрөө: <span className="font-bold">{displayRoom?.name}</span>{" "}
              <br />
              Код: <span className="font-bold">{displayRoom?.code}</span> <br />
              Таны нэр:{" "}
              <span className="font-bold">{displayParticipant?.name}</span>
            </div>
            <button
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              onClick={goToLobby}
            >
              🏠 Lobby руу орох
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
            <strong className="font-bold">Алдаа:</strong> {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
