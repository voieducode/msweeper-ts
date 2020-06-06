import React from "react";

interface ITile {
  id: number;
  content: string;
  display: string;
  revealed: boolean;
  flagged: boolean;
}

const createMineField = (length: number, display = ""): Array<ITile> => {
  const a: Array<ITile> = [...Array(length)];
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

function Mine(props: { tile: ITile }) {
  return <button>{props.tile.id}</button>;
}

function MineField(props: { tiles: Array<ITile> }) {
  const width = 9;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${width}, 24px)`,
        gridGap: "1px",
        gridAutoRows: "minMax(24px, auto)",
        marginLeft: "1em",
      }}
    >
      {props.tiles.map((m: ITile) => (
        <Mine key={m.id} tile={m} />
      ))}
    </div>
  );
}

export function Game() {
  const tiles = createMineField(9 * 9);
  return <MineField tiles={tiles} />;
}
