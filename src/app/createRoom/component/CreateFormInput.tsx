// src/components/CreateFormInputs.tsx
"use client";

import React from "react";

interface CreateFormInputsProps {
  roomName: string;
  setRoomName: (value: string) => void;
  nickname: string;
  setNickname: (value: string) => void;
  isLoading: boolean;
}

export const CreateFormInputs: React.FC<CreateFormInputsProps> = ({
  roomName,
  setRoomName,
  nickname,
  setNickname,
  isLoading,
}) => {
  return (
    <>
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
          name="roomName"
          placeholder="Жишээ нь: 'Оройн хоолны өрөө'"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          disabled={isLoading}
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
          placeholder="Жишээ нь: 'Батбаяр'"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          disabled={isLoading}
          maxLength={20}
        />
      </div>
    </>
  );
};
