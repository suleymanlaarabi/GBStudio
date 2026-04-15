import type {
  GBColor,
  SpriteAsset,
  TileMap,
  Tileset,
} from "../store/useStore";

export const convertTileDataTo2BPP = (data: GBColor[][], size: number): string[] => {
  const bytes: number[] = [];
  for (let y = 0; y < size; y++) {
    let lowByte = 0;
    let highByte = 0;
    for (let x = 0; x < size; x++) {
      const color = data[y]![x] as GBColor;
      const lowBit = color & 1;
      const highBit = (color >> 1) & 1;
      lowByte |= lowBit << (7 - x);
      highByte |= highBit << (7 - x);
    }
    bytes.push(lowByte, highByte);
  }
  return bytes.map((b) => `0x${b.toString(16).padStart(2, "0")}`);
};

const sanitizeName = (name: string) => {
  const normalized = name.replace(/[^a-z0-9]/gi, "_");
  return /^[0-9]/.test(normalized) ? `asset_${normalized}` : normalized || "asset";
};

interface ExpandedTileset {
  id: string;
  name: string;
  safeName: string;
  tileCount: number;
  tileBytes: number[][];
}

interface MapExport {
  map: TileMap;
  safeName: string;
  atlasBytes: number[][];
  atlasTileCount: number;
  mapData: number[];
  width: number;
  height: number;
}

const formatByte = (value: number) => `0x${value.toString(16).padStart(2, "0")}`;

const formatFlatByteArray = (bytes: number[], rowSize = 16) => {
  if (bytes.length === 0) return "    0x00\n";
  const lines: string[] = [];
  for (let index = 0; index < bytes.length; index += rowSize) {
    const chunk = bytes.slice(index, index + rowSize);
    const suffix = index + rowSize >= bytes.length ? "" : ",";
    lines.push(`    ${chunk.map(formatByte).join(",")}${suffix}`);
  }
  return `${lines.join("\n")}\n`;
};

const formatMapRows = (data: number[], rowWidth: number) => {
  if (data.length === 0 || rowWidth <= 0) return "    0x00\n";
  const lines: string[] = [];
  for (let index = 0; index < data.length; index += rowWidth) {
    const chunk = data.slice(index, index + rowWidth);
    const suffix = index + rowWidth >= data.length ? "" : ",";
    lines.push(`    ${chunk.map(formatByte).join(",")}${suffix}`);
  }
  return `${lines.join("\n")}\n`;
};

const expandTileset = (ts: Tileset): ExpandedTileset => {
  const bytes: number[][] = [];
  ts.tiles.forEach(t => {
    if (t.size === 16) {
      for (let s = 0; s < 4; s++) {
        const ox = (s % 2) * 8; const oy = Math.floor(s/2) * 8;
        const sub: GBColor[][] = [];
        for (let y=0; y<8; y++) {
          const row: GBColor[] = [];
          for (let x=0; x<8; x++) row.push(t.data[oy+y]![ox+x]!);
          sub.push(row);
        }
        bytes.push(convertTileDataTo2BPP(sub, 8).map(h => parseInt(h, 16)));
      }
    } else {
      bytes.push(convertTileDataTo2BPP(t.data, 8).map(h => parseInt(h, 16)));
    }
  });
  return { id: ts.id, name: ts.name, safeName: sanitizeName(ts.name), tileCount: bytes.length, tileBytes: bytes };
};

