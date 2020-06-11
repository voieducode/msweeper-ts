import { ITile, Tile } from "./tile";

export const createMineField = (length: number, display = ""): ITile[] => {
  const tiles: ITile[] = [...Array(length)];
  for (let i = 0; i < length; i++) {
    tiles[i] = new Tile(i);
  }
  return tiles;
};
