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
