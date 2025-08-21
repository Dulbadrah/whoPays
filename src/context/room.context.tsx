"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface RoomForContext {
  id: number;
  roomCode: string;
  roomName: string;
}

interface RoomContextType {
  room: RoomForContext | null;
  setRoom: React.Dispatch<React.SetStateAction<RoomForContext | null>>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [room, setRoom] = useState<RoomForContext | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("currentRoom");
      if (stored) {
        setRoom(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to parse currentRoom from localStorage:", err);

      localStorage.removeItem("currentRoom");
    }
  }, []);

  useEffect(() => {
    if (room) {
      localStorage.setItem("currentRoom", JSON.stringify(room));
    } else {
      localStorage.removeItem("currentRoom");
    }
  }, [room]);

  return (
    <RoomContext.Provider value={{ room, setRoom }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const ctx = useContext(RoomContext);
  if (ctx === undefined) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return ctx;
};
