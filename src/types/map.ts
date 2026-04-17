import type { TileCell } from "./tile";
import type { TileSize } from "./core";
import type { SelectionState } from "./selection";

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  data: (TileCell | null)[][];
}

export interface TileMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tileSize: TileSize;
  layers: MapLayer[];
}

export type MapClipboard = (TileCell | null)[][];
export type MapSelectionState = SelectionState;
