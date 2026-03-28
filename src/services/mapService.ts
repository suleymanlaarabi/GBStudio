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
