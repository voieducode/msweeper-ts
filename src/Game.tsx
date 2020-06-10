import React, { useState } from "react";
import "./Game.css";

interface ITile {
  id: number;
  content: string | number;
  display: string;
  revealed: boolean;
  flagged: boolean;
  markedForNumberReveal: boolean;
  isNumber(): boolean;
  revealBomb(): ITile;
  explode(): ITile;
  clone(): ITile;
  isUnsafe(): boolean;
  hasBomb(): boolean;
}

class Tile implements ITile {
  constructor(
    public id: number,
    public display: string = "",
    public content: string | number = "",
    public revealed: boolean = false,
    public flagged: boolean = false,
    public markedForNumberReveal = false
  ) {}

  public isNumber() {
    switch (this.content) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
        return true;
    }
    return false;
  }

  public clone(): ITile {
    return new Tile(
      this.id,
      this.display,
      this.content,
      this.revealed,
      this.flagged,
      this.markedForNumberReveal
    );
  }

  public hasBomb(): boolean {
    return this.content === "💣";
  }

  public isUnsafe(): boolean {
    return !this.revealed && this.hasBomb() && !this.flagged;
  }

  public revealBomb(): ITile {
    const copy = this.clone();
    if (this.hasBomb()) {
      copy.revealed = true;
      copy.display = "💣";
    }

    return copy;
  }

  public explode(): ITile {
    const copy = this.clone();
    if (this.hasBomb()) {
      copy.display = "💥";
    } else if (this.flagged) {
      copy.display = "❌";
    }

    return copy;
  }
}

const createMineField = (length: number, display = ""): ITile[] => {
  const tiles: ITile[] = [...Array(length)];
  for (let i = 0; i < length; i++) {
    tiles[i] = new Tile(i);
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
  return tiles.map((m) => m.explode());
}

function revealBombs(tiles: ITile[]) {
  return tiles.map((m) => m.revealBomb());
}

function areAllSafeTilesRevealed(tiles: ITile[], mines: number): boolean {
  const revealed = tiles.reduce(
    (r: number, mine: ITile) => (mine.revealed ? r + 1 : r),
    0
  );
  // Winning condition = all safe tiles are revealead
  return revealed === tiles.length - mines;
}

function markForNumberReveal(
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

function revealSafeNumbers(
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

function Mine(props: {
  tile: ITile;
  onLeftClick: (pos: number) => void;
  onMiddleClick: (pos: number) => void;
  onRightClick: (pos: number) => void;
  gasp: (pos: number, down: boolean, middle: boolean) => void;
}) {
  const tile = props.tile;

  function getButtonStyle(): string | undefined {
    const classNames = [];
    if (tile.markedForNumberReveal) {
      classNames.push("pressed");
    }
    if (tile.isNumber && tile.revealed) {
      classNames.push(`number${tile.content.toString()}`);
    }
    return classNames.join(" ");
  }

  const MIDDLE_BUTTON = 1;

  return (
    <button
      style={{ fontSize: "small", fontWeight: "bold", padding: "1px" }}
      className={getButtonStyle()}
      disabled={tile.revealed && tile.content === 0}
      value={tile.id}
      onClick={() => props.onLeftClick(tile.id)}
      onAuxClick={(event) => {
        if (event.button === MIDDLE_BUTTON) {
          props.onMiddleClick(tile.id);
        }
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        props.onRightClick(tile.id);
      }}
      onMouseDown={(event) =>
        props.gasp(tile.id, true, event.button === MIDDLE_BUTTON)
      }
      onMouseUp={(event) =>
        props.gasp(tile.id, false, event.button === MIDDLE_BUTTON)
      }
      onMouseLeave={(event) =>
        props.gasp(tile.id, false, event.button === MIDDLE_BUTTON)
      }
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
  revealAt: (startPosition: number, safe: boolean) => void;
  gasp: (pos: number, down: boolean, middle: boolean) => void;
  cycleFlagAt: (startPosition: number) => void;
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
              props.revealAt(pos, false);
            }
          }}
          onMiddleClick={(pos: number) => {
            if (props.phase === "playing") {
              props.revealAt(pos, true);
            }
          }}
          onRightClick={(pos: number) => {
            if (props.phase === "playing") {
              props.cycleFlagAt(pos);
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

  function revealAt(startPosition: number, safe = false) {
    const tile = tiles[startPosition];

    if (tile.flagged) {
      return;
    }

    if (tile.revealed) {
      if (safe && tile.isNumber()) {
        setTiles(revealSafeNumbers(startPosition, tiles, width, height));
      }
      return;
    }

    if (tile.content === "💣") {
      setTiles(explode(tiles));
      setPhase("lost 💀");
      return;
    }

    const revealedBoard = reveal(
      tiles.map((n) => {
        return n.clone();
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

  function gasp(pos: number, down: boolean, middle: boolean) {
    if (!phase.startsWith("playing")) {
      return;
    }

    if (down) {
      setPhase("playing 😰");
    } else {
      setPhase(phase.split(" ")[0]);
    }

    if (tiles[pos].isNumber() && tiles[pos].revealed && middle) {
      setTiles(markForNumberReveal(pos, tiles, down, width, height));
    }
  }

  function cycleFlagAt(startPosition: number) {
    if (tiles[startPosition].revealed) {
      return;
    }
    const newTiles = tiles.map((t) => {
      const newT = t.clone();
      if (newT.id === startPosition) {
        newT.flagged = !newT.flagged;
        newT.display = newT.flagged ? "🚩" : "";
      }
      return newT;
    });
    if (areAllSafeTilesRevealed(newTiles, mines)) {
      setTiles(revealBombs(newTiles));
      setPhase("won 😎");
    } else {
      setTiles(newTiles);
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
        cycleFlagAt={cycleFlagAt}
      />
    </>
  );
}
