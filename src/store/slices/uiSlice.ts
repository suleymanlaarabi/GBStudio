import type { StateCreator } from "zustand";
import type { GBColor, MapTool, Tool, View } from "../../types";

export interface UISlice {
  activeTilesetIndex: number;
  activeTileIndex: number;
  activeMapIndex: number;
  activeSpriteIndex: number;
  activeLayerIndex: number;
  selectedColor: GBColor;
  tool: Tool;
  mapTool: MapTool;
  mapShapeFilled: boolean;
  view: View;
  zoom: number;
  selectedSpriteInstanceId: string | null;
  activeLayerIsWindow: boolean;
  setView: (view: View) => void;
  setZoom: (zoom: number) => void;
  setActiveTileset: (index: number) => void;
  setActiveTile: (index: number) => void;
  setActiveMap: (index: number) => void;
  setActiveSprite: (index: number) => void;
  setActiveLayer: (index: number) => void;
  setSelectedColor: (color: GBColor) => void;
  setTool: (tool: Tool) => void;
  setMapTool: (tool: MapTool) => void;
  setMapShapeFilled: (filled: boolean) => void;
  setSelectedSpriteInstance: (id: string | null) => void;
  setActiveLayerIsWindow: (v: boolean) => void;
}

type UIState = UISlice & {
  mapSelection: { hasSelection: boolean; x: number; y: number; width: number; height: number };
  activeLayerIndex: number;
};

export const createUISlice: StateCreator<UIState, [], [], UISlice> = (set) => ({
  activeTilesetIndex: 0,
  activeTileIndex: 0,
  activeMapIndex: -1,
  activeSpriteIndex: 0,
  activeLayerIndex: 0,
  selectedColor: 3,
  tool: "pencil",
  mapTool: "pencil",
  mapShapeFilled: true,
  view: "tiles",
  zoom: 3,
  selectedSpriteInstanceId: null,
  activeLayerIsWindow: false,

  setView: (view) => set({ view }),
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(15, zoom)) }),
  setActiveTileset: (index) => set({ activeTilesetIndex: index, activeTileIndex: 0 }),
  setActiveTile: (index) => set({ activeTileIndex: index }),
  setActiveMap: (index) => {
    set({
      activeMapIndex: index,
      activeLayerIndex: 0,
      view: "map_editor",
      mapSelection: {
