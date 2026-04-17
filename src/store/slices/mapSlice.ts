import type { StateCreator } from "zustand";
import type {
  MapClipboard,
  MapLayer,
  MapSelectionState,
  SelectionBounds,
  TileCell,
  TileMap,
  TileSelection,
  Tileset,
  TileSize,
} from "../../types";
import {
  applyToActiveLayer,
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
} from "../../services/mapService";
import {
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
  // Layer operations
  addLayer: (mapIndex: number) => void;
  removeLayer: (mapIndex: number, layerIndex: number) => void;
  moveLayerUp: (mapIndex: number, layerIndex: number) => void;
  moveLayerDown: (mapIndex: number, layerIndex: number) => void;
  toggleLayerVisibility: (mapIndex: number, layerIndex: number) => void;
  renameLayer: (mapIndex: number, layerIndex: number, name: string) => void;
  duplicateLayer: (mapIndex: number, layerIndex: number) => void;
}

const createEmptyMap = (name: string, width: number, height: number, tileSize: TileSize): TileMap => ({
  id: crypto.randomUUID(),
  name,
  width,
  height,
  tileSize,
  layers: [createEmptyLayer("Layer 1", width, height)],
});

type MapState = MapSlice & {
  activeMapIndex: number;
  activeLayerIndex: number;
  activeTileIndex: number;
  activeTilesetIndex: number;
  commit: () => void;
  tilesets: Tileset[];
  view: "tiles" | "gallery" | "map_editor" | "studio";
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
          setLayerCell(data, x, y, { tilesetId, tileIndex }, map.width, map.height)
        )
      ),
    }));
  },

  clearMapCell: (mapIndex, x, y) => {
    const { activeLayerIndex } = get();
    set((state) => ({
      maps: updateMap(state.maps, mapIndex, (map) =>
        applyToActiveLayer(map, activeLayerIndex, (data) =>
          setLayerCell(data, x, y, null, map.width, map.height)
        )
      ),
    }));
  },

  fillMap: (mapIndex, x, y, tilesetId, tileIndex) => {
    const { activeLayerIndex } = get();
    set((state) => ({
      maps: updateMap(state.maps, mapIndex, (map) =>
        applyToActiveLayer(map, activeLayerIndex, (data) =>
          floodFillLayer(data, x, y, { tilesetId, tileIndex }, map.width, map.height)
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
          paintBrushOnLayer(data, x, y, tileSelection, map.width, map.height)
        )
      ),
    }));
  },

  drawMapLine: (mapIndex, startX, startY, endX, endY, cell) => {
    const { activeLayerIndex } = get();
    set((state) => ({
      maps: updateMap(state.maps, mapIndex, (map) =>
        applyToActiveLayer(map, activeLayerIndex, (data) =>
          drawLineOnLayer(data, startX, startY, endX, endY, cell, map.width, map.height)
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
          drawRectangleOnLayer(data, selection, cell, filled, map.width, map.height)
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
    if (mapSelection.width > 0 && mapSelection.height > 0) return;
    set({ mapSelection: emptyMapSelection });
  },

  clearMapSelection: () => set({ mapSelection: emptyMapSelection }),

  copyMapSelection: () => {
    const { maps, activeMapIndex, mapSelection, activeLayerIndex } = get();
    const map = maps[activeMapIndex];
    if (!map || !mapSelection.hasSelection) return;
    const data = getActiveLayerData(map, activeLayerIndex);
    set({ mapClipboard: extractLayerSelection(data, mapSelection) });
  },

  cutMapSelection: () => {
    const { maps, activeMapIndex, mapSelection, activeLayerIndex } = get();
    const map = maps[activeMapIndex];
    if (!map || !mapSelection.hasSelection) return;
    const data = getActiveLayerData(map, activeLayerIndex);
    set((state) => ({
      mapClipboard: extractLayerSelection(data, mapSelection),
      maps: updateMap(state.maps, activeMapIndex, (m) =>
        applyToActiveLayer(m, activeLayerIndex, (d) =>
          clearLayerArea(d, mapSelection, m.width, m.height)
        )
      ),
    }));
    get().commit();
  },

  pasteMapSelection: (targetX, targetY) => {
    const { activeMapIndex, mapClipboard, activeLayerIndex } = get();
    if (!mapClipboard) return;
    set((state) => ({
      maps: updateMap(state.maps, activeMapIndex, (map) =>
        applyToActiveLayer(map, activeLayerIndex, (data) =>
          pasteLayerSelection(data, mapClipboard, targetX, targetY, map.width, map.height)
        )
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
    const { activeMapIndex, mapSelection, activeLayerIndex } = get();
    if (!mapSelection.hasSelection) return;
    set((state) => ({
      maps: updateMap(state.maps, activeMapIndex, (map) =>
        applyToActiveLayer(map, activeLayerIndex, (data) =>
          clearLayerArea(data, mapSelection, map.width, map.height)
        )
      ),
      mapSelection: emptyMapSelection,
    }));
    get().commit();
  },

  pickMapCell: (mapIndex, x, y) => {
    const { maps, tilesets, activeLayerIndex } = get();
    const map = maps[mapIndex];
    if (!map) return;
    const data = getActiveLayerData(map, activeLayerIndex);
    const cell = data[y]?.[x] ?? null;
    if (!cell) return;
    const tilesetIndex = tilesets.findIndex((ts) => ts.id === cell.tilesetId);
    if (tilesetIndex < 0) return;
    set({ activeTilesetIndex: tilesetIndex, activeTileIndex: cell.tileIndex });
  },

  addMap: (name, width, height, tileSize) => {
    set((state) => ({
      maps: [...state.maps, createEmptyMap(name, width, height, tileSize)],
      activeMapIndex: state.maps.length,
      activeLayerIndex: 0,
      view: "map_editor",
    }));
    get().commit();
  },

  removeMap: (index) => {
    set((state) => ({
      maps: state.maps.filter((_, i) => i !== index),
      activeMapIndex: -1,
    }));
    get().commit();
  },

  // --- Layer operations ---

  addLayer: (mapIndex) => {
    set((state) => {
      const map = state.maps[mapIndex];
      if (!map) return state;
      const newLayer = createEmptyLayer(`Layer ${map.layers.length + 1}`, map.width, map.height);
      const newLayers = [...map.layers, newLayer];
      return {
        maps: updateMap(state.maps, mapIndex, (m) => ({ ...m, layers: newLayers })),
        activeLayerIndex: newLayers.length - 1,
      };
    });
    get().commit();
  },

  removeLayer: (mapIndex, layerIndex) => {
    set((state) => {
      const map = state.maps[mapIndex];
      if (!map || map.layers.length <= 1) return state;
      const newLayers = map.layers.filter((_, i) => i !== layerIndex);
      const newActiveLayer = Math.min(state.activeLayerIndex, newLayers.length - 1);
      return {
        maps: updateMap(state.maps, mapIndex, (m) => ({ ...m, layers: newLayers })),
        activeLayerIndex: newActiveLayer,
      };
    });
    get().commit();
  },

  moveLayerUp: (mapIndex, layerIndex) => {
    set((state) => {
      const map = state.maps[mapIndex];
      if (!map || layerIndex >= map.layers.length - 1) return state;
      const newLayers = [...map.layers];
      [newLayers[layerIndex], newLayers[layerIndex + 1]] = [newLayers[layerIndex + 1]!, newLayers[layerIndex]!];
      return {
        maps: updateMap(state.maps, mapIndex, (m) => ({ ...m, layers: newLayers })),
        activeLayerIndex: layerIndex + 1,
      };
    });
    get().commit();
  },

  moveLayerDown: (mapIndex, layerIndex) => {
    set((state) => {
      const map = state.maps[mapIndex];
      if (!map || layerIndex <= 0) return state;
      const newLayers = [...map.layers];
      [newLayers[layerIndex], newLayers[layerIndex - 1]] = [newLayers[layerIndex - 1]!, newLayers[layerIndex]!];
      return {
        maps: updateMap(state.maps, mapIndex, (m) => ({ ...m, layers: newLayers })),
        activeLayerIndex: layerIndex - 1,
      };
    });
    get().commit();
  },

  toggleLayerVisibility: (mapIndex, layerIndex) => {
    set((state) => ({
      maps: updateMap(state.maps, mapIndex, (map) => ({
        ...map,
        layers: map.layers.map((layer, i) =>
          i === layerIndex ? { ...layer, visible: !layer.visible } : layer
        ),
      })),
    }));
  },

  renameLayer: (mapIndex, layerIndex, name) => {
    set((state) => ({
      maps: updateMap(state.maps, mapIndex, (map) => ({
        ...map,
        layers: map.layers.map((layer, i) =>
          i === layerIndex ? { ...layer, name } : layer
        ),
      })),
    }));
  },

  duplicateLayer: (mapIndex, layerIndex) => {
    set((state) => {
      const map = state.maps[mapIndex];
      if (!map) return state;
      const source = map.layers[layerIndex];
      if (!source) return state;
      const newLayer: MapLayer = {
        id: crypto.randomUUID(),
        name: `${source.name} (copie)`,
        visible: true,
        data: source.data.map((row) => row.map((cell) => (cell ? { ...cell } : null))),
      };
      const newLayers = [...map.layers.slice(0, layerIndex + 1), newLayer, ...map.layers.slice(layerIndex + 1)];
      return {
        maps: updateMap(state.maps, mapIndex, (m) => ({ ...m, layers: newLayers })),
        activeLayerIndex: layerIndex + 1,
      };
    });
    get().commit();
  },
});

