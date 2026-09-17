export const ROOM_TYPES = [
  "Solteiro",
  "Casal",
  "Duplo",
  "Suite",
  "Familiar",
  "Executivo",
  "Deluxe"
] as const;

export type RoomType = (typeof ROOM_TYPES)[number];
