import type { TileCell } from "./tile";
import type { TileSize } from "./core";
import type { SelectionState } from "./selection";

export interface TileMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tileSize: TileSize;
  data: (TileCell | null)[][];
}

export type MapClipboard = (TileCell | null)[][];
export type MapSelectionState = SelectionState;
