"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateFormInputs } from "./CreateFormInput";
import { checkRoomNameUnique, createRoom } from "@/utils/roomApi";
import { createRoomSlug } from "@/utils/roomSlug";
import { CreateRoomFormProps } from "@/app/types/type";

export default function CreateRoom({ onRoomCreated }: CreateRoomFormProps) {
  const [roomName, setRoomName] = useState("");
  const [nickname, setNickname] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const trimmedRoomName = roomName.trim();
    const trimmedNickname = nickname.trim();

    if (!trimmedRoomName) {
      setErrorMessage("Өрөөний нэрийг оруулна уу.");
      setIsLoading(false);
      return;
    }
    if (!trimmedNickname) {
      setErrorMessage("Таны хочийг оруулна уу.");
      setIsLoading(false);
      return;
    }

    try {
      // 1️⃣ Check if room name is unique
      const checkRes = await checkRoomNameUnique(trimmedRoomName);
      if (!checkRes.ok) {
        const data = await checkRes.json();
        setErrorMessage(
          checkRes.status === 409
            ? "Энэ нэртэй өрөө аль хэдийн байна. Өөр нэр сонгоно уу."
            : data.message || "Өрөөний нэрийг шалгахад алдаа гарлаа."
        );
        setIsLoading(false);
        return;
      }

      // 2️⃣ Create room
      const createRes = await createRoom(trimmedRoomName, trimmedNickname);
      if (!createRes.ok) {
        const data = await createRes.json();
        setErrorMessage(
          createRes.status === 409
            ? "Өрөө үүсгэх явцад давхардал илэрлээ."
            : data.message || "Өрөө үүсгэхэд алдаа гарлаа."
        );
        setIsLoading(false);
        return;
      }

      const result = await createRes.json();

      // 3️⃣ Store room data in localStorage
      localStorage.setItem(
        "currentRoom",
        JSON.stringify({
          roomName: result.roomName,
          roomCode: result.roomCode,
          roomId: result.roomId,
          nickname: trimmedNickname,
          participantId: result.hostParticipantId,
          isHost: true,
          createdAt: new Date().toISOString(),
        })
      );
      localStorage.setItem("userNickname", trimmedNickname);

      // 4️⃣ Callback for parent component (optional)
      if (onRoomCreated) {
        onRoomCreated({
          roomName: result.roomName,
          roomCode: result.roomCode,
          roomId: result.roomId,
        });
      }

      // 5️⃣ Navigate to lobby
      const roomSlug = createRoomSlug(result.roomName, result.roomCode);
      const params = new URLSearchParams({ nickname: trimmedNickname });
      router.push(`/lobby/${roomSlug}?${params.toString()}`);
    } catch (err) {
      console.error("Error creating room:", err);
      setErrorMessage("Сервертэй холбогдоход алдаа гарлаа.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4"
      style={{ fontFamily: "Inter, sans-serif", background: "linear-gradient(to bottom right, #f0f9ff, #e0f2fe)" }}
    >
      <form
        className="bg-white p-8 w-full max-w-md rounded-xl shadow-lg"
        onSubmit={handleCreateRoom}
      >
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Өрөө Үүсгэх</h1>

        {/* Input fields modular */}
        <CreateFormInputs
          roomName={roomName}
          setRoomName={setRoomName}
          nickname={nickname}
          setNickname={setNickname}
          isLoading={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Үүсгэж байна..." : "Өрөө Үүсгэх"}
        </button>

        {errorMessage && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-4"
            role="alert"
          >
            <strong className="font-bold">Алдаа гарлаа! </strong>
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
      </form>
    </div>
  );
}
