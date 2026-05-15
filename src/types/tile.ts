import type { GBColor, TileSize } from "./core";

export interface Tile {
  id: string;
  data: (GBColor | null)[][];
  size: TileSize;
}

export interface TilesetLayoutPosition {
  x: number;
  y: number;
}

export interface TilesetLayout {
  columns: number;
  positions: Record<string, TilesetLayoutPosition>;
}

export interface Tileset {
  id: string;
  name: string;
  tiles: Tile[];
  tileSize: TileSize;
  layout?: TilesetLayout;
}

export interface TileCell {
  tilesetId: string;
  tileIndex: number;
}
