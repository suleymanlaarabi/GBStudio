import type {
  GBColor,
  SelectionBounds,
  Tile,
  Tileset,
  TileSize,
  TilesetLayout,
  TilesetLayoutPosition,
} from "../types";
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

export const getDefaultTilesetColumns = (tileSize: TileSize): number => (tileSize === 8 ? 4 : 3);

const getNextAvailablePosition = (
  usedKeys: Set<string>,
  columns: number,
): TilesetLayoutPosition => {
  let slot = 0;
  while (usedKeys.has(`${slot % columns},${Math.floor(slot / columns)}`)) {
    slot += 1;
  }

  return {
    x: slot % columns,
    y: Math.floor(slot / columns),
  };
};

export const createTilesetLayout = (tiles: Tile[], tileSize: TileSize): TilesetLayout => {
  const columns = getDefaultTilesetColumns(tileSize);
  const positions: Record<string, TilesetLayoutPosition> = {};

  tiles.forEach((tile, index) => {
    positions[tile.id] = {
      x: index % columns,
      y: Math.floor(index / columns),
    };
  });

  return { columns, positions };
};

export const normalizeTilesetLayout = (tileset: Tileset): Tileset => {
  const columns = tileset.layout?.columns ?? getDefaultTilesetColumns(tileset.tileSize);
  const declaredPositions = tileset.layout?.positions ?? {};
  const usedKeys = new Set<string>();
  const normalizedPositions: Record<string, TilesetLayoutPosition> = {};

  tileset.tiles.forEach((tile) => {
    const position = declaredPositions[tile.id];
    if (
      position &&
      Number.isInteger(position.x) &&
      Number.isInteger(position.y) &&
      position.x >= 0 &&
      position.y >= 0
    ) {
      const key = `${position.x},${position.y}`;
      if (!usedKeys.has(key)) {
        usedKeys.add(key);
        normalizedPositions[tile.id] = position;
        return;
      }
    }

    const nextPosition = getNextAvailablePosition(usedKeys, columns);
    usedKeys.add(`${nextPosition.x},${nextPosition.y}`);
    normalizedPositions[tile.id] = nextPosition;
  });

  return {
    ...tileset,
    layout: {
      columns,
      positions: normalizedPositions,
    },
  };
};

export const getTilesetPositionForTile = (
  tileset: Tileset,
  tileId: string,
): TilesetLayoutPosition | null =>
  normalizeTilesetLayout(tileset).layout?.positions[tileId] ?? null;

export const getTileAtTilesetPosition = (
  tileset: Tileset,
  x: number,
  y: number,
): { tile: Tile; tileIndex: number } | null => {
  const normalized = normalizeTilesetLayout(tileset);
  const tileIndex = normalized.tiles.findIndex((tile) => {
    const position = normalized.layout?.positions[tile.id];
    return position?.x === x && position?.y === y;
  });

  if (tileIndex < 0) return null;

  return {
    tile: normalized.tiles[tileIndex],
    tileIndex,
  };
};

export const createEmptyTileset = (name: string, size: TileSize): Tileset => {
  const tile = createEmptyTile(size);

  return {
    id: crypto.randomUUID(),
    name,
    tileSize: size,
    tiles: [tile],
    layout: createTilesetLayout([tile], size),
  };
};

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
  tilesets.map((tileset, currentTsIdx) => {
    if (currentTsIdx !== tsIdx) return tileset;

    const normalized = normalizeTilesetLayout(tileset);
    const tile = createEmptyTile(tileset.tileSize);
    const tiles = [...normalized.tiles, tile];
    const positions = { ...(normalized.layout?.positions ?? {}) };
    const usedKeys = new Set(
      Object.values(positions).map((position) => `${position.x},${position.y}`),
    );
    positions[tile.id] = getNextAvailablePosition(
      usedKeys,
      normalized.layout?.columns ?? getDefaultTilesetColumns(normalized.tileSize),
    );

    return {
      ...normalized,
      tiles,
      layout: {
        columns: normalized.layout?.columns ?? getDefaultTilesetColumns(normalized.tileSize),
        positions,
      },
    };
  });

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

    const normalized = normalizeTilesetLayout(tileset);
    const newTiles = [...normalized.tiles];
    newTiles.splice(tIdx + 1, 0, clonedTile);
    const positions = { ...(normalized.layout?.positions ?? {}) };
    const usedKeys = new Set(
      Object.values(positions).map((position) => `${position.x},${position.y}`),
    );
    positions[clonedTile.id] = getNextAvailablePosition(
      usedKeys,
      normalized.layout?.columns ?? getDefaultTilesetColumns(normalized.tileSize),
    );

    return {
      ...normalized,
      tiles: newTiles,
      layout: {
        columns: normalized.layout?.columns ?? getDefaultTilesetColumns(normalized.tileSize),
        positions,
      },
    };
  });
};

export const removeTileFromTileset = (tilesets: Tileset[], tsIdx: number, tIdx: number): Tileset[] => {
  return tilesets.map((tileset, currentTsIdx) => {
    if (currentTsIdx !== tsIdx) return tileset;

    const normalized = normalizeTilesetLayout(tileset);
    const removedTile = normalized.tiles[tIdx];
    const nextPositions = { ...(normalized.layout?.positions ?? {}) };
    if (removedTile) {
      delete nextPositions[removedTile.id];
    }

    return {
      ...normalized,
      tiles: normalized.tiles.filter((_, idx) => idx !== tIdx),
      layout: {
        columns: normalized.layout?.columns ?? getDefaultTilesetColumns(normalized.tileSize),
        positions: nextPositions,
      },
    };
  });
};

export const moveTileInTilesetLayout = (
  tilesets: Tileset[],
  tsIdx: number,
  tileId: string,
  x: number,
  y: number,
): Tileset[] =>
  tilesets.map((tileset, currentTsIdx) => {
    if (currentTsIdx !== tsIdx) return tileset;

    const normalized = normalizeTilesetLayout(tileset);
    const currentPosition = normalized.layout?.positions[tileId];
    if (!currentPosition) return normalized;

    const targetTile = normalized.tiles.find((tile) => {
      const position = normalized.layout?.positions[tile.id];
      return position?.x === x && position?.y === y;
    });

    const nextPositions = { ...(normalized.layout?.positions ?? {}) };
    nextPositions[tileId] = { x, y };

    if (targetTile && targetTile.id !== tileId) {
      nextPositions[targetTile.id] = currentPosition;
    }

    return {
      ...normalized,
      layout: {
        columns: normalized.layout?.columns ?? getDefaultTilesetColumns(normalized.tileSize),
        positions: nextPositions,
      },
    };
  });
