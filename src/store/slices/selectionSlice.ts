import type { StateCreator } from "zustand";
import type { GBColor, SelectionBounds, SelectionState, Tileset } from "../../types";
import { clearTileArea, fillTileArea } from "../../services/tileService";
import {
import { normalizeSelection, selectAll } from "../../utils";
  copySelectionContent,
  cutSelectionContent,
  deleteSelectionContent,
  moveSelectionContent,
  pasteSelectionContent,
  flipSelectionHorizontal as flipServiceSelectionHorizontal,
  flipSelectionVertical as flipServiceSelectionVertical,
  rotateSelectionClockwise as rotateServiceClockwise,
  rotateSelectionCounterClockwise as rotateServiceCounterClockwise,
} from "../../services/selectionService";

export interface SelectionSlice {
  selection: SelectionState;
  clipboard: (GBColor | null)[][] | null;
  beginSelection: (x: number, y: number) => void;
  updateSelection: (x: number, y: number) => void;
  endSelection: () => void;
  clearSelection: () => void;
  selectAll: () => void;
  copySelection: () => void;
  cutSelection: () => void;
  pasteSelection: (x: number, y: number) => void;
  deleteSelection: () => void;
  moveSelection: (deltaX: number, deltaY: number) => void;
  updateSelectionBounds: (x: number, y: number) => void;
  flipSelectionHorizontal: () => void;
  flipSelectionVertical: () => void;
  rotateSelectionClockwise: () => void;
  rotateSelectionCounterClockwise: () => void;
  fillArea: (
    tilesetIndex: number,
    tileIndex: number,
    selection: SelectionBounds,
    color: GBColor,
  ) => void;
  clearArea: (tilesetIndex: number, tileIndex: number, selection: SelectionBounds) => void;
}

type SelectionStoreState = SelectionSlice & {
  activeTileIndex: number;
  activeTilesetIndex: number;
  commit: () => void;
  tilesets: Tileset[];
};

const emptySelection: SelectionState = {
  hasSelection: false,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

const updateActiveTileData = (
  tilesets: Tileset[],
  activeTilesetIndex: number,
  activeTileIndex: number,
  data: (GBColor | null)[][],
): Tileset[] =>
  tilesets.map((tileset, tilesetIndex) =>
    tilesetIndex === activeTilesetIndex
      ? {
          ...tileset,
          tiles: tileset.tiles.map((tile, tileIndex) =>
            tileIndex === activeTileIndex ? { ...tile, data } : tile,
          ),
        }
      : tileset,
  );

export const createSelectionSlice: StateCreator<
  SelectionStoreState,
  [],
  [],
  SelectionSlice
> = (set, get) => ({
  selection: emptySelection,
  clipboard: null,

  beginSelection: (x, y) =>
    set({
      selection: { hasSelection: true, startX: x, startY: y, x, y, width: 0, height: 0 },
    }),

  updateSelection: (x, y) => {
    const { selection } = get();
    if (!selection.hasSelection || selection.startX === undefined || selection.startY === undefined) return;
    
    set({
      selection: { 
        ...selection,
        ...normalizeSelection(selection.startX, selection.startY, x, y) 
      },
    });
  },

  endSelection: () => {
    const { selection } = get();
    if (!(selection.hasSelection && selection.width > 0 && selection.height > 0)) {
      set({ selection: emptySelection });
    }
    get().commit();
  },

  clearSelection: () => set({ selection: emptySelection }),

  selectAll: () => {
    const { tilesets, activeTilesetIndex, activeTileIndex } = get();
    const tile = tilesets[activeTilesetIndex]?.tiles[activeTileIndex];
    if (!tile) return;
    set({ selection: { hasSelection: true, ...selectAll(tile.size) } });
  },

  copySelection: () => {
    const { tilesets, activeTilesetIndex, activeTileIndex, selection } = get();
    if (!selection.hasSelection) return;
    const tile = tilesets[activeTilesetIndex]?.tiles[activeTileIndex];
    if (!tile) return;
    set({ clipboard: copySelectionContent(tile.data, selection) });
  },

  cutSelection: () => {
    const { tilesets, activeTilesetIndex, activeTileIndex, selection } = get();
    if (!selection.hasSelection) return;
    const tile = tilesets[activeTilesetIndex]?.tiles[activeTileIndex];
    if (!tile) return;

    const result = cutSelectionContent(tile.data, selection);
    set({
