import type { TileCell } from "./tile";
import type { TileSize } from "./core";
import type { SelectionState } from "./selection";
import type { SpriteInstance } from "./sprite";

export const CHUNK_SIZE = 16;

export interface Chunk {
  x: number;
  y: number;
  data: (TileCell | null)[][];
}

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  chunks: Record<string, Chunk>;
}

export interface WindowLayer {
  enabled: boolean;
  wx: number;   // tile columns from left edge (0 = full screen)
