import React, { useState } from "react";
import "./Game.css";

interface ITile {
  id: number;
  content: string | number;
  display: string;
  revealed: boolean;
  flagged: boolean;
}

const createMineField = (length: number, display = ""): ITile[] => {
  const tiles: ITile[] = [...Array(length)];
  for (let i = 0; i < length; i++) {
    tiles[i] = {
      id: i,
      content: "",
      display: display,
      revealed: false,
      flagged: false,
    };
  }
  return tiles;
};

function neighbours(center: number, width: number, height: number) {
  const isLeftEmpty = center % width === 0;
  const isUpEmpty = center < width;
  const isDownEmpty = center >= width * (height - 1);
  const isRightEmpty = (center + 1) % width === 0;

  const leftUp = isLeftEmpty || isUpEmpty ? -1 : center - width - 1;
  const left = isLeftEmpty ? -1 : center - 1;
  const leftDown = isLeftEmpty || isDownEmpty ? -1 : center + width - 1;

  const rightUp = isRightEmpty || isUpEmpty ? -1 : center - width + 1;
  const right = isRightEmpty ? -1 : center + 1;
  const rightDown = isRightEmpty || isDownEmpty ? -1 : center + width + 1;

  const up = isUpEmpty ? -1 : center - width;

  const down = isDownEmpty ? -1 : center + width;

  return [left, right, up, down, leftUp, leftDown, rightUp, rightDown];
}

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
function reveal(
  tiles: ITile[],
  pos: number,
  width: number,
  height: number,
  depth = 0
): ITile[] {
  const tile = tiles[pos];

  if (tile.revealed) return tiles;

  if (tile.content === "💣" || tile.flagged) return tiles;

  if ([1, 2, 3, 4, 5, 6, 7, 8].includes(tile.content as number)) {
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

function populateTiles(
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

function explode(tiles: ITile[]): ITile[] {
  return tiles.map((m) => {
    const o = { ...m };
    if (o.content === "💣") {
      o.display = "💥";
    } else if (o.flagged) {
      o.display = "❌";
    }
    return o;
  });
}

function revealBombs(tiles: ITile[]) {
  return tiles.map((m) => {
    const o = { ...m };
    if (o.content === "💣") {
      o.revealed = true;
      o.display = "💣";
    }
    return o;
  });
}

function areAllSafeTilesRevealed(tiles: ITile[], mines: number): boolean {
  const revealed = tiles.reduce(
    (r: number, mine: ITile) => (mine.revealed ? r + 1 : r),
    0
  );
  // Winning condition = all safe tiles are revealead
  return revealed === tiles.length - mines;
}

function getButtonStyle(tile: ITile): string | undefined {
  switch (tile.content) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
      if (tile.revealed) {
        return `number${tile.content.toString()}`;
      }
      break;
  }
  return undefined;
}

function Mine(props: {
  tile: ITile;
  onLeftClick: (pos: number) => void;
  gasp: (down: boolean) => void;
}) {
  const tile = props.tile;
  return (
    <button
      style={{ fontSize: "small", fontWeight: "bold", padding: "1px" }}
      className={getButtonStyle(tile)}
      disabled={tile.revealed && tile.content === 0}
      value={tile.id}
      onClick={() => props.onLeftClick(tile.id)}
      onMouseDown={() => props.gasp(true)}
      onMouseUp={() => props.gasp(false)}
      onMouseLeave={() => props.gasp(false)}
    >
      {tile.display}
    </button>
  );
}

function MineField(props: {
  tiles: ITile[];
  width: number;
  phase: string;
  initGameAt: (startPosition: number) => void;
  revealAt: (startPosition: number) => void;
  gasp: (down: boolean) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${props.width}, 24px)`,
        gridGap: "1px",
        gridAutoRows: "minMax(24px, auto)",
        marginLeft: "1em",
      }}
    >
      {props.tiles.map((m: ITile) => (
        <Mine
          key={m.id}
          tile={m}
          onLeftClick={(pos: number) => {
            if (props.phase === "ready") {
              props.initGameAt(pos);
            } else if (props.phase === "playing") {
              props.revealAt(pos);
            }
          }}
          gasp={props.gasp}
        />
      ))}
    </div>
  );
}

function Info(props: { mines: number; phase: string }) {
  return (
    <div
      style={{
        marginLeft: "1em",
      }}
    >
      <p>
        {props.phase} | 💣 {props.mines}
      </p>
    </div>
  );
}

export function Game() {
  const width = 9;
  const height = 9;
  const gridSize = width * height;
  const mines = 10;
  const [tiles, setTiles] = useState(createMineField(gridSize));
  const [phase, setPhase] = useState("ready");

  function initGameAt(startPosition: number) {
    setTiles(
      reveal(
        populateTiles(startPosition, width, height, mines),
        startPosition,
        width,
        height,
        0
      )
    );
    setPhase("playing");
  }

  function revealAt(startPosition: number) {
    const tile = tiles[startPosition];

    if (tile.revealed || tile.flagged) {
      return;
    }

    if (tile.content === "💣") {
      setTiles(explode(tiles));
      setPhase("lost 💀");
      return;
    }

    const revealedBoard = reveal(
      tiles.map((n) => {
        return { ...n };
      }),
      startPosition,
      width,
      height
    );

    if (areAllSafeTilesRevealed(revealedBoard, mines)) {
      setTiles(revealBombs(revealedBoard));
      setPhase("won 😎");
      return;
    }

    setTiles(revealedBoard);
    setPhase("playing");
  }

  function gasp(down: boolean) {
    if (!phase.startsWith("playing")) {
      return;
    }

    if (down) {
      setPhase(phase + " 😰");
    } else {
      setPhase(phase.split(" ")[0]);
    }
  }

  return (
    <>
      <Info mines={mines} phase={phase} />
      <MineField
        tiles={tiles}
        width={9}
        phase={phase}
        initGameAt={initGameAt}
        revealAt={revealAt}
        gasp={gasp}
      />
    </>
  );
}
