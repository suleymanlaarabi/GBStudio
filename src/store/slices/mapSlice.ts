import type { StateCreator } from "zustand";
import type {
  MapClipboard,
  MapSelectionState,
  SelectionBounds,
  TileCell,
  TileMap,
  TileSelection,
  TileSize,
} from "../../types";
import {
  clearMapArea,
  createMapSelectionState,
  drawMapLine as drawMapLineData,
  drawMapRectangle as drawMapRectangleData,
  extractMapSelection,
  floodFillMap,
  normalizeMapSelection,
  pasteMapSelection as pasteMapSelectionData,
  setMapCellValue,
  paintTileBrush as paintTileBrushData,
} from "../../services/mapService";
import { getTileAtTilesetPosition, normalizeTilesetLayout } from "../../services/tileService";

export interface MapSlice {
  maps: TileMap[];
  mapSelection: MapSelectionState;
  mapClipboard: MapClipboard | null;
  tileSelection: TileSelection;
  beginTileSelection: (x: number, y: number) => void;
  updateTileSelection: (x: number, y: number) => void;
  endTileSelection: () => void;
  clearTileSelection: () => void;
  updateMapCell: (
    mapIndex: number,
    x: number,
    y: number,
    tilesetId: string,
    tileIndex: number,
  ) => void;
  clearMapCell: (mapIndex: number, x: number, y: number) => void;
  fillMap: (
    mapIndex: number,
    x: number,
    y: number,
    tilesetId: string,
    tileIndex: number,
  ) => void;
  paintTileBrush: (
    mapIndex: number,
    x: number,
    y: number,
  ) => void;
  drawMapLine: (
    mapIndex: number,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    cell: TileCell | null,
  ) => void;
  drawMapRectangle: (
    mapIndex: number,
    selection: SelectionBounds,
    cell: TileCell | null,
    filled: boolean,
  ) => void;
  beginMapSelection: (x: number, y: number) => void;
  updateMapSelection: (x: number, y: number) => void;
  endMapSelection: () => void;
  clearMapSelection: () => void;
  copyMapSelection: () => void;
  cutMapSelection: () => void;
  pasteMapSelection: (targetX: number, targetY: number) => void;
  deleteMapSelection: () => void;
  pickMapCell: (mapIndex: number, x: number, y: number) => void;
  addMap: (name: string, width: number, height: number, tileSize: TileSize) => void;
  removeMap: (index: number) => void;
}

const createEmptyMap = (
  name: string,
  width: number,
  height: number,
  tileSize: TileSize,
): TileMap => ({
  id: crypto.randomUUID(),
  name,
  width,
  height,
  tileSize,
  data: Array(height)
    .fill(null)
    .map(() => Array(width).fill(null)),
});

type MapState = MapSlice & {
  activeMapIndex: number;
  activeTileIndex: number;
  activeTilesetIndex: number;
  commit: () => void;
  tilesets: Tileset[];
  view: "tiles" | "gallery" | "map_editor" | "studio";
};

