import {
  MapClipboard,
  MapSelectionState,
  SelectionBounds,
  TileCell,
  TileMap,
  TileSelection,
  MapLayer,
  Chunk,
  CHUNK_SIZE,
} from "../types";

export type LayerData = Record<string, Chunk>;

const cloneCell = (cell: TileCell | null): TileCell | null =>
  cell ? { ...cell } : null;

const sameCell = (left: TileCell | null, right: TileCell | null) => {
  if (left === null || right === null) return left === right;
  return left.tilesetId === right.tilesetId && left.tileIndex === right.tileIndex;
};

// --- Chunk-based storage helpers ---

export const getChunkKey = (x: number, y: number): string => `${x},${y}`;

export const getCellFromChunks = (chunks: LayerData, x: number, y: number): TileCell | null => {
  const chunkX = Math.floor(x / CHUNK_SIZE);
  const chunkY = Math.floor(y / CHUNK_SIZE);
  const key = getChunkKey(chunkX, chunkY);
  const chunk = chunks[key];
  if (!chunk) return null;

  const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  const localY = ((y % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  return chunk.data[localY][localX];
};

export const setCellInChunks = (
  chunks: LayerData,
  x: number,
  y: number,
  cell: TileCell | null
): LayerData => {
  const chunkX = Math.floor(x / CHUNK_SIZE);
  const chunkY = Math.floor(y / CHUNK_SIZE);
  const key = getChunkKey(chunkX, chunkY);

  const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  const localY = ((y % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

  const currentChunk = chunks[key];
  if (!currentChunk && cell === null) return chunks;

  const newChunks = { ...chunks };
  const newChunkData = currentChunk
    ? currentChunk.data.map((row) => [...row])
    : Array(CHUNK_SIZE).fill(null).map(() => Array(CHUNK_SIZE).fill(null));

  newChunkData[localY][localX] = cloneCell(cell);

  newChunks[key] = {
    x: chunkX,
    y: chunkY,
    data: newChunkData,
  };

  return newChunks;
};

export const migrateFlatDataToChunks = (data: (TileCell | null)[][]): LayerData => {
  let chunks: LayerData = {};
  data.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        chunks = setCellInChunks(chunks, x, y, cell);
      }
    });
  });
  return chunks;
};

export const cloneLayerData = (chunks: LayerData): LayerData => {
  const newChunks: LayerData = {};
  for (const key in chunks) {
    const chunk = chunks[key];
    newChunks[key] = {
      ...chunk,
      data: chunk.data.map((row) => row.map(cloneCell)),
    };
  }
  return newChunks;
};

/**
 * Helper for batching updates to chunks to avoid repeating the setCell logic and cloning.
 */
