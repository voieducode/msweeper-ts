import { neighbours } from "./neighbours";
import { createMineField } from "./create";

export function populateTiles(
  initialPosition: number,
  width: number,
  height: number,
  mines: number
) {
  const numberTiles = width * height;
  let numberMines = 0;
  const newTiles = createMineField(numberTiles);

  while (numberMines < mines) {
    const newMinePosition = Math.floor(Math.random() * (numberTiles - 1));
    if (
      newMinePosition !== initialPosition &&
      newTiles[newMinePosition].content !== "💣"
    ) {
      newTiles[newMinePosition].content = "💣";
      numberMines += 1;
    }
  }

  for (let i = 0; i < numberTiles; i++) {
    if (newTiles[i].content === "💣") {
      continue;
    }
    const n = neighbours(i, width, height);
    const countMines = n.reduce(
      (totalMines, pos) =>
        pos !== -1 && newTiles[pos].content === "💣"
          ? totalMines + 1
          : totalMines,
      0
    );
    newTiles[i].content = countMines;
  }

  return newTiles;
}
