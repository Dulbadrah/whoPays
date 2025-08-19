// src/utils/roomApi.ts
export interface RoomDataResponse {
  room?: {
    id: number;
    code: string;
    roomname: string;
  };
  message?: string;
}

export const createRoom = async (roomName: string, hostNickname: string) => {
  try {
    return await fetch(`http://localhost:4200/room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomName, hostNickname }),
    });
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
}
export const checkRoomExists = async (code: string) => {
  const res = await fetch(`http://localhost:4200/room/${code}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data: RoomDataResponse = await res.json();
  return { ok: res.ok, data };
};

export const checkRoomNameUnique = async (roomName: string) => {
  try {
    return await fetch(`http://localhost:4200/room/check-name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomName }),
    });
  } catch (error) {
    console.error("Error checking room name:", error);
    throw error;
  }
};




export const checkNicknameAvailable = async (roomCode: string, nickname: string) => {
  const res = await fetch(`http://localhost:4200/room/${roomCode}/check-nickname`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname }),
  });
  return res;
};

export const addParticipantToRoom = async (roomCode: string, nickname: string) => {
  const res = await fetch(`http://localhost:4200/room/${roomCode}/participants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname }),
  });
  return res;
};
