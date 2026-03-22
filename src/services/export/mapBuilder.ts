import type { TileMap, Tileset } from "../../types";
import { CHUNK_SIZE } from "../../types/map";
import type { MapExport } from "./types";
import { expandTileData } from "./tiles";
import { sanitizeName } from "./utils";

const HW_CHUNK = 16;

const emptyExport = (map: TileMap, safeName: string): MapExport => ({
  map,
  safeName,
  tilesSafeName: `${safeName}_tiles`,
  worldSafeName: `${safeName}_world`,
  collisionSafeName: `${safeName}_collision`,
  tileBytes: [new Array(16).fill(0)],
  tileCount: 1,
  tilesBank: 0,
  tileRomSize: 16,
  allChunks: [new Array(256).fill(0)],
  chunkBanks: [],
  worldChunkIndices: [0],
  worldRefs: [],
  worldW: 1,
  worldH: 1,
  worldBank: 0,
  worldRomSize: 3,
  collisionData: [],
  collisionBank: 0,
  collisionRomSize: 0,
  spawnX: 0,
  spawnY: 0,
  minX: 0,
  minY: 0,
  sourceTileCount: 0,
});

export const buildMapExport = (map: TileMap, tilesets: Tileset[]): MapExport => {
  const is16 = map.tileSize === 16;
