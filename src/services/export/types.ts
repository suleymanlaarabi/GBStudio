export interface ExpandedTileset {
  id: string;
  name: string;
  safeName: string;
  tileCount: number;
  tileBytes: number[][];
}

export interface MapExport {
  map: import("../../types").TileMap;
  safeName: string;
  tilesSafeName: string;
  mapSafeName: string;
  collisionSafeName: string;
  tileBytes: number[][];
  tileCount: number;
  mapData: number[];
  collisionData: number[];
  width: number;
  height: number;
  minX: number;
  minY: number;
  spawnX: number;
  spawnY: number;
  romSize: number;
  romBank: number;
  sourceTileCount: number;
}

export interface RomBank {
  id: number;
  usedBytes: number;
  assetNames: string[];
}

export interface RomAllocationPlan {
  banks: RomBank[];
  totalBytes: number;
}
