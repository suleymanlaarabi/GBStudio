import { create } from "zustand";
import type {
  GBColor,
  MapClipboard,
  MapSelectionState,
  MapTool,
  ProjectData,
  SelectionBounds,
  TileMap,
  TileSize,
  Tileset,
  SpriteAsset,
} from "../types";
import { createHistorySlice, type HistorySlice } from "./slices/historySlice";
import { createMapSlice, type MapSlice } from "./slices/mapSlice";
import { createProjectSlice, type ProjectSlice } from "./slices/projectSlice";
import { createSelectionSlice, type SelectionSlice } from "./slices/selectionSlice";
import { createSpriteSlice, type SpriteSlice } from "./slices/spriteSlice";
import { createTileSlice, type TileSlice } from "./slices/tileSlice";
import { createUISlice, type UISlice } from "./slices/uiSlice";

export type EditorState = TileSlice &
  MapSlice &
  SpriteSlice &
  HistorySlice &
  SelectionSlice &
  ProjectSlice &
  UISlice;

export const useStore = create<EditorState>()((...args) => {
  const slices = {
    ...createUISlice(...args),
    ...createTileSlice(...args),
    ...createMapSlice(...args),
    ...createSpriteSlice(...args),
    ...createSelectionSlice(...args),
    ...createProjectSlice(...args),
    ...createHistorySlice(...args),
  };

  // Initial history snapshot
  const initialState = {
    tilesets: slices.tilesets,
    maps: slices.maps,
    sprites: slices.sprites,
    selection: slices.selection,
    mapSelection: slices.mapSelection,
  };

  return {
    ...slices,
    history: [JSON.stringify(initialState)],
    historyIndex: 0,
  };
});

export type {
  GBColor,
  MapClipboard,
  MapSelectionState,
  MapTool,
  ProjectData,
  SelectionBounds as Selection,
  SpriteAsset,
  TileMap,
  TileSize,
  Tileset,
};

export type { Template, TemplateCategory } from "../types/template";
