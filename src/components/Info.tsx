import React from "react";
export function Info(props: {
  width: number;
  height: number;
  mines: number;
  phase: string;
}) {
  return (
    <div
      style={{
        marginLeft: "1em",
      }}
    >
      <p>
        {props.phase} | ↔️ {props.width} ↕️ {props.height} 💣 {props.mines}
      </p>
    </div>
  );
}
