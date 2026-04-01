import type { StateCreator } from "zustand";
import type {
import { CHUNK_SIZE } from "../../types/map";
import {
import {
  MapClipboard,
  MapLayer,
  MapSelectionState,
  SelectionBounds,
  SpriteInstance,
  TileCell,
  TileMap,
  TileSelection,
  Tileset,
  TileSize,
  View,
} from "../../types";
  applyToActiveLayer,
  batchSetLayerCells,
  clearLayerArea,
  createEmptyLayer,
  createMapSelectionState,
  drawLineOnLayer,
  drawRectangleOnLayer,
  extractLayerSelection,
  floodFillLayer,
  getActiveLayerData,
  normalizeMapSelection,
  paintBrushOnLayer,
  pasteLayerSelection,
  setLayerCell,
  getCellFromChunks,
  cloneLayerData,
} from "../../services/mapService";
  getTileAtTilesetPosition,
  normalizeTilesetLayout,
} from "../../services/tileService";

export interface MapSlice {
  maps: TileMap[];
  mapSelection: MapSelectionState;
  mapClipboard: MapClipboard | null;
  tileSelection: TileSelection;
  beginTileSelection: (x: number, y: number) => void;
  updateTileSelection: (x: number, y: number) => void;
  endTileSelection: () => void;
  clearTileSelection: () => void;
  updateMapCell: (mapIndex: number, x: number, y: number, tilesetId: string, tileIndex: number) => void;
  clearMapCell: (mapIndex: number, x: number, y: number) => void;
  batchUpdateMapCells: (mapIndex: number, cells: Array<{ x: number; y: number; cell: TileCell | null }>) => void;
  batchSetCollisionCells: (mapIndex: number, cells: Array<{ x: number; y: number; solid: boolean }>) => void;
  fillMap: (mapIndex: number, x: number, y: number, tilesetId: string, tileIndex: number) => void;
  paintTileBrush: (mapIndex: number, x: number, y: number) => void;
  drawMapLine: (mapIndex: number, startX: number, startY: number, endX: number, endY: number, cell: TileCell | null) => void;
  drawMapRectangle: (mapIndex: number, selection: SelectionBounds, cell: TileCell | null, filled: boolean) => void;
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
  setCameraSpawn: (mapIndex: number, x: number, y: number) => void;
  setCollisionCell: (mapIndex: number, x: number, y: number, solid: boolean) => void;
  // Layer operations
  addLayer: (mapIndex: number) => void;
  removeLayer: (mapIndex: number, layerIndex: number) => void;
  moveLayerUp: (mapIndex: number, layerIndex: number) => void;
  moveLayerDown: (mapIndex: number, layerIndex: number) => void;
  toggleLayerVisibility: (mapIndex: number, layerIndex: number) => void;
  renameLayer: (mapIndex: number, layerIndex: number, name: string) => void;
  duplicateLayer: (mapIndex: number, layerIndex: number) => void;
  // Sprite instance operations
  addSpriteInstance: (mapIndex: number, instance: Omit<SpriteInstance, "id">) => void;
  removeSpriteInstance: (mapIndex: number, instanceId: string) => void;
  updateSpriteInstance: (mapIndex: number, instanceId: string, patch: Partial<Omit<SpriteInstance, "id">>) => void;
  // Window layer operations
  setWindowLayerEnabled: (mapIndex: number, enabled: boolean) => void;
  setWindowLayerConfig: (mapIndex: number, wx: number, wy: number) => void;
  batchUpdateWindowCells: (mapIndex: number, cells: Array<{ x: number; y: number; cell: TileCell | null }>) => void;
}

const createEmptyMap = (name: string, width: number, height: number, tileSize: TileSize): TileMap => ({
  id: crypto.randomUUID(),
  name,
  width,
  height,
  tileSize,
  layers: [createEmptyLayer("Layer 1")],
});

type MapState = MapSlice & {
  activeMapIndex: number;
  activeLayerIndex: number;
  activeTileIndex: number;
  activeTilesetIndex: number;
  commit: () => void;
  tilesets: Tileset[];
  view: View;
};

const emptyMapSelection: MapSelectionState = { hasSelection: false, x: 0, y: 0, width: 0, height: 0 };
const emptyTileSelection: TileSelection = { hasSelection: false, x: 0, y: 0, width: 0, height: 0, tileData: [] };

const updateMap = (maps: TileMap[], mapIndex: number, updater: (map: TileMap) => TileMap): TileMap[] =>
  maps.map((map, i) => (i === mapIndex ? updater(map) : map));

