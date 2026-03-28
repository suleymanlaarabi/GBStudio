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
  HistorySlice
> = (set, get) => ({
  history: [],
  historyIndex: -1,

  commit: () => {
    const state = get();
    const snapshotObj: HistorySnapshot = {
      tilesets: state.tilesets,
      maps: state.maps,
      sprites: state.sprites,
      sounds: state.sounds,
      selection: state.selection,
      mapSelection: state.mapSelection,
    };
