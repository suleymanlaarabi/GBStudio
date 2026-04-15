import type { GBColor, SelectionBounds, Tile, Tileset, TileSize } from "../types";
import {
  clearArea,
  drawCircle,
  drawRectangle,
  fillArea,
  floodFillData,
} from "../utils";

export const createEmptyTile = (size: TileSize): Tile => ({
  id: crypto.randomUUID(),
  data: Array(size)
    .fill(0)
    .map(() => Array(size).fill(0) as GBColor[]),
  size,
});

export const createEmptyTileset = (name: string, size: TileSize): Tileset => ({
  id: crypto.randomUUID(),
  name,
  tileSize: size,
  tiles: [createEmptyTile(size)],
});

const updateTile = (
  tilesets: Tileset[],
  tsIdx: number,
  tIdx: number,
  updater: (tile: Tile, tileset: Tileset) => Tile,
): Tileset[] =>
  tilesets.map((tileset, currentTsIdx) => {
    if (currentTsIdx !== tsIdx) return tileset;

    return {
      ...tileset,
      tiles: tileset.tiles.map((tile, currentTileIdx) =>
        currentTileIdx === tIdx ? updater(tile, tileset) : tile,
      ),
    };
  });

export const appendTile = (tilesets: Tileset[], tsIdx: number): Tileset[] =>
  tilesets.map((tileset, currentTsIdx) =>
    currentTsIdx === tsIdx
      ? { ...tileset, tiles: [...tileset.tiles, createEmptyTile(tileset.tileSize)] }
      : tileset,
  );

export const updateTilePixel = (
  tilesets: Tileset[],
  tsIdx: number,
  tIdx: number,
  x: number,
  y: number,
  color: GBColor,
) =>
  updateTile(tilesets, tsIdx, tIdx, (tile) => ({
    ...tile,
    data: tile.data.map((row, rowIndex) =>
      rowIndex === y ? row.map((pixel, pixelIndex) => (pixelIndex === x ? color : pixel)) : row,
    ),
  }));

export const floodFillTile = (
  tilesets: Tileset[],
  tsIdx: number,
  tIdx: number,
  x: number,
  y: number,
  color: GBColor,
) =>
  updateTile(tilesets, tsIdx, tIdx, (tile) => ({
    ...tile,
    data: floodFillData(tile.data, x, y, color),
  }));

export const drawRectangleOnTile = (
  tilesets: Tileset[],
  tsIdx: number,
  tIdx: number,
  x: number,
  y: number,
  width: number,
  height: number,
  color: GBColor,
  filled: boolean,
) =>
  updateTile(tilesets, tsIdx, tIdx, (tile) => ({
    ...tile,
    data: drawRectangle(tile.data, x, y, width, height, color, filled),
  }));

export const drawCircleOnTile = (
  tilesets: Tileset[],
  tsIdx: number,
  tIdx: number,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  color: GBColor,
  filled: boolean,
) =>
  updateTile(tilesets, tsIdx, tIdx, (tile) => ({
    ...tile,
    data: drawCircle(tile.data, centerX, centerY, radiusX, radiusY, color, filled),
  }));

export const fillTileArea = (
  tilesets: Tileset[],
  tsIdx: number,
  tIdx: number,
  selection: SelectionBounds,
  color: GBColor,
) =>
  updateTile(tilesets, tsIdx, tIdx, (tile) => ({
    ...tile,
    data: fillArea(tile.data, selection, color),
  }));

export const clearTileArea = (
  tilesets: Tileset[],
  tsIdx: number,
  tIdx: number,
  selection: SelectionBounds,
) =>
  updateTile(tilesets, tsIdx, tIdx, (tile) => ({
    ...tile,
    data: clearArea(tile.data, selection),
  }));

// Helpers de transformation de matrice
export const flipTileDataHorizontal = (data: GBColor[][]): GBColor[][] => {
  const size = data.length;
  const flipped = Array(size)
    .fill(0)
    .map(() => Array(size).fill(0) as GBColor[]);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      flipped[y]![size - 1 - x] = data[y]![x]!;
    }
  }

  return flipped;
};

export const flipTileDataVertical = (data: GBColor[][]): GBColor[][] => {
  const size = data.length;
  const flipped = Array(size)
    .fill(0)
    .map(() => Array(size).fill(0) as GBColor[]);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      flipped[size - 1 - y]![x] = data[y]![x]!;
    }
  }

  return flipped;
};

export const rotateTileDataClockwise = (data: GBColor[][]): GBColor[][] => {
  const size = data.length;
  const rotated = Array(size)
    .fill(0)
    .map(() => Array(size).fill(0) as GBColor[]);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      rotated[x]![size - 1 - y] = data[y]![x]!;
    }
  }

  return rotated;
};

export const rotateTileDataCounterClockwise = (data: GBColor[][]): GBColor[][] => {
  const size = data.length;
  const rotated = Array(size)
    .fill(0)
    .map(() => Array(size).fill(0) as GBColor[]);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      rotated[size - 1 - x]![y] = data[y]![x]!;
    }
  }

  return rotated;
};

export const cloneTileInTileset = (tilesets: Tileset[], tsIdx: number, tIdx: number): Tileset[] => {
  const sourceTileset = tilesets[tsIdx];
  if (!sourceTileset) return tilesets;

  const sourceTile = sourceTileset.tiles[tIdx];
  if (!sourceTile) return tilesets;

  // Créer une copie profonde des données
  const clonedData = sourceTile.data.map(row => [...row]);

  const clonedTile: Tile = {
    id: crypto.randomUUID(),
    data: clonedData,
    size: sourceTile.size,
  };

  // Insérer juste après la tile source
  return tilesets.map((tileset, currentTsIdx) => {
    if (currentTsIdx !== tsIdx) return tileset;

    const newTiles = [...tileset.tiles];
    newTiles.splice(tIdx + 1, 0, clonedTile);

    return {
      ...tileset,
      tiles: newTiles,
    };
  });
};

export const removeTileFromTileset = (tilesets: Tileset[], tsIdx: number, tIdx: number): Tileset[] => {
  return tilesets.map((tileset, currentTsIdx) => {
    if (currentTsIdx !== tsIdx) return tileset;

    return {
      ...tileset,
      tiles: tileset.tiles.filter((_, idx) => idx !== tIdx),
    };
  });
};
