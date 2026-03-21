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