const buildMapExport = (map: TileMap, tilesets: Tileset[]): MapExport => {
  const is16 = map.tileSize === 16;
  const usedTilesetIds = Array.from(new Set(map.data.flat().filter(c => c !== null).map(c => c!.tilesetId)));
  
  // Create an atlas of all tiles used in this map
  const atlasBytes: number[][] = [new Array(16).fill(0)]; // Tile 0 is always blank
  const tilesetOffsets = new Map<string, number>();
  let currentOffset = 1;

  usedTilesetIds.forEach(id => {
    const ts = tilesets.find(t => t.id === id);
    if (!ts) return;
    tilesetOffsets.set(id, currentOffset);
    const expanded = expandTileset(ts);
    expanded.tileBytes.forEach(b => atlasBytes.push(b));
    currentOffset += expanded.tileCount;
  });

  const hwWidth = is16 ? map.width * 2 : map.width;
  const hwHeight = is16 ? map.height * 2 : map.height;
  const hwData: number[] = new Array(hwWidth * hwHeight).fill(0);

  map.data.forEach((row, ly) => {
    row.forEach((cell, lx) => {
      if (!cell) return;
      const offset = tilesetOffsets.get(cell.tilesetId) || 0;
      if (is16) {
        const base = offset + (cell.tileIndex * 4);
        for (let s = 0; s < 4; s++) {
          const hx = lx * 2 + (s % 2);
          const hy = ly * 2 + Math.floor(s / 2);
          hwData[hy * hwWidth + hx] = base + s;
        }
      } else {
        hwData[ly * hwWidth + lx] = offset + cell.tileIndex;
      }
    });
  });

  return {
    map,
    safeName: sanitizeName(map.name),
    atlasBytes,
    atlasTileCount: atlasBytes.length,
    mapData: hwData,
    width: hwWidth,
    height: hwHeight
  };
};

const buildHeader = (projectName: string, expandedTilesets: ExpandedTileset[], mapExports: MapExport[]) => {
  const safeProjectName = sanitizeName(projectName).toUpperCase();
  let content = `// GBDK-2020 Header\n#ifndef __${safeProjectName}_H__\n#define __${safeProjectName}_H__\n#include <gb/gb.h>\n\n`;
  
  content += `typedef struct GBT_TILESET { const unsigned char *data; UINT16 tile_count; } GBT_TILESET;\n`;
  content += `typedef struct GBT_MAP { const char *name; const unsigned char *tiles; UINT16 tile_count; const unsigned char *data; UINT16 width; UINT16 height; } GBT_MAP;\n\n`;

  expandedTilesets.forEach(ts => {
    content += `extern const unsigned char ${ts.safeName}_tiles[];\n`;
    content += `extern const GBT_TILESET ${ts.safeName}_tileset;\n`;
  });

  mapExports.forEach(me => {
    content += `extern const unsigned char ${me.safeName}_tiles[];\n`;
    content += `extern const unsigned char ${me.safeName}_map[];\n`;
    content += `extern const GBT_MAP ${me.safeName};\n`;
  });

  content += "\n#endif\n";
  return content;
};

const buildSource = (projectName: string, expandedTilesets: ExpandedTileset[], mapExports: MapExport[]) => {
  let content = `#include "${projectName}.h"\n\n`;

  expandedTilesets.forEach(ts => {
    const flat = ts.tileBytes.flat();
    content += `const unsigned char ${ts.safeName}_tiles[] = {\n${formatFlatByteArray(flat)}};\n`;
    content += `const GBT_TILESET ${ts.safeName}_tileset = { ${ts.safeName}_tiles, ${ts.tileCount} };\n\n`;
  });

  mapExports.forEach(me => {
    content += `const unsigned char ${me.safeName}_tiles[] = {\n${formatFlatByteArray(me.atlasBytes.flat())}};\n`;
    content += `const unsigned char ${me.safeName}_map[] = {\n${formatMapRows(me.mapData, me.width)}};\n`;
    content += `const GBT_MAP ${me.safeName} = { "${me.map.name}", ${me.safeName}_tiles, ${me.atlasTileCount}, ${me.safeName}_map, ${me.width}, ${me.height} };\n\n`;
  });

  return content;
};

export const generateCFile = (projectName: string, tilesets: Tileset[], maps: TileMap[], _sprites: SpriteAsset[]) => {
  const expandedTs = tilesets.map(expandTileset);
  const mapExports = maps.map(m => buildMapExport(m, tilesets));
  return buildSource(projectName, expandedTs, mapExports);
};

export const generateHFile = (projectName: string, tilesets: Tileset[], maps: TileMap[], _sprites: SpriteAsset[]) => {
  const expandedTs = tilesets.map(expandTileset);
  const mapExports = maps.map(m => buildMapExport(m, tilesets));
  return buildHeader(projectName, expandedTs, mapExports);
};
