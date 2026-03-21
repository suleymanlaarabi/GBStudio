export interface ExpandedTileset {
  id: string;
  name: string;
  safeName: string;
  tileCount: number;
  tileBytes: number[][];
}

export interface ChunkBankData {
  bankId: number;
  varName: string;
  bytes: number[];
}

export interface WorldRef {
