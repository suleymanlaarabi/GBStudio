import type {
  MapClipboard,
  MapSelectionState,
  SelectionBounds,
  TileCell,
  TileMap,
} from "../types";

const cloneCell = (cell: TileCell | null): TileCell | null =>
  cell ? { ...cell } : null;

const sameCell = (left: TileCell | null, right: TileCell | null) => {
  if (left === null || right === null) return left === right;
  return left.tilesetId === right.tilesetId && left.tileIndex === right.tileIndex;
};

const withClonedData = (map: TileMap) => map.data.map((row) => row.map(cloneCell));

export const normalizeMapSelection = (
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
): SelectionBounds => ({
  x: Math.min(startX, currentX),
  y: Math.min(startY, currentY),
  width: Math.abs(currentX - startX) + 1,
  height: Math.abs(currentY - startY) + 1,
});

export const createMapSelectionState = (
  startX: number,
  startY: number,
  currentX = startX,
  currentY = startY,
): MapSelectionState => ({
  hasSelection: true,
  startX,
  startY,
  ...normalizeMapSelection(startX, startY, currentX, currentY),
});

export const extractMapSelection = (
  map: TileMap,
  selection: SelectionBounds,
): MapClipboard => {
  const result: MapClipboard = [];
  for (let y = selection.y; y < selection.y + selection.height; y++) {
    const row: (TileCell | null)[] = [];
    for (let x = selection.x; x < selection.x + selection.width; x++) {
      row.push(cloneCell(map.data[y]?.[x] ?? null));
    }
    result.push(row);
  }
  return result;
};

export const pasteMapSelection = (
  map: TileMap,
  clipboard: MapClipboard,
  targetX: number,
  targetY: number,
): TileMap => {
  const data = withClonedData(map);
  clipboard.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      const x = targetX + columnIndex;
      const y = targetY + rowIndex;
      if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
        data[y]![x] = cloneCell(cell);
      }
    });
  });
  return { ...map, data };
};

export const clearMapArea = (
  map: TileMap,
  selection: SelectionBounds,
): TileMap => {
  const data = withClonedData(map);
  for (let y = selection.y; y < selection.y + selection.height; y++) {
    for (let x = selection.x; x < selection.x + selection.width; x++) {
      if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
        data[y]![x] = null;
      }
    }
  }
  return { ...map, data };
};

export const setMapCellValue = (
  map: TileMap,
  x: number,
  y: number,
  cell: TileCell | null,
): TileMap => {
  if (x < 0 || x >= map.width || y < 0 || y >= map.height) return map;
  const data = withClonedData(map);
  data[y]![x] = cloneCell(cell);
  return { ...map, data };
};

export const floodFillMap = (
  map: TileMap,
  startX: number,
  startY: number,
  replacement: TileCell | null,
): TileMap => {
  if (startX < 0 || startX >= map.width || startY < 0 || startY >= map.height) {
    return map;
  }

  const target = cloneCell(map.data[startY]![startX] ?? null);
  if (sameCell(target, replacement)) return map;

  const data = withClonedData(map);
  const stack: Array<[number, number]> = [[startX, startY]];

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    if (x < 0 || x >= map.width || y < 0 || y >= map.height) continue;
    if (!sameCell(data[y]![x] ?? null, target)) continue;

    data[y]![x] = cloneCell(replacement);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return { ...map, data };
};

export const drawMapLine = (
  map: TileMap,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  cell: TileCell | null,
): TileMap => {
  const data = withClonedData(map);
  let x = startX;
  let y = startY;
  const dx = Math.abs(endX - startX);
  const sx = startX < endX ? 1 : -1;
  const dy = -Math.abs(endY - startY);
  const sy = startY < endY ? 1 : -1;
  let error = dx + dy;

  while (true) {
    if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
      data[y]![x] = cloneCell(cell);
    }
    if (x === endX && y === endY) break;
    const twiceError = 2 * error;
    if (twiceError >= dy) {
      error += dy;
      x += sx;
    }
    if (twiceError <= dx) {
      error += dx;
      y += sy;
    }
  }

  return { ...map, data };
};

export const drawMapRectangle = (
  map: TileMap,
  selection: SelectionBounds,
  cell: TileCell | null,
  filled: boolean,
): TileMap => {
  const data = withClonedData(map);
  const startX = Math.max(0, selection.x);
  const startY = Math.max(0, selection.y);
  const endX = Math.min(map.width, selection.x + selection.width);
  const endY = Math.min(map.height, selection.y + selection.height);

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const isBorder = y === startY || y === endY - 1 || x === startX || x === endX - 1;
      if (filled || isBorder) {
        data[y]![x] = cloneCell(cell);
      }
    }
  }

  return { ...map, data };
};
