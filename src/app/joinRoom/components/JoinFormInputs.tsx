"use client";

import React from "react";

interface JoinFormInputsProps {
  code: string;
  setCode: (value: string) => void;
  nickname: string;
  setNickname: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
}

export const JoinFormInputs: React.FC<JoinFormInputsProps> = ({ code, setCode, nickname, setNickname, isLoading, onSubmit }) => (
  <form onSubmit={onSubmit}>
    <div className="mb-4">
      <label htmlFor="roomCode" className="block text-gray-700 text-sm font-medium mb-2">
        5 оронтой өрөөний код:
      </label>
      <input
        type="text"
        id="roomCode"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        disabled={isLoading}
        maxLength={5}
        inputMode="numeric"
        placeholder="Жишээ: 12345"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
      />
    </div>

    <div className="mb-4">
      <label htmlFor="nickname" className="block text-gray-700 text-sm font-medium mb-2">
        Таны хоч:
      </label>
      <input
        type="text"
        id="nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        disabled={isLoading}
        maxLength={20}
        placeholder="Жишээ: 'Батбаяр'"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
      />
    </div>

    <button
      type="submit"
      disabled={isLoading}
      className="w-full py-2 px-4 bg-green-400 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? "Нэгдэж байна..." : "Өрөөнд Нэгдэх"}
    </button>
  </form>
);