const withBatchUpdate = (
  chunks: LayerData,
  fn: (setCell: (x: number, y: number, cell: TileCell | null) => void) => void
): LayerData => {
  const newChunks = { ...chunks };
  const modifiedChunks = new Set<string>();

  const setCell = (x: number, y: number, cell: TileCell | null) => {
    const chunkX = Math.floor(x / CHUNK_SIZE);
    const chunkY = Math.floor(y / CHUNK_SIZE);
    const key = getChunkKey(chunkX, chunkY);
    const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localY = ((y % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

    if (!newChunks[key]) {
      if (cell === null) return;
      newChunks[key] = {
        x: chunkX,
        y: chunkY,
        data: Array(CHUNK_SIZE).fill(null).map(() => Array(CHUNK_SIZE).fill(null)),
      };
      modifiedChunks.add(key);
    } else if (!modifiedChunks.has(key)) {
      newChunks[key] = {
        ...newChunks[key],
        data: newChunks[key].data.map((row) => [...row]),
      };
      modifiedChunks.add(key);
    }
    newChunks[key].data[localY][localX] = cloneCell(cell);
  };

  fn(setCell);
  return newChunks;
};

// --- Layer data operations ---

export const batchSetLayerCells = (
  chunks: LayerData,
  cells: Array<{ x: number; y: number; cell: TileCell | null }>
): LayerData => {
  if (cells.length === 0) return chunks;
  return withBatchUpdate(chunks, (setCell) => {
    for (const { x, y, cell } of cells) {
      setCell(x, y, cell);
    }
  });
};

export const setLayerCell = (
  chunks: LayerData,
  x: number,
  y: number,
  cell: TileCell | null
): LayerData => {
  return setCellInChunks(chunks, x, y, cell);
};

export const floodFillLayer = (
  chunks: LayerData,
  startX: number,
  startY: number,
  replacement: TileCell | null
): LayerData => {
  const target = getCellFromChunks(chunks, startX, startY);
  if (sameCell(target, replacement)) return chunks;

  return withBatchUpdate(chunks, (setCell) => {
    const stack: Array<[number, number]> = [[startX, startY]];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      visited.add(key);

      if (!sameCell(getCellFromChunks(chunks, x, y), target)) continue;

      setCell(x, y, replacement);
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      
      if (visited.size > 50000) break; // Safety limit
    }
  });
};

export const drawLineOnLayer = (
  chunks: LayerData,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  cell: TileCell | null
): LayerData => {
  return withBatchUpdate(chunks, (setCell) => {
    let x = startX;
    let y = startY;
    const dx = Math.abs(endX - startX);
    const sx = startX < endX ? 1 : -1;
    const dy = -Math.abs(endY - startY);
    const sy = startY < endY ? 1 : -1;
    let error = dx + dy;

    while (true) {
      setCell(x, y, cell);
      if (x === endX && y === endY) break;
      const twiceError = 2 * error;
      if (twiceError >= dy) { error += dy; x += sx; }
      if (twiceError <= dx) { error += dx; y += sy; }
    }
  });
};

export const drawRectangleOnLayer = (
  chunks: LayerData,
  selection: SelectionBounds,
  cell: TileCell | null,
  filled: boolean
): LayerData => {
  return withBatchUpdate(chunks, (setCell) => {
    const startX = selection.x;
    const startY = selection.y;
    const endX = selection.x + selection.width;
    const endY = selection.y + selection.height;

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const isBorder = y === startY || y === endY - 1 || x === startX || x === endX - 1;
        if (filled || isBorder) setCell(x, y, cell);
      }
    }
  });
};

export const extractLayerSelection = (
  chunks: LayerData,
  selection: SelectionBounds
): MapClipboard => {
  const result: MapClipboard = [];
  for (let y = selection.y; y < selection.y + selection.height; y++) {
    const row: (TileCell | null)[] = [];
    for (let x = selection.x; x < selection.x + selection.width; x++) {
      row.push(cloneCell(getCellFromChunks(chunks, x, y)));
    }
    result.push(row);
  }
  return result;
};

export const pasteLayerSelection = (
  chunks: LayerData,
  clipboard: MapClipboard,
  targetX: number,
  targetY: number
): LayerData => {
  return withBatchUpdate(chunks, (setCell) => {
    clipboard.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        setCell(targetX + columnIndex, targetY + rowIndex, cell);
      });
    });
  });
};

export const clearLayerArea = (
  chunks: LayerData,
  selection: SelectionBounds
): LayerData => {
  return withBatchUpdate(chunks, (setCell) => {
    for (let y = selection.y; y < selection.y + selection.height; y++) {
      for (let x = selection.x; x < selection.x + selection.width; x++) {
        setCell(x, y, null);
      }
    }
  });
};

export const paintBrushOnLayer = (
  chunks: LayerData,
  startX: number,
  startY: number,
  tileSelection: TileSelection
): LayerData => {
  if (!tileSelection.hasSelection || tileSelection.width === 0 || tileSelection.height === 0) return chunks;

  return withBatchUpdate(chunks, (setCell) => {
    const patternWidth = tileSelection.width;
    const patternHeight = tileSelection.height;

    for (let y = 0; y < patternHeight; y++) {
      for (let x = 0; x < patternWidth; x++) {
        const selectedTile = tileSelection.tileData[y]?.[x];
        if (selectedTile) {
          setCell(startX + x, startY + y, selectedTile);
        }
      }
    }
  });
};

// --- Map-level helpers ---

export const createEmptyLayer = (name: string): MapLayer => ({
  id: crypto.randomUUID(),
  name,
  visible: true,
  chunks: {},
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
      i === idx ? { ...layer, chunks: fn(layer.chunks) } : layer
    ),
  };
};

export const getActiveLayerData = (map: TileMap, layerIndex: number): LayerData => {
  const idx = Math.max(0, Math.min(layerIndex, map.layers.length - 1));
  return map.layers[idx]?.chunks ?? {};
};

// --- Legacy compat & other helpers ---

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
