import { ITile } from "./tile";
import { neighbours } from "./neighbours";

/*
Flood-fill (node, target-color, replacement-color):
 1. If target-color is equal to replacement-color, return.
 2. ElseIf the color of node is not equal to target-color, return.
 3. Else Set the color of node to replacement-color.
 4. Perform Flood-fill (one step to the south of node, target-color, replacement-color).
    Perform Flood-fill (one step to the north of node, target-color, replacement-color).
    Perform Flood-fill (one step to the west of node, target-color, replacement-color).
    Perform Flood-fill (one step to the east of node, target-color, replacement-color).
 5. Return.
*/
export function reveal(
  tiles: ITile[],
  pos: number,
  width: number,
  height: number,
  depth = 0
): ITile[] {
  const tile = tiles[pos];

  if (tile.revealed) return tiles;

  if (tile.content === "💣" || tile.flagged) return tiles;

  if (tile.isNumber()) {
    tile.display = tile.content.toString();
    tile.revealed = true;
  }

  if (tile.content === 0) {
    tile.display = " ";
    tile.revealed = true;
  } else if (depth > 1) {
    return tiles;
  }

  const [left, right, up, down] = neighbours(pos, width, height);

  if (down >= 0) reveal(tiles, down, width, height, depth + 1);
  if (up >= 0) reveal(tiles, up, width, height, depth + 1);
  if (left >= 0) reveal(tiles, left, width, height, depth + 1);
  if (right >= 0) reveal(tiles, right, width, height, depth + 1);

  return tiles;
}

export function explode(tiles: ITile[]): ITile[] {
  return tiles.map((m) => m.explode());
}

export function revealBombs(tiles: ITile[]) {
  return tiles.map((m) => m.revealBomb());
}

export function areAllSafeTilesRevealed(
  tiles: ITile[],
  mines: number
): boolean {
  const revealed = tiles.reduce(
    (r: number, mine: ITile) => (mine.revealed ? r + 1 : r),
    0
  );
  // Winning condition = all safe tiles are revealead
  return revealed === tiles.length - mines;
}

export function markForNumberReveal(
  startPosition: number,
  tiles: ITile[],
  mark: boolean,
  width: number,
  height: number
) {
  const clone = tiles.map((m) => m.clone());
  const validNeighbours = neighbours(startPosition, width, height).filter(
    (pos) => pos >= 0
  );

  validNeighbours.forEach((pos) => {
    const t = clone[pos];
    if (t && !t.revealed) {
      t.markedForNumberReveal = mark;
    }
  });

  return clone;
}

export function revealSafeNumbers(
  startPosition: number,
  tiles: ITile[],
  width: number,
  height: number
): ITile[] {
  const validNeighbours = neighbours(startPosition, width, height)
    .filter((pos) => pos >= 0)
    .map((pos) => tiles[pos]);

  const unsafeNeighbours = validNeighbours.reduce(
    (unsafe, m) => (m.isUnsafe() ? unsafe + 1 : unsafe),
    0
  );

  if (unsafeNeighbours > 0) {
    return tiles;
  }

  return tiles.map((m) => {
    const copy = m.clone();
    if (!copy.revealed && copy.isNumber()) {
      copy.display = copy.content.toString();
      copy.revealed = true;
    }
    return copy;
  });
}
