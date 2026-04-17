import type { TileMap, Tileset } from "../../types";
import { CHUNK_SIZE } from "../../types/map";
import type { MapExport } from "./types";
import { expandTileData } from "./tiles";
import { sanitizeName } from "./utils";

export const buildMapExport = (map: TileMap, tilesets: Tileset[]): MapExport => {
  const is16 = map.tileSize === 16;
  const visibleLayers = map.layers.filter((layer) => layer.visible);
  const tilesetLookup = new Map(tilesets.map((tileset) => [tileset.id, tileset]));
  const tileBytes: number[][] = [new Array(16).fill(0)];
  const tileIndexLookup = new Map<string, number>();
  let sourceTileCount = 0;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let hasTiles = false;

  visibleLayers.forEach((layer) => {
    Object.values(layer.chunks).forEach((chunk) => {
      for (let y = 0; y < CHUNK_SIZE; y += 1) {
        for (let x = 0; x < CHUNK_SIZE; x += 1) {
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

  if (!hasTiles) {
    return {
      map,
      safeName,
      tilesSafeName: `${safeName}_tiles`,
      mapSafeName: `${safeName}_map`,
      collisionSafeName: `${safeName}_collision`,
      tileBytes,
      tileCount: 1,
      mapData: [],
      collisionData: [],
      width: 0,
      height: 0,
      minX: 0,
      minY: 0,
      spawnX: 0,
      spawnY: 0,
      romSize: 16,
      romBank: 0,
      sourceTileCount: 0,
    };
  }

  const logicalWidth = maxX - minX + 1;
  const logicalHeight = maxY - minY + 1;
  const hardwareWidth = is16 ? logicalWidth * 2 : logicalWidth;
  const hardwareHeight = is16 ? logicalHeight * 2 : logicalHeight;
  const hardwareData: number[] = new Array(hardwareWidth * hardwareHeight).fill(0);

  const getLocalBaseIndex = (tilesetId: string, tileIndex: number) => {
    const key = `${tilesetId}:${tileIndex}`;
    const existing = tileIndexLookup.get(key);
    if (existing !== undefined) return existing;

    const tileset = tilesetLookup.get(tilesetId);
    const tile = tileset?.tiles[tileIndex];
    if (!tile) return 0;

    const localBaseIndex = tileBytes.length;
    expandTileData(tile.data, tile.size).forEach((bytes) => tileBytes.push(bytes));
    tileIndexLookup.set(key, localBaseIndex);
    sourceTileCount += 1;
    return localBaseIndex;
  };

  for (let ly = 0; ly < logicalHeight; ly += 1) {
    for (let lx = 0; lx < logicalWidth; lx += 1) {
      const gx = minX + lx;
      const gy = minY + ly;
      const cx = Math.floor(gx / CHUNK_SIZE);
      const cy = Math.floor(gy / CHUNK_SIZE);
      const localX = ((gx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      const localY = ((gy % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      const chunkKey = `${cx},${cy}`;

      let cell = null;
      for (let layerIndex = visibleLayers.length - 1; layerIndex >= 0; layerIndex -= 1) {
        const chunk = visibleLayers[layerIndex].chunks[chunkKey];
        if (chunk && chunk.data[localY]?.[localX]) {
          cell = chunk.data[localY][localX];
          break;
        }
      }

      if (!cell) continue;

      const localBaseIndex = getLocalBaseIndex(cell.tilesetId, cell.tileIndex);
      if (is16) {
        for (let segment = 0; segment < 4; segment += 1) {
          const hx = lx * 2 + (segment % 2);
          const hy = ly * 2 + Math.floor(segment / 2);
          hardwareData[hy * hardwareWidth + hx] = localBaseIndex + segment;
        }
      } else {
        hardwareData[ly * hardwareWidth + lx] = localBaseIndex;
      }
    }
  }

  const collisionData: number[] = [];
  if (map.collisionData && Object.keys(map.collisionData).length > 0) {
    const totalHwTiles = hardwareWidth * hardwareHeight;
    const byteCount = Math.ceil(totalHwTiles / 8);
    const bytes = new Array<number>(byteCount).fill(0);

    for (let ly = 0; ly < logicalHeight; ly += 1) {
      for (let lx = 0; lx < logicalWidth; lx += 1) {
        const gx = minX + lx;
        const gy = minY + ly;
        const cx = Math.floor(gx / CHUNK_SIZE);
        const cy = Math.floor(gy / CHUNK_SIZE);
        const chunk = map.collisionData[`${cx},${cy}`];
        if (!chunk) continue;

        const localX = ((gx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localY = ((gy % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        if (!chunk[localY]?.[localX]) continue;

        const hwTilesX = is16 ? 2 : 1;
        const hwTilesY = is16 ? 2 : 1;
        for (let sy = 0; sy < hwTilesY; sy += 1) {
          for (let sx = 0; sx < hwTilesX; sx += 1) {
            const hx = lx * hwTilesX + sx;
            const hy = ly * hwTilesY + sy;
            const bitIdx = hy * hardwareWidth + hx;
            bytes[bitIdx >> 3] |= 1 << (bitIdx & 7);
          }
        }
      }
    }

    collisionData.push(...bytes);
  }

  const spawnTileX = map.cameraSpawn?.x ?? minX;
  const spawnTileY = map.cameraSpawn?.y ?? minY;
  const spawnX = (spawnTileX - minX) * map.tileSize;
  const spawnY = (spawnTileY - minY) * map.tileSize;
  const romSize = tileBytes.length * 16 + hardwareData.length + collisionData.length;

  return {
    map,
    safeName,
    tilesSafeName: `${safeName}_tiles`,
    mapSafeName: `${safeName}_map`,
    collisionSafeName: `${safeName}_collision`,
    tileBytes,
    tileCount: tileBytes.length,
    mapData: hardwareData,
    collisionData,
    width: hardwareWidth,
    height: hardwareHeight,
    minX: is16 ? minX * 2 : minX,
    minY: is16 ? minY * 2 : minY,
    spawnX,
    spawnY,
    romSize,
    romBank: 0,
    sourceTileCount,
  };
};
