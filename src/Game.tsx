import React, { useState } from "react";

interface ITile {
  id: number;
  content: string | number;
  display: string;
  revealed: boolean;
  flagged: boolean;
}

const createMineField = (length: number, display = ""): ITile[] => {
  const a: ITile[] = [...Array(length)];
  for (let i = 0; i < length; i++) {
    a[i] = {
      id: i,
      content: "",
      display: display,
      revealed: false,
      flagged: false,
    };
  }
  return a;
};

function neighbours(center: number, width: number, height: number) {
  const pos = center;
  const isLeftEmpty = pos % width === 0;
  const isUpEmpty = pos < width;
  const isDownEmpty = pos >= width * (height - 1);
  const isRightEmpty = (pos + 1) % width === 0;

  const leftUp = isLeftEmpty || isUpEmpty ? -1 : pos - width - 1;
  const left = isLeftEmpty ? -1 : pos - 1;
  const leftDown = isLeftEmpty || isDownEmpty ? -1 : pos + width - 1;

  const rightUp = isRightEmpty || isUpEmpty ? -1 : pos - width + 1;
  const right = isRightEmpty ? -1 : pos + 1;
  const rightDown = isRightEmpty || isDownEmpty ? -1 : pos + width + 1;

  const up = isUpEmpty ? -1 : pos - width;

  const down = isDownEmpty ? -1 : pos + width;

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
  at: number,
  width: number,
  height: number,
  depth = 0
): ITile[] {
  const pos = at;
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
  startPosition: number,
  width: number,
  height: number,
  mines: number
) {
  const initialPosition = startPosition;
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

function Mine(props: { tile: ITile; onLeftClick: (pos: number) => void }) {
  const tile = props.tile;
  return (
    <button
      style={{ fontSize: "small", fontWeight: "bold", padding: "1px" }}
      disabled={tile.revealed}
      value={tile.id}
      onClick={() => props.onLeftClick(tile.id)}
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
      setPhase("lost");
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
      />
    </>
  );
}
