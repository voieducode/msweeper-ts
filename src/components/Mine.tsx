import React from "react";
import { ITile } from "../game/tile";

export function Mine(props: {
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
