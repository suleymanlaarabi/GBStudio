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

      const base = getLocalBase(cell.tilesetId, cell.tileIndex);
      if (is16) {
        for (let seg = 0; seg < 4; seg++) {
          const hx = lx * 2 + (seg % 2);
          const hy = ly * 2 + Math.floor(seg / 2);
          hwData[hy * hwW + hx] = base + seg;
        }
      } else {
        hwData[ly * hwW + lx] = base;
      }
    }
  }

  // Build 16×16 hardware-tile chunks with deduplication
  const worldW = Math.ceil(hwW / HW_CHUNK);
  const worldH = Math.ceil(hwH / HW_CHUNK);
  const chunkCache = new Map<string, number>();
  const allChunks: number[][] = [];
  const worldChunkIndices: number[] = [];

  for (let cy = 0; cy < worldH; cy++) {
    for (let cx = 0; cx < worldW; cx++) {
      const chunk = new Array<number>(256).fill(0);
      for (let ty = 0; ty < HW_CHUNK; ty++) {
        for (let tx = 0; tx < HW_CHUNK; tx++) {
          const hx = cx * HW_CHUNK + tx;
          const hy = cy * HW_CHUNK + ty;
          if (hx < hwW && hy < hwH) chunk[ty * HW_CHUNK + tx] = hwData[hy * hwW + hx];
        }
      }
      const key = chunk.join(",");
      let idx = chunkCache.get(key);
      if (idx === undefined) {
        idx = allChunks.length;
        allChunks.push(chunk);
        chunkCache.set(key, idx);
      }
      worldChunkIndices.push(idx);
    }
  }

  // Flat collision bitfield
  const collisionData: number[] = [];
  if (map.collisionData && Object.keys(map.collisionData).length > 0) {
    const byteCount = Math.ceil((hwW * hwH) / 8);
    const bytes = new Array<number>(byteCount).fill(0);
    for (let ly = 0; ly < logicalH; ly++) {
      for (let lx = 0; lx < logicalW; lx++) {
        const gx = minX + lx;
        const gy = minY + ly;
        const mcx = Math.floor(gx / CHUNK_SIZE);
        const mcy = Math.floor(gy / CHUNK_SIZE);
        const ch = map.collisionData[`${mcx},${mcy}`];
        if (!ch) continue;
        const localX = ((gx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localY = ((gy % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        if (!ch[localY]?.[localX]) continue;
        const nHwX = is16 ? 2 : 1;
        const nHwY = is16 ? 2 : 1;
        for (let sy = 0; sy < nHwY; sy++) {
          for (let sx = 0; sx < nHwX; sx++) {
            const hx = lx * nHwX + sx;
            const hy = ly * nHwY + sy;
            const bit = hy * hwW + hx;
            bytes[bit >> 3] |= 1 << (bit & 7);
          }
        }
      }
    }
    collisionData.push(...bytes);
  }

  const spawnTileX = map.cameraSpawn?.x ?? minX;
  const spawnTileY = map.cameraSpawn?.y ?? minY;

  return {
    map,
    safeName,
    tilesSafeName: `${safeName}_tiles`,
    worldSafeName: `${safeName}_world`,
    collisionSafeName: `${safeName}_collision`,
    tileBytes,
    tileCount: tileBytes.length,
    tilesBank: 0,
    tileRomSize: tileBytes.length * 16,
    allChunks,
    chunkBanks: [],
    worldChunkIndices,
    worldRefs: [],
    worldW,
    worldH,
    worldBank: 0,
    worldRomSize: worldW * worldH * 3,
    collisionData,
    collisionBank: 0,
    collisionRomSize: collisionData.length,
    spawnX: (spawnTileX - minX) * map.tileSize,
    spawnY: (spawnTileY - minY) * map.tileSize,
    minX: is16 ? minX * 2 : minX,
    minY: is16 ? minY * 2 : minY,
    sourceTileCount,
  };
};
