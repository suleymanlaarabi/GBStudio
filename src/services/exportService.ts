import type { GBColor, SpriteAsset, TileMap, Tileset } from "../types";
import { formatFlatByteArray, formatMapRows } from "../utils";

export const convertTileDataTo2BPP = (
  data: GBColor[][],
  size: number,
): string[] => {
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

  return bytes.map((byte) => `0x${byte.toString(16).padStart(2, "0")}`);
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

const expandTileset = (tileset: Tileset): ExpandedTileset => {
  const tileBytes: number[][] = [];

  tileset.tiles.forEach((tile) => {
    if (tile.size === 16) {
      for (let segment = 0; segment < 4; segment++) {
        const offsetX = (segment % 2) * 8;
        const offsetY = Math.floor(segment / 2) * 8;
        const subTile: GBColor[][] = [];

        for (let y = 0; y < 8; y++) {
          const row: GBColor[] = [];
          for (let x = 0; x < 8; x++) {
            row.push(tile.data[offsetY + y]![offsetX + x]!);
          }
          subTile.push(row);
        }

        tileBytes.push(convertTileDataTo2BPP(subTile, 8).map((value) => parseInt(value, 16)));
      }
      return;
    }

    tileBytes.push(convertTileDataTo2BPP(tile.data, 8).map((value) => parseInt(value, 16)));
  });

  return {
    id: tileset.id,
    name: tileset.name,
    safeName: sanitizeName(tileset.name),
    tileCount: tileBytes.length,
    tileBytes,
  };
};

const buildMapExport = (map: TileMap, tilesets: Tileset[]): MapExport => {
  const is16 = map.tileSize === 16;
  const usedTilesetIds = Array.from(
    new Set(
      map.data
        .flat()
        .filter((cell): cell is NonNullable<(typeof map.data)[number][number]> => cell !== null)
        .map((cell) => cell.tilesetId),
    ),
  );

  const atlasBytes: number[][] = [new Array(16).fill(0)];
  const tilesetOffsets = new Map<string, number>();
  let currentOffset = 1;

  usedTilesetIds.forEach((tilesetId) => {
    const tileset = tilesets.find((item) => item.id === tilesetId);
    if (!tileset) return;

    tilesetOffsets.set(tilesetId, currentOffset);
    const expanded = expandTileset(tileset);
    expanded.tileBytes.forEach((bytes) => atlasBytes.push(bytes));
    currentOffset += expanded.tileCount;
  });

  const hardwareWidth = is16 ? map.width * 2 : map.width;
  const hardwareHeight = is16 ? map.height * 2 : map.height;
  const hardwareData: number[] = new Array(hardwareWidth * hardwareHeight).fill(0);

  map.data.forEach((row, logicalY) => {
    row.forEach((cell, logicalX) => {
      if (!cell) return;

      const offset = tilesetOffsets.get(cell.tilesetId) || 0;
      if (is16) {
        const base = offset + cell.tileIndex * 4;
        for (let segment = 0; segment < 4; segment++) {
          const hardwareX = logicalX * 2 + (segment % 2);
          const hardwareY = logicalY * 2 + Math.floor(segment / 2);
          hardwareData[hardwareY * hardwareWidth + hardwareX] = base + segment;
        }
        return;
      }

      hardwareData[logicalY * hardwareWidth + logicalX] = offset + cell.tileIndex;
    });
  });

  return {
    map,
    safeName: sanitizeName(map.name),
    atlasBytes,
    atlasTileCount: atlasBytes.length,
    mapData: hardwareData,
    width: hardwareWidth,
    height: hardwareHeight,
  };
};

const buildHeader = (
  projectName: string,
  expandedTilesets: ExpandedTileset[],
  mapExports: MapExport[],
  sprites: SpriteAsset[],
) => {
  const safeProjectName = sanitizeName(projectName).toUpperCase();
  let content = `// GBDK-2020 Header\n#ifndef __${safeProjectName}_H__\n#define __${safeProjectName}_H__\n#include <gb/gb.h>\n\n`;

  content += "typedef enum { GBT_DIR_UP, GBT_DIR_DOWN, GBT_DIR_LEFT, GBT_DIR_RIGHT } gbt_dir_t;\n\n";
  content += "typedef struct GBT_TILESET { const unsigned char *data; UINT16 tile_count; } GBT_TILESET;\n";
  content += "typedef struct GBT_MAP { const char *name; const unsigned char *tiles; UINT16 tile_count; const unsigned char *data; UINT16 width; UINT16 height; } GBT_MAP;\n\n";

  content += "// Sprite Animation\ntypedef struct GBT_FRAME { UINT8 tile; UINT8 duration; } GBT_FRAME;\n";
  content += "typedef struct GBT_ANIMATION { const GBT_FRAME *frames; UINT8 frame_count; UINT8 loop; } GBT_ANIMATION;\n";
  content += "typedef struct GBT_SPRITE_STATE { UINT8 x; UINT8 y; const GBT_ANIMATION *current_anim; UINT8 current_frame; UINT8 tick_counter; } GBT_SPRITE_STATE;\n\n";

  content += "// Engine API\n";
  content += "void gbt_load_map(const GBT_MAP *map);\n";
  content += "void gbt_draw_map(const GBT_MAP *map);\n";
  content += "void gbt_switch_map(const GBT_MAP *next_map, gbt_dir_t dir);\n";
  content += "void gbt_update_sprite(UINT8 hardware_sprite_id, GBT_SPRITE_STATE *state);\n\n";

  expandedTilesets.forEach((tileset) => {
    content += `extern const unsigned char ${tileset.safeName}_tiles[];\n`;
    content += `extern const GBT_TILESET ${tileset.safeName}_tileset;\n`;
  });

  mapExports.forEach((mapExport) => {
    content += `extern const unsigned char ${mapExport.safeName}_tiles[];\n`;
    content += `extern const unsigned char ${mapExport.safeName}_map[];\n`;
    content += `extern const GBT_MAP ${mapExport.safeName};\n`;
  });

  content += "\n// Sprites & Animations\n";
  sprites.forEach((sprite) => {
    const safeSpriteName = sanitizeName(sprite.name);
    sprite.animations.forEach((anim) => {
      const safeAnimName = sanitizeName(anim.name);
      content += `extern const GBT_ANIMATION ${safeSpriteName}_${safeAnimName};\n`;
    });
  });

  content += "\n#endif\n";
  return content;
};

const buildSource = (
  projectName: string,
  expandedTilesets: ExpandedTileset[],
  mapExports: MapExport[],
  sprites: SpriteAsset[],
) => {
  let content = `#include "${projectName}.h"\n\n`;

  content += `// Engine Implementation
void gbt_load_map(const GBT_MAP *map) {
    set_bkg_data(0, map->tile_count, map->tiles);
}

void gbt_draw_map(const GBT_MAP *map) {
    set_bkg_tiles(0, 0, map->width, map->height, map->data);
}

void gbt_switch_map(const GBT_MAP *next_map, gbt_dir_t dir) {
    UINT8 i, x, y;
    gbt_load_map(next_map);
    
    if (dir == GBT_DIR_RIGHT) {
        for (i = 0; i < 20; i++) {
            SCX_REG += 8;
            set_bkg_submap((SCX_REG + 152) / 8, 0, 1, 18, next_map->data, next_map->width);
            wait_vbl_done();
        }
    } else if (dir == GBT_DIR_LEFT) {
        for (i = 0; i < 20; i++) {
            SCX_REG -= 8;
            set_bkg_submap(SCX_REG / 8, 0, 1, 18, next_map->data, next_map->width);
            wait_vbl_done();
        }
    } else if (dir == GBT_DIR_DOWN) {
        for (i = 0; i < 18; i++) {
            SCY_REG += 8;
            set_bkg_submap(0, (SCY_REG + 136) / 8, 20, 1, next_map->data, next_map->width);
            wait_vbl_done();
        }
    } else if (dir == GBT_DIR_UP) {
        for (i = 0; i < 18; i++) {
            SCY_REG -= 8;
            set_bkg_submap(0, SCY_REG / 8, 20, 1, next_map->data, next_map->width);
            wait_vbl_done();
        }
    }
}

void gbt_update_sprite(UINT8 id, GBT_SPRITE_STATE *state) {
    if (state->tick_counter == 0) {
        state->current_frame++;
        if (state->current_frame >= state->current_anim->frame_count) {
            state->current_frame = state->current_anim->loop ? 0 : state->current_anim->frame_count - 1;
        }
        state->tick_counter = state->current_anim->frames[state->current_frame].duration;
        set_sprite_tile(id, state->current_anim->frames[state->current_frame].tile);
    }
    state->tick_counter--;
    move_sprite(id, state->x, state->y);
}\n\n`;

  expandedTilesets.forEach((tileset) => {
    content += `const unsigned char ${tileset.safeName}_tiles[] = {\n${formatFlatByteArray(tileset.tileBytes.flat())}};\n`;
    content += `const GBT_TILESET ${tileset.safeName}_tileset = { ${tileset.safeName}_tiles, ${tileset.tileCount} };\n\n`;
  });

  mapExports.forEach((mapExport) => {
    content += `const unsigned char ${mapExport.safeName}_tiles[] = {\n${formatFlatByteArray(mapExport.atlasBytes.flat())}};\n`;
    content += `const unsigned char ${mapExport.safeName}_map[] = {\n${formatMapRows(mapExport.mapData, mapExport.width)}};\n`;
    content += `const GBT_MAP ${mapExport.safeName} = { "${mapExport.map.name}", ${mapExport.safeName}_tiles, ${mapExport.atlasTileCount}, ${mapExport.safeName}_map, ${mapExport.width}, ${mapExport.height} };\n\n`;
  });

  content += "// Sprites & Animations Data\n";
  sprites.forEach((sprite) => {
    const safeSpriteName = sanitizeName(sprite.name);
    sprite.animations.forEach((anim) => {
      const safeAnimName = sanitizeName(anim.name);
      const framesVar = `${safeSpriteName}_${safeAnimName}_frames`;
      content += `const GBT_FRAME ${framesVar}[] = {\n`;
      anim.frames.forEach((f) => {
        content += `    { ${f.tileIndex}, ${f.duration} },\n`;
      });
      content += "};\n";
      content += `const GBT_ANIMATION ${safeSpriteName}_${safeAnimName} = { ${framesVar}, ${anim.frames.length}, ${anim.loop ? 1 : 0} };\n\n`;
    });
  });

  return content;
};

export const generateCFile = (
  projectName: string,
  tilesets: Tileset[],
  maps: TileMap[],
  sprites: SpriteAsset[],
) =>
  buildSource(
    projectName,
    tilesets.map(expandTileset),
    maps.map((map) => buildMapExport(map, tilesets)),
    sprites,
  );

export const generateHFile = (
  projectName: string,
  tilesets: Tileset[],
  maps: TileMap[],
  sprites: SpriteAsset[],
) =>
  buildHeader(
    projectName,
    tilesets.map(expandTileset),
    maps.map((map) => buildMapExport(map, tilesets)),
    sprites,
  );
