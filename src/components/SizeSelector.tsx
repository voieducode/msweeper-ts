import React from "react";

export function SizeSelector(props: {
  onResize: (width: number, height: number, mines: number) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: "240px",
        marginLeft: "1em",
        paddingTop: "6px",
        paddingBottom: "6px",
      }}
    >
      <button onClick={() => props.onResize(9, 9, 10)}>Beginner</button>
      <button onClick={() => props.onResize(16, 16, 40)}>Intermediary</button>
      <button onClick={() => props.onResize(30, 16, 99)}>Expert</button>
    </div>
  );
}
