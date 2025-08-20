"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Assuming these types are defined in a separate file (e.g., types/type.ts)
// For demonstration, let's define them inline here if you don't have them yet:
interface RoomForContext {
  id: number;
  roomCode: string;
  roomName: string;
  // Add any other room properties you need
}

interface RoomContextType {
  room: RoomForContext | null;
  setRoom: React.Dispatch<React.SetStateAction<RoomForContext | null>>;
}


const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [room, setRoom] = useState<RoomForContext | null>(null);

  // Effect to load room from localStorage on initial render
  useEffect(() => {
    try {
      const stored = localStorage.getItem("currentRoom");
      if (stored) {
        setRoom(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to parse currentRoom from localStorage:", err);
      // Optionally clear invalid data if parsing fails
      localStorage.removeItem("currentRoom");
    }
  }, []); // Empty dependency array means this runs once on mount

  // Effect to save room to localStorage whenever the room state changes
  useEffect(() => {
    if (room) {
      localStorage.setItem("currentRoom", JSON.stringify(room));
    } else {
      // If room is null, remove it from localStorage
      localStorage.removeItem("currentRoom");
    }
  }, [room]); // Dependency array includes 'room' so it runs on 'room' changes

  return (
    <RoomContext.Provider value={{ room, setRoom }}>
      {children}
    </RoomContext.Provider>
  );
};

// Custom hook to consume the RoomContext
export const useRoom = () => {
  const ctx = useContext(RoomContext);
  if (ctx === undefined) { // Check for undefined to ensure it's used within the Provider
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return ctx;
};
