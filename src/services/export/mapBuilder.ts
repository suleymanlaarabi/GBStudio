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
  const visibleLayers = map.layers.filter((layer) => layer.visible);
  const tilesetLookup = new Map(tilesets.map((t) => [t.id, t]));
  const tileBytes: number[][] = [new Array(16).fill(0)];
  const tileIndexLookup = new Map<string, number>();
  let sourceTileCount = 0;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let hasTiles = false;

  visibleLayers.forEach((layer) => {
    Object.values(layer.chunks).forEach((chunk) => {
      for (let y = 0; y < CHUNK_SIZE; y++) {
        for (let x = 0; x < CHUNK_SIZE; x++) {
          if (chunk.data[y][x]) {
            const gx = chunk.x * CHUNK_SIZE + x;
            const gy = chunk.y * CHUNK_SIZE + y;
            if (gx < minX) minX = gx;
            if (gy < minY) minY = gy;
            if (gx > maxX) maxX = gx;
            if (gy > maxY) maxY = gy;
            hasTiles = true;
          }
        }
      }
    });
  });

  const safeName = sanitizeName(map.name);
  if (!hasTiles) return emptyExport(map, safeName);

  const logicalW = maxX - minX + 1;
  const logicalH = maxY - minY + 1;
  const hwW = is16 ? logicalW * 2 : logicalW;
  const hwH = is16 ? logicalH * 2 : logicalH;
  const hwData = new Array<number>(hwW * hwH).fill(0);

  const getLocalBase = (tilesetId: string, tileIndex: number): number => {
    const key = `${tilesetId}:${tileIndex}`;
    const hit = tileIndexLookup.get(key);
    if (hit !== undefined) return hit;
    const tileset = tilesetLookup.get(tilesetId);
    const tile = tileset?.tiles[tileIndex];
    if (!tile) return 0;
    const base = tileBytes.length;
    expandTileData(tile.data, tile.size).forEach((b) => tileBytes.push(b));
    tileIndexLookup.set(key, base);
    sourceTileCount++;
    return base;
  };

  for (let ly = 0; ly < logicalH; ly++) {
    for (let lx = 0; lx < logicalW; lx++) {
      const gx = minX + lx;
      const gy = minY + ly;
      const cx = Math.floor(gx / CHUNK_SIZE);
      const cy = Math.floor(gy / CHUNK_SIZE);
      const localX = ((gx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      const localY = ((gy % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      const chunkKey = `${cx},${cy}`;

      let cell = null;
      for (let li = visibleLayers.length - 1; li >= 0; li--) {
        const ch = visibleLayers[li].chunks[chunkKey];
        if (ch && ch.data[localY]?.[localX]) { cell = ch.data[localY][localX]; break; }
      }
      if (!cell) continue;
