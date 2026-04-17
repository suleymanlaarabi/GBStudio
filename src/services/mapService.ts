import type {
  MapClipboard,
  MapSelectionState,
  SelectionBounds,
  TileCell,
  TileMap,
  TileSelection,
  MapLayer,
} from "../types";

export type LayerData = (TileCell | null)[][];

const cloneCell = (cell: TileCell | null): TileCell | null =>
  cell ? { ...cell } : null;

const sameCell = (left: TileCell | null, right: TileCell | null) => {
  if (left === null || right === null) return left === right;
  return left.tilesetId === right.tilesetId && left.tileIndex === right.tileIndex;
};

export const cloneLayerData = (data: LayerData): LayerData =>
  data.map((row) => row.map(cloneCell));

// --- Layer data operations (work on raw data arrays) ---

export const setLayerCell = (
  data: LayerData,
  x: number,
  y: number,
  cell: TileCell | null,
  width: number,
  height: number,
): LayerData => {
  if (x < 0 || x >= width || y < 0 || y >= height) return data;
  const newData = cloneLayerData(data);
  newData[y]![x] = cloneCell(cell);
  return newData;
};

export const floodFillLayer = (
  data: LayerData,
  startX: number,
  startY: number,
  replacement: TileCell | null,
  width: number,
  height: number,
): LayerData => {
  if (startX < 0 || startX >= width || startY < 0 || startY >= height) return data;
  const target = cloneCell(data[startY]![startX] ?? null);
  if (sameCell(target, replacement)) return data;

  const newData = cloneLayerData(data);
  const stack: Array<[number, number]> = [[startX, startY]];

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    if (!sameCell(newData[y]![x] ?? null, target)) continue;
    newData[y]![x] = cloneCell(replacement);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return newData;
};

export const drawLineOnLayer = (
  data: LayerData,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  cell: TileCell | null,
  width: number,
  height: number,
): LayerData => {
  const newData = cloneLayerData(data);
  let x = startX;
  let y = startY;
  const dx = Math.abs(endX - startX);
  const sx = startX < endX ? 1 : -1;
  const dy = -Math.abs(endY - startY);
  const sy = startY < endY ? 1 : -1;
  let error = dx + dy;

  while (true) {
    if (x >= 0 && x < width && y >= 0 && y < height) {
      newData[y]![x] = cloneCell(cell);
    }
    if (x === endX && y === endY) break;
    const twiceError = 2 * error;
    if (twiceError >= dy) { error += dy; x += sx; }
    if (twiceError <= dx) { error += dx; y += sy; }
  }

  return newData;
};

export const drawRectangleOnLayer = (
  data: LayerData,
  selection: SelectionBounds,
  cell: TileCell | null,
  filled: boolean,
  width: number,
  height: number,
): LayerData => {
  const newData = cloneLayerData(data);
  const startX = Math.max(0, selection.x);
  const startY = Math.max(0, selection.y);
  const endX = Math.min(width, selection.x + selection.width);
  const endY = Math.min(height, selection.y + selection.height);

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const isBorder = y === startY || y === endY - 1 || x === startX || x === endX - 1;
      if (filled || isBorder) newData[y]![x] = cloneCell(cell);
    }
  }

  return newData;
};

export const extractLayerSelection = (
  data: LayerData,
  selection: SelectionBounds,
): MapClipboard => {
  const result: MapClipboard = [];
  for (let y = selection.y; y < selection.y + selection.height; y++) {
    const row: (TileCell | null)[] = [];
    for (let x = selection.x; x < selection.x + selection.width; x++) {
      row.push(cloneCell(data[y]?.[x] ?? null));
    }
    result.push(row);
  }
  return result;
};

export const pasteLayerSelection = (
  data: LayerData,
  clipboard: MapClipboard,
  targetX: number,
  targetY: number,
  width: number,
  height: number,
): LayerData => {
  const newData = cloneLayerData(data);
  clipboard.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      const x = targetX + columnIndex;
      const y = targetY + rowIndex;
      if (x >= 0 && x < width && y >= 0 && y < height) {
        newData[y]![x] = cloneCell(cell);
      }
    });
  });
  return newData;
};

export const clearLayerArea = (
  data: LayerData,
  selection: SelectionBounds,
  width: number,
  height: number,
): LayerData => {
  const newData = cloneLayerData(data);
  for (let y = selection.y; y < selection.y + selection.height; y++) {
    for (let x = selection.x; x < selection.x + selection.width; x++) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        newData[y]![x] = null;
      }
    }
  }
  return newData;
};

export const paintBrushOnLayer = (
  data: LayerData,
  startX: number,
  startY: number,
  tileSelection: TileSelection,
  width: number,
  height: number,
): LayerData => {
  if (!tileSelection.hasSelection || tileSelection.width === 0 || tileSelection.height === 0) return data;

  const newData = cloneLayerData(data);
  const patternWidth = tileSelection.width;
  const patternHeight = tileSelection.height;
  const endX = Math.min(width, startX + patternWidth);
  const endY = Math.min(height, startY + patternHeight);

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const patternX = (x - startX) % patternWidth;
      const patternY = (y - startY) % patternHeight;
      const selectedTile = tileSelection.tileData[patternY]?.[patternX];
      if (selectedTile && x >= 0 && x < width && y >= 0 && y < height) {
        newData[y]![x] = cloneCell(selectedTile);
      }
    }
  }

  return newData;
};

// --- Map-level helpers ---

export const createEmptyLayer = (name: string, width: number, height: number): MapLayer => ({
  id: crypto.randomUUID(),
  name,
  visible: true,
  data: Array(height).fill(null).map(() => Array(width).fill(null)),
});

export const applyToActiveLayer = (
  map: TileMap,
  layerIndex: number,
  fn: (data: LayerData) => LayerData,
): TileMap => {
  const idx = Math.max(0, Math.min(layerIndex, map.layers.length - 1));
  if (!map.layers[idx]) return map;
  return {
    ...map,
    layers: map.layers.map((layer, i) =>
      i === idx ? { ...layer, data: fn(layer.data) } : layer
    ),
  };
};

// --- Legacy compat (for pickMapCell, etc.) ---

export const getActiveLayerData = (map: TileMap, layerIndex: number): LayerData => {
  const idx = Math.max(0, Math.min(layerIndex, map.layers.length - 1));
  return map.layers[idx]?.data ?? [];
};

// --- Old TileMap-based signatures (kept for migration) ---

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
