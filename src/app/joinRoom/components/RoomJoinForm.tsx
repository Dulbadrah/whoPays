"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoomSlug } from "../../../utils/roomSlug";
import {
  checkRoomExists,
  checkNicknameAvailable,
  addParticipantToRoom,
} from "../../../utils/roomApi";
import { JoinFormInputs } from "./JoinFormInputs";

export default function JoinRoomForm() {
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [roomData, setRoomData] = useState<{ name: string; code: string } | null>(null);

  const router = useRouter();

  // Navigation function
  const handleNavigateToLobby = (roomName: string, roomCode: string) => {
    const storedNickname = localStorage.getItem("userNickname") || "";
    const roomSlug = createRoomSlug(roomName, roomCode);
    const params = new URLSearchParams({ nickname: storedNickname });
    router.push(`/lobby/${roomSlug}?${params.toString()}`);
  };

  // Form submit
  const handleJoin = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const trimmedCode = code.trim();
    const trimmedNickname = nickname.trim();

    if (!/^\d{5}$/.test(trimmedCode)) {
      setErrorMessage("5 оронтой кодыг зөв оруулна уу.");
      setIsLoading(false);
      return;
    }
    if (!trimmedNickname) {
      setErrorMessage("Таны хочийг оруулна уу.");
      setIsLoading(false);
      return;
    }

    try {
      // 1️⃣ Room exists check
      const { ok, data } = await checkRoomExists(trimmedCode);
      if (!ok || !data.room) {
        setErrorMessage(data.message || "Өгөгдсөн кодтой өрөө олдсонгүй.");
        setIsLoading(false);
        return;
      }

      // 2️⃣ Nickname availability check
      const nicknameRes = await checkNicknameAvailable(trimmedCode, trimmedNickname);
      if (!nicknameRes.ok) {
        const errData = await nicknameRes.json();
        setErrorMessage(
          nicknameRes.status === 409
            ? "Энэ хочийг аль хэдийн ашиглаж байна."
            : errData.message || "Хочийг шалгахад алдаа гарлаа."
        );
        setIsLoading(false);
        return;
      }

      // 3️⃣ Add participant
      const addRes = await addParticipantToRoom(trimmedCode, trimmedNickname);
      if (!addRes.ok) {
        const errData = await addRes.json();
        setErrorMessage(
          addRes.status === 409
            ? "Энэ хочийг аль хэдийн ашиглаж байна."
            : errData.message || "Өрөөнд нэгдэхэд алдаа гарлаа."
        );
        setIsLoading(false);
        return;
      }

      const participantData = await addRes.json();
      const roomName = data.room?.roomname || "";
      const roomCode = data.room?.code || "";

      // 4️⃣ Save room + nickname in localStorage
      localStorage.setItem(
        "currentRoom",
        JSON.stringify({
          roomName,
          roomCode,
          roomId: data.room.id,
          nickname: trimmedNickname,
          participantId: participantData.participantId,
          isHost: false,
          createdAt: new Date().toISOString(),
        })
      );
      localStorage.setItem("userNickname", trimmedNickname);

      setRoomData({ name: roomName, code: roomCode });
      setIsLoading(false);

      // 5️⃣ Navigate to lobby
      handleNavigateToLobby(roomName, roomCode);
    } catch (err) {
      console.error("Error joining room:", err);
      setErrorMessage("Сервертэй холбогдоход алдаа гарлаа.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4"
      style={{ fontFamily: "Inter, sans-serif", background: "linear-gradient(to bottom right, #f0f9ff, #e0f2fe)" }}
    >
      <div className="bg-white p-8 w-full max-w-md rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Өрөөнд Нэгдэх</h1>

        {/* Input form component */}
        <JoinFormInputs
          code={code}
          setCode={setCode}
          nickname={nickname}
          setNickname={setNickname}
          isLoading={isLoading}
          onSubmit={handleJoin}
        />

        {/* Error message */}
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-4" role="alert">
            <strong className="font-bold">Алдаа гарлаа! </strong>
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