const emptyMapSelection: MapSelectionState = {
  hasSelection: false,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

const emptyTileSelection: TileSelection = {
  hasSelection: false,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  tileData: [],
};

export const createMapSlice: StateCreator<MapState, [], [], MapSlice> = (set, get) => ({
  maps: [],
  mapSelection: emptyMapSelection,
  mapClipboard: null,
  tileSelection: emptyTileSelection,

  beginTileSelection: (x, y) => {
    set({
      tileSelection: {
        hasSelection: true,
        startX: x,
        startY: y,
        x,
        y,
        width: 0,
        height: 0,
        tileData: [],
      },
    });
  },

  updateTileSelection: (x, y) => {
    const { tileSelection } = get();
    if (!tileSelection.hasSelection || tileSelection.startX === undefined || tileSelection.startY === undefined) return;

    // Calculate bounds
    const startX = tileSelection.startX;
    const startY = tileSelection.startY;
    const minX = Math.min(startX, x);
    const minY = Math.min(startY, y);
    const width = Math.abs(x - startX) + 1;
    const height = Math.abs(y - startY) + 1;

    // Extract tile data from the active tileset
    const { tilesets, activeTilesetIndex } = get();
    const activeTileset = tilesets[activeTilesetIndex]
      ? normalizeTilesetLayout(tilesets[activeTilesetIndex]!)
      : undefined;
    const tileData: Array<Array<{ tilesetId: string; tileIndex: number } | null>> = [];

    for (let ty = 0; ty < height; ty++) {
      const row: Array<{ tilesetId: string; tileIndex: number } | null> = [];
      for (let tx = 0; tx < width; tx++) {
        const tileX = minX + tx;
        const tileY = minY + ty;
        if (activeTileset) {
          const gridTile = getTileAtTilesetPosition(activeTileset, tileX, tileY);
          if (gridTile) {
            row.push({ tilesetId: activeTileset.id, tileIndex: gridTile.tileIndex });
          } else {
            row.push(null);
          }
        } else {
          row.push(null);
        }
      }
      tileData.push(row);
    }

    set({
      tileSelection: {
        hasSelection: true,
        startX,
        startY,
        x: minX,
        y: minY,
        width,
        height,
        tileData,
      },
    });
  },

  endTileSelection: () => {
    const { tileSelection } = get();
    // Keep selection if it has area
    if (tileSelection.width > 0 && tileSelection.height > 0) return;
    set({ tileSelection: emptyTileSelection });
  },

  clearTileSelection: () => {
    set({ tileSelection: emptyTileSelection });
  },

  updateMapCell: (mapIndex, x, y, tilesetId, tileIndex) => {
    set((state) => ({
      maps: state.maps.map((map, currentIndex) =>
        currentIndex === mapIndex
          ? setMapCellValue(map, x, y, { tilesetId, tileIndex })
          : map,
      ),
    }));
  },

  clearMapCell: (mapIndex, x, y) => {
    set((state) => ({
      maps: state.maps.map((map, currentIndex) =>
        currentIndex === mapIndex ? setMapCellValue(map, x, y, null) : map,
      ),
    }));
  },

  fillMap: (mapIndex, x, y, tilesetId, tileIndex) => {
    set((state) => ({
      maps: state.maps.map((map, currentIndex) =>
        currentIndex === mapIndex
          ? floodFillMap(map, x, y, { tilesetId, tileIndex })
          : map,
      ),
    }));
    get().commit();
  },

  paintTileBrush: (mapIndex, x, y) => {
    const { tileSelection } = get();
    if (!tileSelection.hasSelection || tileSelection.width === 0 || tileSelection.height === 0) return;

    set((state) => ({
      maps: state.maps.map((map, currentIndex) =>
        currentIndex === mapIndex
          ? paintTileBrushData(map, x, y, tileSelection)
          : map,
      ),
    }));
  },

  drawMapLine: (mapIndex, startX, startY, endX, endY, cell) => {
    set((state) => ({
      maps: state.maps.map((map, currentIndex) =>
        currentIndex === mapIndex
          ? drawMapLineData(map, startX, startY, endX, endY, cell)
          : map,
      ),
    }));
    get().commit();
  },

  drawMapRectangle: (mapIndex, selection, cell, filled) => {
    set((state) => ({
      maps: state.maps.map((map, currentIndex) =>
        currentIndex === mapIndex
          ? drawMapRectangleData(map, selection, cell, filled)
          : map,
      ),
    }));
    get().commit();
  },

  beginMapSelection: (x, y) => {
    set({ mapSelection: createMapSelectionState(x, y) });
  },

  updateMapSelection: (x, y) => {
    const { mapSelection } = get();
    const startX = mapSelection.startX ?? mapSelection.x;
    const startY = mapSelection.startY ?? mapSelection.y;
    set({
      mapSelection: {
        hasSelection: true,
        startX,
        startY,
        ...normalizeMapSelection(startX, startY, x, y),
      },
    });
  },

  endMapSelection: () => {
    const { mapSelection } = get();
    if (mapSelection.width > 0 && mapSelection.height > 0) return;
    set({ mapSelection: emptyMapSelection });
  },

  clearMapSelection: () => {
    set({ mapSelection: emptyMapSelection });
  },

  copyMapSelection: () => {
    const { maps, activeMapIndex, mapSelection } = get();
    const map = maps[activeMapIndex];
    if (!map || !mapSelection.hasSelection) return;
    set({ mapClipboard: extractMapSelection(map, mapSelection) });
  },

  cutMapSelection: () => {
    const { maps, activeMapIndex, mapSelection } = get();
    const map = maps[activeMapIndex];
    if (!map || !mapSelection.hasSelection) return;
    set((state) => ({
      mapClipboard: extractMapSelection(map, mapSelection),
      maps: state.maps.map((currentMap, currentIndex) =>
        currentIndex === activeMapIndex ? clearMapArea(currentMap, mapSelection) : currentMap,
      ),
    }));
    get().commit();
  },

  pasteMapSelection: (targetX, targetY) => {
    const { activeMapIndex, mapClipboard } = get();
    if (!mapClipboard) return;
    set((state) => ({
      maps: state.maps.map((map, currentIndex) =>
        currentIndex === activeMapIndex
          ? pasteMapSelectionData(map, mapClipboard, targetX, targetY)
          : map,
      ),
      mapSelection: {
        hasSelection: true,
        x: targetX,
        y: targetY,
        width: mapClipboard[0]?.length ?? 0,
        height: mapClipboard.length,
      },
    }));
    get().commit();
  },

  deleteMapSelection: () => {
    const { activeMapIndex, mapSelection } = get();
    if (!mapSelection.hasSelection) return;
    set((state) => ({
      maps: state.maps.map((map, currentIndex) =>
        currentIndex === activeMapIndex ? clearMapArea(map, mapSelection) : map,
      ),
      mapSelection: emptyMapSelection,
    }));
    get().commit();
  },

  pickMapCell: (mapIndex, x, y) => {
    const { maps, tilesets } = get();
    const cell = maps[mapIndex]?.data[y]?.[x] ?? null;
    if (!cell) return;
    const tilesetIndex = tilesets.findIndex((tileset) => tileset.id === cell.tilesetId);
    if (tilesetIndex < 0) return;
    set({
      activeTilesetIndex: tilesetIndex,
      activeTileIndex: cell.tileIndex,
    });
  },

  addMap: (name, width, height, tileSize) => {
    set((state) => ({
      maps: [...state.maps, createEmptyMap(name, width, height, tileSize)],
      activeMapIndex: state.maps.length,
      view: "map_editor",
    }));
    get().commit();
  },

  removeMap: (index) => {
    set((state) => ({
      maps: state.maps.filter((_, currentIndex) => currentIndex !== index),
      activeMapIndex: -1,
    }));
    get().commit();
  },
});
