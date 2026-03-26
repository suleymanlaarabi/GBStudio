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

