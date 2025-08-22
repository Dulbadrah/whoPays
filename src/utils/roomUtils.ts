// roomUtils.ts

// Host шалгах helper
import { Participant } from "@/types/type";
import { Socket } from "socket.io-client";

export const isHost = (participant: Participant, index: number) => participant.isHost || index === 0;

// Participant устгах helper - Updated to use existing socket connection
export const removeParticipant = async (socket: Socket | null, roomCode: string, nickname: string) => {
  return new Promise<boolean>((resolve) => {
    if (!socket) {
      console.error('No socket connection available');
      resolve(false);
      return;
    }

    // Set up one-time listeners for the response
    const onError = (error: Error | { messege:string
    
    }) => {
      console.error('Error removing participant:', error);
      socket.off('room_state', onSuccess);
      resolve(false);
    };

    const onSuccess = () => {
      socket.off('error', onError);
      resolve(true);
    };

    socket.once('error', onError);
    socket.once('room_state', onSuccess);

    // Emit the remove participant event
    socket.emit('remove_participant', { 
      roomId: roomCode, 
      participantName: nickname 
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      socket.off('error', onError);
      socket.off('room_state', onSuccess);
      resolve(false);
    }, 5000);
  });
};
