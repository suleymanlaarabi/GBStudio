import type { StateCreator } from "zustand";
import type {
  MapClipboard,
  MapSelectionState,
  SelectionBounds,
  TileCell,
  TileMap,
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
} from "../../services/mapService";

export interface MapSlice {
  maps: TileMap[];
  mapSelection: MapSelectionState;
  mapClipboard: MapClipboard | null;
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
  tilesets: { id: string }[];
  view: "tiles" | "gallery" | "map_editor" | "studio";
};

const emptyMapSelection: MapSelectionState = {
  hasSelection: false,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

export const createMapSlice: StateCreator<MapState, [], [], MapSlice> = (set, get) => ({
  maps: [],
  mapSelection: emptyMapSelection,
  mapClipboard: null,

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
