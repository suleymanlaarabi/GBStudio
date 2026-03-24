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
