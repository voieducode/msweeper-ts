export function neighbours(center: number, width: number, height: number) {
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
