import { create } from "zustand";
import type {
import { createHistorySlice, type HistorySlice } from "./slices/historySlice";
import { createMapSlice, type MapSlice } from "./slices/mapSlice";
import { createProjectSlice, type ProjectSlice } from "./slices/projectSlice";
import { createSelectionSlice, type SelectionSlice } from "./slices/selectionSlice";
import { createSpriteSlice, type SpriteSlice } from "./slices/spriteSlice";
import { createSoundSlice, type SoundSlice } from "./slices/soundSlice";
import { createTileSlice, type TileSlice } from "./slices/tileSlice";
import { createUISlice, type UISlice } from "./slices/uiSlice";
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

export type EditorState = TileSlice &
  MapSlice &
  SpriteSlice &
  SoundSlice &
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
    ...createSoundSlice(...args),
    ...createSelectionSlice(...args),
    ...createProjectSlice(...args),
    ...createHistorySlice(...args),
  };
