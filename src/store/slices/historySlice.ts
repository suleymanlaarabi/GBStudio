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
    
    const snapshot = JSON.stringify(snapshotObj);
    const { history, historyIndex } = get();

    // Avoid duplicate snapshots
    if (historyIndex >= 0 && history[historyIndex] === snapshot) return;

    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(snapshot);
    
    // Limit history to 50 steps
    if (nextHistory.length > 50) {
      nextHistory.shift();
    }

