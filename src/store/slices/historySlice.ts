import type { StateCreator } from "zustand";
import type {
  MapSelectionState,
  SelectionState,
  SpriteAsset,
  SoundAsset,
  TileMap,
  Tileset,
} from "../../types";

export interface HistorySlice {
  history: string[];
  historyIndex: number;
  commit: () => void;
  undo: () => void;
  redo: () => void;
}

// State parts that are tracked in history
export interface HistorySnapshot {
  tilesets: Tileset[];
  maps: TileMap[];
  sprites: SpriteAsset[];
  sounds: SoundAsset[];
  selection: SelectionState;
  mapSelection: MapSelectionState;
}

export const createHistorySlice: StateCreator<
  HistorySnapshot & HistorySlice,
  [],
  [],
