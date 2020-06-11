import React, { useState } from "react";
import "./MineSweeper.css";
import { Info } from "./Info";
import { MineField } from "./MineField";
import { populateTiles } from "../game/populate";
import {
  reveal,
  revealSafeNumbers,
  explode,
  areAllSafeTilesRevealed,
  revealBombs,
  markForNumberReveal,
} from "../game/reveal";
import { createMineField } from "../game/create";
import { SizeSelector } from "./SizeSelector";

export function MineSweeper() {
  const [width, setWidth] = useState(9);
  const [height, setHeight] = useState(9);
  const [mines, setMines] = useState(10);
  const gridSize = width * height;
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

  function onResize(width: number, height: number, mines: number) {
    setTiles(createMineField(width * height));
    setWidth(width);
    setHeight(height);
    setMines(mines);
    setPhase("ready");
  }

  return (
    <>
      <SizeSelector onResize={onResize} />
      <Info width={width} height={height} mines={mines} phase={phase} />
      <MineField
        tiles={tiles}
        width={width}
        phase={phase}
        initGameAt={initGameAt}
        revealAt={revealAt}
        gasp={gasp}
        cycleFlagAt={cycleFlagAt}
      />
    </>
  );
}
