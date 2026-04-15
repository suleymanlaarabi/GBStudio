import type { GBColor, TileSize } from "./core";

export interface Tile {
  id: string;
  data: GBColor[][];
  size: TileSize;
}

export interface Tileset {
  id: string;
  name: string;
  tiles: Tile[];
  tileSize: TileSize;
}

export interface TileCell {
  tilesetId: string;
  tileIndex: number;
}
