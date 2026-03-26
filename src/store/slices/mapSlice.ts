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
