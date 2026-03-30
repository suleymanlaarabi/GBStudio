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
  bankId: number;
  chunkVarName: string;
  byteOffset: number;
}

export interface MapExport {
  map: import("../../types").TileMap;
  safeName: string;
  tilesSafeName: string;
  worldSafeName: string;
  collisionSafeName: string;

  tileBytes: number[][];
  tileCount: number;
  tilesBank: number;
  tileRomSize: number;

  allChunks: number[][];
  chunkBanks: ChunkBankData[];
  worldChunkIndices: number[];
  worldRefs: WorldRef[];
  worldW: number;
  worldH: number;
  worldBank: number;
  worldRomSize: number;

  collisionData: number[];
  collisionBank: number;
  collisionRomSize: number;

