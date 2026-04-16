export interface SelectionState {
  hasSelection: boolean;
  startX?: number;
  startY?: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SelectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TileSelection extends SelectionState {
  // Contains the actual tile data for the selected area
  tileData: Array<Array<{ tilesetId: string; tileIndex: number } | null>>;
}
