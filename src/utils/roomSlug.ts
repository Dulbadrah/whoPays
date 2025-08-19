// Utility functions for handling room slugs that combine room name and code

export function createRoomSlug(roomName: string, roomCode: string): string {
  // Handle undefined or null roomName
  if (!roomName || typeof roomName !== 'string') {
    console.warn('Invalid room name provided to createRoomSlug:', roomName);
    roomName = 'unnamed-room';
  }

  // Handle undefined or null roomCode
  if (!roomCode || typeof roomCode !== 'string') {
    console.warn('Invalid room code provided to createRoomSlug:', roomCode);
    roomCode = '00000';
  }

  // Clean room name: remove special characters, convert to lowercase, replace spaces with hyphens
  const cleanRoomName = roomName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  return `${cleanRoomName}-${roomCode}`;
}

export function parseRoomSlug(slug: string): { roomName: string; roomCode: string } | null {
  if (!slug || typeof slug !== 'string') {
    console.warn('Invalid slug provided to parseRoomSlug:', slug);
    return null;
  }

  // Split by hyphen and get the last part as room code (assuming it's 5 digits)
  const parts = slug.split('-');
  if (parts.length < 2) {
    console.warn('Slug does not contain enough parts:', slug);
    return null;
  }

  // Find the room code (5 digits) - it should be at the end
  const roomCode = parts[parts.length - 1];
  if (!/^\d{5}$/.test(roomCode)) {
    console.warn('Invalid room code format in slug:', roomCode);
    return null;
  }

  // Everything else is the room name
  const roomNameParts = parts.slice(0, -1);
  let roomName = roomNameParts.join(' ');
  
  // Handle empty room name
  if (!roomName || roomName.trim() === '') {
    roomName = 'unnamed room';
  }

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
