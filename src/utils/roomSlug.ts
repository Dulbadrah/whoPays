// Utility functions for handling room slugs that combine room name and code

export function createRoomSlug(roomName: string, roomCode: string): string {
  // Validate inputs
  if (!roomCode || !/^\d{5}$/.test(roomCode)) {
    throw new Error('Room code must be exactly 5 digits');
  }

  // Clean room name: remove special characters, convert to lowercase, replace spaces with hyphens
  const cleanRoomName = roomName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  // If cleaning resulted in empty string, use default name
  const finalRoomName = cleanRoomName || 'room';

  return `${finalRoomName}-${roomCode}`;
}

export function parseRoomSlug(slug: string): { roomName: string; roomCode: string } | null {
  if (!slug || typeof slug !== 'string') return null;

  // Trim the slug
  slug = slug.trim();
  if (!slug) return null;

  // Split by hyphen and get the last part as room code (assuming it's 5 digits)
  const parts = slug.split('-').filter(part => part.length > 0); // Filter out empty parts
  if (parts.length < 2) return null;

  // Find the room code (5 digits) - it should be at the end
  const roomCode = parts[parts.length - 1];
  if (!/^\d{5}$/.test(roomCode)) return null;

  // Everything else is the room name
  const roomNameParts = parts.slice(0, -1);
  if (roomNameParts.length === 0) return null;
  
  const roomName = roomNameParts.join(' ');

  return {
    roomName: roomName.charAt(0).toUpperCase() + roomName.slice(1), // Capitalize first letter
    roomCode
  };
}

/**
 * Validates if a slug is in the correct format
 */
export function isValidRoomSlug(slug: string): boolean {
  return parseRoomSlug(slug) !== null;
}
