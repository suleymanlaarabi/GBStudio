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
  mapData: number[];
  width: number;
  height: number;
}

interface ProjectAtlas {
  safeName: string;
  tileCount: number;
  tileBytes: number[][];
  tilesetOffsets: Map<string, number>;
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

const buildProjectAtlas = (projectName: string, tilesets: Tileset[]): ProjectAtlas => {
  const tileBytes: number[][] = [new Array(16).fill(0)];
  const tilesetOffsets = new Map<string, number>();
  let currentOffset = 1;

  tilesets.forEach((tileset) => {
    const expanded = expandTileset(tileset);
    tilesetOffsets.set(tileset.id, currentOffset);
    expanded.tileBytes.forEach((bytes) => tileBytes.push(bytes));
    currentOffset += expanded.tileCount;
  });

  return {
    safeName: `${sanitizeName(projectName)}_project`,
    tileCount: tileBytes.length,
    tileBytes,
    tilesetOffsets,
  };
};

const buildMapExport = (map: TileMap, atlas: ProjectAtlas): MapExport => {
  const is16 = map.tileSize === 16;

  const hardwareWidth = is16 ? map.width * 2 : map.width;
  const hardwareHeight = is16 ? map.height * 2 : map.height;
  const hardwareData: number[] = new Array(hardwareWidth * hardwareHeight).fill(0);

  map.data.forEach((row, logicalY) => {
    row.forEach((cell, logicalX) => {
      if (!cell) return;

      const offset = atlas.tilesetOffsets.get(cell.tilesetId) || 0;
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
    mapData: hardwareData,
    width: hardwareWidth,
    height: hardwareHeight,
  };
};

const buildHeader = (
  projectName: string,
  atlas: ProjectAtlas,
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

  content += `extern const unsigned char ${atlas.safeName}_tiles[];\n`;
  content += `extern const GBT_TILESET ${atlas.safeName}_tileset;\n\n`;

  expandedTilesets.forEach((tileset) => {
    content += `extern const unsigned char ${tileset.safeName}_tiles[];\n`;
    content += `extern const GBT_TILESET ${tileset.safeName}_tileset;\n`;
  });

  mapExports.forEach((mapExport) => {
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
  atlas: ProjectAtlas,
  expandedTilesets: ExpandedTileset[],
  mapExports: MapExport[],
  sprites: SpriteAsset[],
) => {
  let content = `#include "${projectName}.h"\n\n`;

  content += `// Engine Implementation
static const unsigned char *gbt_loaded_tiles = 0;

static UINT8 gbt_min_u8(UINT8 left, UINT8 right) {
    return left < right ? left : right;
}

static void gbt_set_bkg_submap_wrap_x(UINT8 x, UINT8 y, UINT8 width, UINT8 height, const unsigned char *data, UINT8 map_width) {
    UINT8 remaining_width = width;
    UINT8 src_offset = 0;

    while (remaining_width != 0) {
        UINT8 chunk_width = gbt_min_u8(remaining_width, (UINT8)(32u - x));
        set_bkg_submap(x, y, chunk_width, height, data + src_offset, map_width);
        remaining_width -= chunk_width;
        src_offset += chunk_width;
        x = 0;
    }
}

static void gbt_set_bkg_submap_wrap(UINT8 x, UINT8 y, UINT8 width, UINT8 height, const unsigned char *data, UINT8 map_width) {
    UINT8 remaining_height = height;
    UINT8 src_row = 0;

    while (remaining_height != 0) {
        UINT8 chunk_height = gbt_min_u8(remaining_height, (UINT8)(32u - y));
        gbt_set_bkg_submap_wrap_x(x, y, width, chunk_height, data + ((UINT16)src_row * map_width), map_width);
        remaining_height -= chunk_height;
        src_row += chunk_height;
        y = 0;
    }
}

void gbt_load_map(const GBT_MAP *map) {
    if (gbt_loaded_tiles != map->tiles) {
        set_bkg_data(0, map->tile_count, map->tiles);
        gbt_loaded_tiles = map->tiles;
    }
}

void gbt_draw_map(const GBT_MAP *map) {
    set_bkg_tiles(0, 0, map->width, map->height, map->data);
}

void gbt_switch_map(const GBT_MAP *next_map, gbt_dir_t dir) {
    UINT8 i;
    UINT8 visible_width;
    UINT8 visible_height;
    gbt_load_map(next_map);

    visible_width = gbt_min_u8((UINT8)next_map->width, 20u);
    visible_height = gbt_min_u8((UINT8)next_map->height, 18u);

    if (dir == GBT_DIR_RIGHT) {
        for (i = 0; i < visible_width; i++) {
            wait_vbl_done();
            gbt_set_bkg_submap_wrap((UINT8)((((SCX_REG + 8u) >> 3) + 19u) & 31u), 0u, 1u, visible_height, next_map->data + i, (UINT8)next_map->width);
            SCX_REG += 8u;
        }
    } else if (dir == GBT_DIR_LEFT) {
        for (i = 0; i < visible_width; i++) {
            UINT8 next_scx;
            wait_vbl_done();
            next_scx = (UINT8)(SCX_REG - 8u);
            gbt_set_bkg_submap_wrap((UINT8)((next_scx >> 3) & 31u), 0u, 1u, visible_height, next_map->data + (UINT8)(visible_width - 1u - i), (UINT8)next_map->width);
            SCX_REG = next_scx;
        }
    } else if (dir == GBT_DIR_DOWN) {
        for (i = 0; i < visible_height; i++) {
            wait_vbl_done();
            gbt_set_bkg_submap_wrap(0u, (UINT8)((((SCY_REG + 8u) >> 3) + 17u) & 31u), visible_width, 1u, next_map->data + ((UINT16)i * next_map->width), (UINT8)next_map->width);
            SCY_REG += 8u;
        }
    } else if (dir == GBT_DIR_UP) {
        for (i = 0; i < visible_height; i++) {
            UINT8 next_scy;
            wait_vbl_done();
            next_scy = (UINT8)(SCY_REG - 8u);
            gbt_set_bkg_submap_wrap(0u, (UINT8)((next_scy >> 3) & 31u), visible_width, 1u, next_map->data + ((UINT16)(visible_height - 1u - i) * next_map->width), (UINT8)next_map->width);
            SCY_REG = next_scy;
        }
    }

    wait_vbl_done();
    SCX_REG = 0u;
    SCY_REG = 0u;
    gbt_draw_map(next_map);
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

  content += `const unsigned char ${atlas.safeName}_tiles[] = {\n${formatFlatByteArray(atlas.tileBytes.flat())}};\n`;
  content += `const GBT_TILESET ${atlas.safeName}_tileset = { ${atlas.safeName}_tiles, ${atlas.tileCount} };\n\n`;

  expandedTilesets.forEach((tileset) => {
    content += `const unsigned char ${tileset.safeName}_tiles[] = {\n${formatFlatByteArray(tileset.tileBytes.flat())}};\n`;
    content += `const GBT_TILESET ${tileset.safeName}_tileset = { ${tileset.safeName}_tiles, ${tileset.tileCount} };\n\n`;
  });

  mapExports.forEach((mapExport) => {
    content += `const unsigned char ${mapExport.safeName}_map[] = {\n${formatMapRows(mapExport.mapData, mapExport.width)}};\n`;
    content += `const GBT_MAP ${mapExport.safeName} = { "${mapExport.map.name}", ${atlas.safeName}_tiles, ${atlas.tileCount}, ${mapExport.safeName}_map, ${mapExport.width}, ${mapExport.height} };\n\n`;
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
) => {
  const atlas = buildProjectAtlas(projectName, tilesets);
  return buildSource(
    projectName,
    atlas,
    tilesets.map(expandTileset),
    maps.map((map) => buildMapExport(map, atlas)),
    sprites,
  );
};

export const generateHFile = (
  projectName: string,
  tilesets: Tileset[],
  maps: TileMap[],
  sprites: SpriteAsset[],
) => {
  const atlas = buildProjectAtlas(projectName, tilesets);
  return buildHeader(
    projectName,
    atlas,
    tilesets.map(expandTileset),
    maps.map((map) => buildMapExport(map, atlas)),
    sprites,
  );
};
