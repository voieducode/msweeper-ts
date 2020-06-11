import React from "react";
import { Mine } from "./Mine";
import { ITile } from "../game/tile";

export function MineField(props: {
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
