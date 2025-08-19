// roomUtils.ts

// Host шалгах helper
export const isHost = (participant: any, index: number) => participant.isHost || index === 0;

// Participant устгах helper
export const removeParticipant = async (roomCode: string, nickname: string) => {
  try {
    const response = await fetch(`http://localhost:4200/room/${roomCode}/participants`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error removing participant:", error);
    return false;
  }
};
