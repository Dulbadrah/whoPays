import { createApiUrl } from "./api";
import { Room, RoomDataResponse } from "@/types/type";


export const createRoom = async (roomName: string, hostNickname: string) => {
  try {
    return await fetch(createApiUrl("/room"), {
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
  const res = await fetch(createApiUrl(`/room/${code}`), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data: RoomDataResponse = await res.json();
  return { ok: res.ok, data };
};

export const checkRoomNameUnique = async (roomName: string) => {
  try {
    return await fetch(createApiUrl("/room/check-name"), {
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
  const res = await fetch(createApiUrl(`/room/${roomCode}/check-nickname`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname }),
  });
  return res;
};

export const addParticipantToRoom = async (roomCode: string, nickname: string) => {
  const res = await fetch(createApiUrl(`/room/${roomCode}/participants`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname }),
  });
  return res;
};

export const fetchRoomData = async (roomCode: string) => {
  try {
    const res = await fetch(createApiUrl(`/room/${roomCode}`), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Error fetching room data:", error);
    throw error;
  }
};

export const pollRoomData = (roomCode: string, callback: (room: Room) => void, ) => {
  const id = setInterval(async () => {
    try {
      const data = await fetchRoomData(roomCode);
      if (data?.room) callback(data.room);
    } catch (e) {
      console.error("Polling error:", e);
    }
  } );

  return () => clearInterval(id);
};


const roomApi = {
  createRoom: async (roomName: string, hostNickname: string) => {
    const res = await fetch(createApiUrl("/room"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName, hostNickname }),
    });
    return res.json();
  },

  checkRoomExists: async (code: string) => {
    const res = await fetch(createApiUrl(`/room/${code}`), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data: RoomDataResponse = await res.json();
    return { ok: res.ok, data };
  },

  checkRoomNameUnique: async (roomName: string) => {
    const res = await fetch(createApiUrl("/room/check-name"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName }),
    });
    return res.json();
  },

  checkNicknameAvailable: async (roomCode: string, nickname: string) => {
    const res = await fetch(createApiUrl(`/room/${roomCode}/check-nickname`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname }),
    });
    return res;
  },

  addParticipantToRoom: async (roomCode: string, nickname: string) => {
    const res = await fetch(createApiUrl(`/room/${roomCode}/participants`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname }),
    });
    return res;
  },

  fetchRoomData: async (roomCode: string) => {
    const res = await fetch(createApiUrl(`/room/${roomCode}`), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  pollRoomData: (roomCode: string, callback: (room: Room) => void, interval = 3000) => {
    const id = setInterval(async () => {
      try {
        const data = await roomApi.fetchRoomData(roomCode);
        if (data?.room) callback(data.room);
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, interval);

    return () => clearInterval(id);
  },
};

export default roomApi;
