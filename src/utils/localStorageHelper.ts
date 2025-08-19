export interface StoredRoomData {
  roomName: string;
  roomCode: string;
  roomId: number;
  nickname: string;
  createdAt: string;
}

export const getStoredRoomData = (roomCode: string): StoredRoomData | null => {
  try {
    const stored = localStorage.getItem("currentRoom");
    if (!stored) return null;
    const parsed: StoredRoomData = JSON.parse(stored);
    return parsed.roomCode === roomCode ? parsed : null;
  } catch (e) {
    console.error("Error parsing stored room data:", e);
    return null;
  }
};

export const storeRoomData = (data: StoredRoomData) => {
  localStorage.setItem("currentRoom", JSON.stringify(data));
  localStorage.setItem("userNickname", data.nickname);
};

export const getNickname = (searchParams: URLSearchParams) => {
  return searchParams.get("nickname") || localStorage.getItem("userNickname");
};