export const createMapSlice: StateCreator<MapState, [], [], MapSlice> = (set, get) => ({
  maps: [],
  mapSelection: emptyMapSelection,
  mapClipboard: null,
  tileSelection: emptyTileSelection,

  beginTileSelection: (x, y) => {
    set({ tileSelection: { hasSelection: true, startX: x, startY: y, x, y, width: 0, height: 0, tileData: [] } });
  },

  updateTileSelection: (x, y) => {
    const { tileSelection } = get();
    if (!tileSelection.hasSelection || tileSelection.startX === undefined || tileSelection.startY === undefined) return;

    const startX = tileSelection.startX;
    const startY = tileSelection.startY;
    const minX = Math.min(startX, x);
    const minY = Math.min(startY, y);
    const width = Math.abs(x - startX) + 1;
    const height = Math.abs(y - startY) + 1;

    const { tilesets, activeTilesetIndex } = get();
    const activeTileset = tilesets[activeTilesetIndex]
      ? normalizeTilesetLayout(tilesets[activeTilesetIndex]!)
      : undefined;

    const tileData: Array<Array<{ tilesetId: string; tileIndex: number } | null>> = [];
    for (let ty = 0; ty < height; ty++) {
      const row: Array<{ tilesetId: string; tileIndex: number } | null> = [];
      for (let tx = 0; tx < width; tx++) {
        if (activeTileset) {
          const gridTile = getTileAtTilesetPosition(activeTileset, minX + tx, minY + ty);
          row.push(gridTile ? { tilesetId: activeTileset.id, tileIndex: gridTile.tileIndex } : null);
        } else {
          row.push(null);
        }
      }
      tileData.push(row);
    }

    set({ tileSelection: { hasSelection: true, startX, startY, x: minX, y: minY, width, height, tileData } });
  },

  endTileSelection: () => {
    const { tileSelection } = get();
    if (tileSelection.width > 0 && tileSelection.height > 0) return;
    set({ tileSelection: emptyTileSelection });
  },

  clearTileSelection: () => set({ tileSelection: emptyTileSelection }),

  updateMapCell: (mapIndex, x, y, tilesetId, tileIndex) => {
    const { activeLayerIndex } = get();
    set((state) => ({
      maps: updateMap(state.maps, mapIndex, (map) =>
        applyToActiveLayer(map, activeLayerIndex, (data) =>
          setLayerCell(data, x, y, { tilesetId, tileIndex })
        )
      ),
    }));
  },

  clearMapCell: (mapIndex, x, y) => {
    const { activeLayerIndex } = get();
    set((state) => ({
      maps: updateMap(state.maps, mapIndex, (map) =>
        applyToActiveLayer(map, activeLayerIndex, (data) =>
          setLayerCell(data, x, y, null)
        )
      ),
    }));
  },

  batchUpdateMapCells: (mapIndex, cells) => {
    if (cells.length === 0) return;
    const { activeLayerIndex } = get();
    set((state) => ({
      maps: updateMap(state.maps, mapIndex, (map) =>
        applyToActiveLayer(map, activeLayerIndex, (data) =>
          batchSetLayerCells(data, cells)
        )
      ),
    }));
  },

  batchSetCollisionCells: (mapIndex, cells) => {
    if (cells.length === 0) return;
    set((state) => ({
      maps: updateMap(state.maps, mapIndex, (map) => {
        const collisionData = map.collisionData ? { ...map.collisionData } : {};
        const clonedKeys = new Set<string>();

        for (const { x, y, solid } of cells) {
          const cx = Math.floor(x / CHUNK_SIZE);
          const cy = Math.floor(y / CHUNK_SIZE);
          const key = `${cx},${cy}`;
          const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
          const localY = ((y % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

          if (!clonedKeys.has(key)) {
            collisionData[key] = collisionData[key]
              ? collisionData[key]!.map((row) => [...row])
              : Array.from({ length: CHUNK_SIZE }, () => new Array<boolean>(CHUNK_SIZE).fill(false));
            clonedKeys.add(key);
          }
          collisionData[key]![localY]![localX] = solid;
        }

        for (const key of clonedKeys) {
          const chunk = collisionData[key];
          if (chunk && chunk.every((row) => row.every((v) => !v))) {
            delete collisionData[key];
          }
        }

        return { ...map, collisionData };
      }),
    }));
  },

  fillMap: (mapIndex, x, y, tilesetId, tileIndex) => {
    const { activeLayerIndex } = get();
    set((state) => ({
      maps: updateMap(state.maps, mapIndex, (map) =>
        applyToActiveLayer(map, activeLayerIndex, (data) =>
          floodFillLayer(data, x, y, { tilesetId, tileIndex })
        )
      ),
    }));
    get().commit();
  },

  paintTileBrush: (mapIndex, x, y) => {
    const { tileSelection, activeLayerIndex } = get();
    if (!tileSelection.hasSelection || tileSelection.width === 0 || tileSelection.height === 0) return;
    set((state) => ({
      maps: updateMap(state.maps, mapIndex, (map) =>
        applyToActiveLayer(map, activeLayerIndex, (data) =>
          paintBrushOnLayer(data, x, y, tileSelection)
        )
      ),
    }));
  },

  drawMapLine: (mapIndex, startX, startY, endX, endY, cell) => {
    const { activeLayerIndex } = get();
    set((state) => ({
      maps: updateMap(state.maps, mapIndex, (map) =>
        applyToActiveLayer(map, activeLayerIndex, (data) =>
          drawLineOnLayer(data, startX, startY, endX, endY, cell)
        )
      ),
    }));
    get().commit();
  },

  drawMapRectangle: (mapIndex, selection, cell, filled) => {
    const { activeLayerIndex } = get();
    set((state) => ({
      maps: updateMap(state.maps, mapIndex, (map) =>
        applyToActiveLayer(map, activeLayerIndex, (data) =>
          drawRectangleOnLayer(data, selection, cell, filled)
        )
      ),
    }));
    get().commit();
  },

  beginMapSelection: (x, y) => set({ mapSelection: createMapSelectionState(x, y) }),

  updateMapSelection: (x, y) => {
    const { mapSelection } = get();
    const startX = mapSelection.startX ?? mapSelection.x;
    const startY = mapSelection.startY ?? mapSelection.y;
    set({ mapSelection: { hasSelection: true, startX, startY, ...normalizeMapSelection(startX, startY, x, y) } });
  },
endMapSelection: () => {
  const { mapSelection } = get();
  if (!(mapSelection.width > 0 && mapSelection.height > 0)) {
    set({ mapSelection: emptyMapSelection });
  }
  get().commit();
},


  clearMapSelection: () => set({ mapSelection: emptyMapSelection }),

  copyMapSelection: () => {
