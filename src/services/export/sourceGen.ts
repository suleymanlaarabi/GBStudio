import type { SpriteAsset, SoundAsset } from "../../types";
import { formatFlatByteArray, formatMapRows } from "../../utils";
import type { ExpandedTileset, MapExport, RomAllocationPlan } from "./types";
import { ROM_BANK_DATA_BUDGET } from "./romAllocator";
import { sanitizeName } from "./utils";

const buildSoundImpl = (sound: SoundAsset): string => {
  const name = sanitizeName(sound.name);
  let content = `void play_sfx_${name}(void) {\n`;

  if (sound.type === "PULSE1" && sound.pulse1) {
    const p = sound.pulse1;
    const nr10 = (p.sweepTime << 4) | (p.sweepDirection === "DOWN" ? 8 : 0) | p.sweepShift;
    const nr11 = (p.duty << 6) | (64 - p.length);
    const nr12 = (p.initialVolume << 4) | (p.envelopeDirection === "UP" ? 8 : 0) | p.envelopeSweep;
    const nr13 = p.frequency & 0xFF;
    const nr14 = 0x80 | ((p.frequency >> 8) & 0x07);
    content += `    NR10_REG = 0x${nr10.toString(16).padStart(2, "0")};\n`;
    content += `    NR11_REG = 0x${nr11.toString(16).padStart(2, "0")};\n`;
    content += `    NR12_REG = 0x${nr12.toString(16).padStart(2, "0")};\n`;
    content += `    NR13_REG = 0x${nr13.toString(16).padStart(2, "0")};\n`;
    content += `    NR14_REG = 0x${nr14.toString(16).padStart(2, "0")};\n`;
  } else if (sound.type === "PULSE2" && sound.pulse2) {
    const p = sound.pulse2;
    const nr21 = (p.duty << 6) | (64 - p.length);
    const nr22 = (p.initialVolume << 4) | (p.envelopeDirection === "UP" ? 8 : 0) | p.envelopeSweep;
    const nr23 = p.frequency & 0xFF;
    const nr24 = 0x80 | ((p.frequency >> 8) & 0x07);
    content += `    NR21_REG = 0x${nr21.toString(16).padStart(2, "0")};\n`;
    content += `    NR22_REG = 0x${nr22.toString(16).padStart(2, "0")};\n`;
    content += `    NR23_REG = 0x${nr23.toString(16).padStart(2, "0")};\n`;
    content += `    NR24_REG = 0x${nr24.toString(16).padStart(2, "0")};\n`;
  } else if (sound.type === "NOISE" && sound.noise) {
    const n = sound.noise;
    const nr41 = 64 - n.length;
    const nr42 = (n.initialVolume << 4) | (n.envelopeDirection === "UP" ? 8 : 0) | n.envelopeSweep;
    const nr43 = (n.shiftClockFrequency << 4) | (n.counterStep << 3) | n.dividingRatio;
    const nr44 = 0x80;
    content += `    NR41_REG = 0x${nr41.toString(16).padStart(2, "0")};\n`;
    content += `    NR42_REG = 0x${nr42.toString(16).padStart(2, "0")};\n`;
    content += `    NR43_REG = 0x${nr43.toString(16).padStart(2, "0")};\n`;
    content += `    NR44_REG = 0x${nr44.toString(16).padStart(2, "0")};\n`;
  } else if (sound.type === "WAVE" && sound.wave) {
    const w = sound.wave;
    content += `    NR30_REG = 0x00; // Disable DAC to load samples\n`;
    for (let i = 0; i < 16; i++) {
      const byte = (w.waveData[i * 2] << 4) | (w.waveData[i * 2 + 1]);
      content += `    *((uint8_t*)0xFF30 + ${i}) = 0x${byte.toString(16).padStart(2, "0")};\n`;
    }
    const nr30 = w.dacEnabled ? 0x80 : 0x00;
    const nr31 = 256 - w.length;
    const nr32 = w.volumeCode << 5;
    const nr33 = w.frequency & 0xFF;
    const nr34 = 0x80 | ((w.frequency >> 8) & 0x07);
    content += `    NR30_REG = 0x${nr30.toString(16).padStart(2, "0")};\n`;
    content += `    NR31_REG = 0x${nr31.toString(16).padStart(2, "0")};\n`;
    content += `    NR32_REG = 0x${nr32.toString(16).padStart(2, "0")};\n`;
    content += `    NR33_REG = 0x${nr33.toString(16).padStart(2, "0")};\n`;
    content += `    NR34_REG = 0x${nr34.toString(16).padStart(2, "0")};\n`;
  }

  content += "}\n\n";
  return content;
};

const buildSoundApiImpl = (): string => `\
void gbt_init_sound(void) {
    NR52_REG = 0x80;
    NR50_REG = 0x77;
    NR51_REG = 0xFF;
}

void gbt_sound_stop(uint8_t channel) {
    switch (channel) {
        case GBT_CH_PULSE1: NR12_REG = 0x00; NR14_REG = 0x80; break;
        case GBT_CH_PULSE2: NR22_REG = 0x00; NR24_REG = 0x80; break;
        case GBT_CH_WAVE:   NR30_REG = 0x00;                   break;
        case GBT_CH_NOISE:  NR42_REG = 0x00; NR44_REG = 0x80; break;
    }
}

uint8_t gbt_sound_active(uint8_t channel) {
    return (NR52_REG >> (channel - 1u)) & 1u;
}

`;

const buildEngineImpl = (): string => `\
// Engine Implementation
static const unsigned char *gbt_loaded_tiles = 0;
static uint8_t gbt_loaded_bank = 0xffu;
static unsigned char gbt_clear_tile_column[32];
static unsigned char gbt_clear_tile_row[32];
static const GBT_MAP *gbt_cam_map = 0;
static uint16_t gbt_cam_x = 0;
static uint16_t gbt_cam_y = 0;
static uint16_t gbt_cam_tx = 0;
static uint16_t gbt_cam_ty = 0;
static uint8_t gbt_pending_scx = 0;
static uint8_t gbt_pending_scy = 0;
static uint8_t gbt_vbl_registered = 0;

static uint8_t gbt_enter_bank(uint8_t bank) {
    uint8_t previous = CURRENT_BANK;
    if (bank != previous) {
        SWITCH_ROM(bank);
    }
    return previous;
}

static void gbt_leave_bank(uint8_t previous) {
    if (previous != CURRENT_BANK) {
        SWITCH_ROM(previous);
    }
}

static void gbt_vblank_isr(void) {
    SCX_REG = gbt_pending_scx;
    SCY_REG = gbt_pending_scy;
}

static uint8_t gbt_min_u8(uint8_t left, uint8_t right) {
    return left < right ? left : right;
}

static void gbt_clear_bkg_map(void) {
    uint8_t row;
    for (row = 0; row != 32u; row++) {
        set_bkg_tiles(0, row, 32u, 1u, gbt_clear_tile_row);
    }
}

static void gbt_stream_column_active(uint16_t map_col, uint16_t start_row) {
    uint8_t i;
    uint8_t vram_x = (uint8_t)(map_col & 31u);
    uint8_t vram_y0 = (uint8_t)(start_row & 31u);

    for (i = 0; i != 32u; i++) {
        uint16_t map_row = start_row + i;
        if ((map_col < gbt_cam_map->width) && (map_row < gbt_cam_map->height)) {
            gbt_clear_tile_column[i] = gbt_cam_map->data[(uint32_t)map_row * gbt_cam_map->width + map_col];
        } else {
            gbt_clear_tile_column[i] = 0u;
        }
    }

    {
        uint8_t first = 32u - vram_y0;
        set_bkg_tiles(vram_x, vram_y0, 1u, first, gbt_clear_tile_column);
        if (vram_y0 > 0u) {
            set_bkg_tiles(vram_x, 0u, 1u, vram_y0, gbt_clear_tile_column + first);
        }
    }
}

static void gbt_stream_row_active(uint16_t map_row, uint16_t start_col) {
    uint8_t i;
    uint8_t vram_y = (uint8_t)(map_row & 31u);
    uint8_t vram_x0 = (uint8_t)(start_col & 31u);

    for (i = 0; i != 32u; i++) {
        uint16_t map_col = start_col + i;
        if ((map_row < gbt_cam_map->height) && (map_col < gbt_cam_map->width)) {
            gbt_clear_tile_row[i] = gbt_cam_map->data[(uint32_t)map_row * gbt_cam_map->width + map_col];
        } else {
            gbt_clear_tile_row[i] = 0u;
        }
    }

    {
        uint8_t first = 32u - vram_x0;
        set_bkg_tiles(vram_x0, vram_y, first, 1u, gbt_clear_tile_row);
        if (vram_x0 > 0u) {
            set_bkg_tiles(0u, vram_y, vram_x0, 1u, gbt_clear_tile_row + first);
        }
    }
}

static void gbt_load_map_active(const GBT_MAP *map) {
    if ((gbt_loaded_tiles != map->tiles) || (gbt_loaded_bank != map->rom_bank)) {
        set_bkg_data(0, map->tile_count, map->tiles);
        gbt_loaded_tiles = map->tiles;
        gbt_loaded_bank = map->rom_bank;
    }
}

void gbt_load_map(const GBT_MAP *map) {
    uint8_t previous = gbt_enter_bank(map->rom_bank);
    gbt_load_map_active(map);
    gbt_leave_bank(previous);
}

void gbt_draw_map(const GBT_MAP *map) {
    uint8_t previous = gbt_enter_bank(map->rom_bank);
    set_bkg_tiles(0, 0, gbt_min_u8((uint8_t)map->width, 32u), gbt_min_u8((uint8_t)map->height, 32u), map->data);
    gbt_leave_bank(previous);
}

void gbt_switch_map(const GBT_MAP *next_map, gbt_dir_t dir) {
    uint8_t i, j;
    uint8_t visible_width, visible_height;
    unsigned char buf[32];
    uint8_t previous = gbt_enter_bank(next_map->rom_bank);

    gbt_load_map_active(next_map);
    visible_width = gbt_min_u8((uint8_t)next_map->width, 20u);
    visible_height = gbt_min_u8((uint8_t)next_map->height, 18u);

    if (dir == GBT_DIR_RIGHT) {
        for (i = 0; i < visible_width; i++) {
            const unsigned char *src = next_map->data + i;
            for (j = 0; j < visible_height; j++) { buf[j] = *src; src += next_map->width; }
            wait_vbl_done();
            SCX_REG += 8u;
            {
                uint8_t tx_scroll = (uint8_t)(((SCX_REG >> 3) + 19u) & 31u);
                set_bkg_tiles(tx_scroll, 0, 1, visible_height, buf);
                set_bkg_tiles(i, 0, 1, visible_height, buf);
            }
        }
        wait_vbl_done();
        SCX_REG = 0u;
        set_bkg_submap(0, 0, 8, visible_height, next_map->data, next_map->width);
    } else if (dir == GBT_DIR_LEFT) {
        for (i = 0; i < visible_width; i++) {
            uint8_t col_idx = (uint8_t)(visible_width - 1u - i);
            const unsigned char *src = next_map->data + col_idx;
            for (j = 0; j < visible_height; j++) { buf[j] = *src; src += next_map->width; }
            wait_vbl_done();
            SCX_REG -= 8u;
            {
                uint8_t tx_scroll = (uint8_t)(SCX_REG >> 3);
                set_bkg_tiles(tx_scroll, 0, 1, visible_height, buf);
                set_bkg_tiles(col_idx, 0, 1, visible_height, buf);
            }
        }
        wait_vbl_done();
        SCX_REG = 0u;
        set_bkg_submap(visible_width - 8u, 0u, 8u, visible_height, next_map->data + (visible_width - 8u), next_map->width);
    } else if (dir == GBT_DIR_DOWN) {
        for (i = 0; i < visible_height; i++) {
            const unsigned char *src = next_map->data + ((uint16_t)i * next_map->width);
            for (j = 0; j < visible_width; j++) { buf[j] = src[j]; }
            wait_vbl_done();
            SCY_REG += 8u;
            {
                uint8_t ty_scroll = (uint8_t)(((SCY_REG >> 3) + 17u) & 31u);
                set_bkg_tiles(0, ty_scroll, visible_width, 1, buf);
                set_bkg_tiles(0, i, visible_width, 1, buf);
            }
        }
        wait_vbl_done();
        SCY_REG = 0u;
        set_bkg_submap(0, 0, visible_width, 4, next_map->data, next_map->width);
    } else if (dir == GBT_DIR_UP) {
        for (i = 0; i < visible_height; i++) {
            uint8_t row_idx = (uint8_t)(visible_height - 1u - i);
            const unsigned char *src = next_map->data + ((uint16_t)row_idx * next_map->width);
            for (j = 0; j < visible_width; j++) { buf[j] = src[j]; }
            wait_vbl_done();
            SCY_REG -= 8u;
            {
                uint8_t ty_scroll = (uint8_t)(SCY_REG >> 3);
                set_bkg_tiles(0, ty_scroll, visible_width, 1, buf);
                set_bkg_tiles(0, row_idx, visible_width, 1, buf);
            }
        }
        wait_vbl_done();
        SCY_REG = 0u;
        set_bkg_submap(0u, visible_height - 4u, visible_width, 4u, next_map->data + ((uint16_t)(visible_height - 4u) * next_map->width), next_map->width);
    }

    gbt_leave_bank(previous);
}

void gbt_init_camera(const GBT_MAP *map) {
    uint8_t previous = gbt_enter_bank(map->rom_bank);
    uint16_t x = map->spawn_x;
    uint16_t y = map->spawn_y;

    gbt_cam_map = map;
    gbt_cam_x = x;
    gbt_cam_y = y;
    gbt_cam_tx = x >> 3;
    gbt_cam_ty = y >> 3;

    gbt_load_map_active(map);
    gbt_clear_bkg_map();

    {
        uint16_t i;
        for (i = 0; i != 32u; i++) {
            gbt_stream_row_active(gbt_cam_ty + i, gbt_cam_tx);
        }
    }

    gbt_pending_scx = (uint8_t)x;
    gbt_pending_scy = (uint8_t)y;
    SCX_REG = gbt_pending_scx;
    SCY_REG = gbt_pending_scy;

    if (!gbt_vbl_registered) {
        add_VBL(gbt_vblank_isr);
        gbt_vbl_registered = 1;
    }

    gbt_leave_bank(previous);
}

static uint8_t gbt_is_solid_active(const GBT_MAP *map, uint16_t tx, uint16_t ty) {
    uint16_t idx;
    if (!map->collision) return 0u;
    if (tx >= map->width || ty >= map->height) return 1u;
    idx = (uint16_t)((uint16_t)(ty * map->width) + tx);
    return (map->collision[idx >> 3] >> (idx & 7u)) & 1u;
}

void gbt_init_camera_controller(GBT_CAMERA_CTRL *ctrl, const GBT_MAP *map) {
    ctrl->map = map;
    ctrl->x = map->spawn_x;
    ctrl->y = map->spawn_y;
    gbt_init_camera(map);
}

void gbt_update_camera_controller(GBT_CAMERA_CTRL *ctrl, int8_t dx, int8_t dy) {
    int16_t nx = (int16_t)ctrl->x + (int16_t)dx;
    int16_t ny = (int16_t)ctrl->y + (int16_t)dy;
    const GBT_MAP *map = ctrl->map;
    uint16_t map_px_w = (uint16_t)(map->width * 8u);
    uint16_t map_px_h = (uint16_t)(map->height * 8u);
    uint8_t previous = gbt_enter_bank(map->rom_bank);

    if (nx >= 0) {
        uint16_t tx = (uint16_t)nx >> 3;
        if (!gbt_is_solid_active(map, tx, ctrl->y >> 3)) {
            ctrl->x = (uint16_t)nx;
        }
    }
    if (ny >= 0) {
        uint16_t ty = (uint16_t)ny >> 3;
        if (!gbt_is_solid_active(map, ctrl->x >> 3, ty)) {
            ctrl->y = (uint16_t)ny;
        }
    }

    gbt_leave_bank(previous);

    if (ctrl->x >= map_px_w) ctrl->x = (uint16_t)(map_px_w - 1u);
    if (ctrl->y >= map_px_h) ctrl->y = (uint16_t)(map_px_h - 1u);

    {
        uint16_t cam_x = (ctrl->x >= 80u) ? (uint16_t)(ctrl->x - 80u) : 0u;
        uint16_t cam_y = (ctrl->y >= 72u) ? (uint16_t)(ctrl->y - 72u) : 0u;
        uint16_t max_cam_x = (map_px_w >= 160u) ? (uint16_t)(map_px_w - 160u) : 0u;
        uint16_t max_cam_y = (map_px_h >= 144u) ? (uint16_t)(map_px_h - 144u) : 0u;
        if (cam_x > max_cam_x) cam_x = max_cam_x;
        if (cam_y > max_cam_y) cam_y = max_cam_y;
        gbt_update_camera(cam_x, cam_y);
    }
}

void gbt_update_free_camera(GBT_CAMERA_CTRL *ctrl, int8_t dx, int8_t dy) {
    const GBT_MAP *map = ctrl->map;
    uint16_t max_x = (map->width >= 20u) ? (uint16_t)((map->width - 20u) * 8u) : 0u;
    uint16_t max_y = (map->height >= 18u) ? (uint16_t)((map->height - 18u) * 8u) : 0u;
    int16_t nx = (int16_t)ctrl->x + (int16_t)dx;
    int16_t ny = (int16_t)ctrl->y + (int16_t)dy;

    if (nx >= 0 && (uint16_t)nx <= max_x) ctrl->x = (uint16_t)nx;
    if (ny >= 0 && (uint16_t)ny <= max_y) ctrl->y = (uint16_t)ny;

    gbt_update_camera(ctrl->x, ctrl->y);
}

void gbt_update_camera(uint16_t x, uint16_t y) {
    uint16_t tx = x >> 3;
    uint16_t ty = y >> 3;
    uint8_t previous;

    if (!gbt_cam_map) {
        return;
    }

    previous = gbt_enter_bank(gbt_cam_map->rom_bank);

    if (tx > gbt_cam_tx) {
        uint16_t c;
        for (c = gbt_cam_tx + 1u; c <= tx; c++) {
            gbt_stream_column_active((uint16_t)(c + 20u), gbt_cam_ty);
        }
    } else if (tx < gbt_cam_tx) {
        uint16_t c;
        for (c = gbt_cam_tx - 1u; c >= tx; c--) {
            gbt_stream_column_active(c, gbt_cam_ty);
            if (c == 0u) break;
        }
    }

    if (ty > gbt_cam_ty) {
        uint16_t r;
        for (r = gbt_cam_ty + 1u; r <= ty; r++) {
            gbt_stream_row_active((uint16_t)(r + 18u), tx);
        }
    } else if (ty < gbt_cam_ty) {
        uint16_t r;
        for (r = gbt_cam_ty - 1u; r >= ty; r--) {
            gbt_stream_row_active(r, tx);
            if (r == 0u) break;
        }
    }

    gbt_leave_bank(previous);

    gbt_cam_x = x;
    gbt_cam_y = y;
    gbt_cam_tx = tx;
    gbt_cam_ty = ty;
    gbt_pending_scx = (uint8_t)x;
    gbt_pending_scy = (uint8_t)y;
}

void gbt_update_sprite(uint8_t id, GBT_SPRITE_STATE *state) {
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
}
`;

const buildMapDataSection = (mapExports: MapExport[], romPlan: RomAllocationPlan): string => {
  let content = "";
  const sortedByBank = [...mapExports].sort((left, right) =>
    left.romBank === right.romBank
      ? left.safeName.localeCompare(right.safeName)
      : left.romBank - right.romBank,
  );

  let currentBank = -1;
  sortedByBank.forEach((mapExport) => {
    if (mapExport.romBank !== currentBank) {
      currentBank = mapExport.romBank;
      content += `#pragma bank ${currentBank}\n`;
    }

    content += `BANKREF(${mapExport.tilesSafeName})\n`;
    content += `const unsigned char ${mapExport.tilesSafeName}[] = {\n${formatFlatByteArray(mapExport.tileBytes.flat())}};\n`;
    content += `BANKREF(${mapExport.mapSafeName})\n`;
    content += `const unsigned char ${mapExport.mapSafeName}[] = {\n${formatMapRows(mapExport.mapData, mapExport.width)}};\n`;
    if (mapExport.collisionData.length > 0) {
      content += `BANKREF(${mapExport.collisionSafeName})\n`;
      content += `const unsigned char ${mapExport.collisionSafeName}[] = {\n${formatFlatByteArray(mapExport.collisionData)}};\n`;
    }
    content += "\n";
  });

  content += "#pragma bank 0\n\n";

  mapExports.forEach((mapExport) => {
    const collisionPtr = mapExport.collisionData.length > 0 ? mapExport.collisionSafeName : "0";
    content += `const GBT_MAP ${mapExport.safeName} = {\n`;
    content += `    "${mapExport.map.name}",\n`;
    content += `    ${mapExport.romBank},\n`;
    content += `    ${mapExport.tilesSafeName}, ${mapExport.tileCount},\n`;
    content += `    ${mapExport.mapSafeName}, ${mapExport.width}, ${mapExport.height},\n`;
    content += `    ${mapExport.minX}, ${mapExport.minY},\n`;
    content += `    ${mapExport.spawnX}, ${mapExport.spawnY},\n`;
    content += `    ${collisionPtr}\n`;
    content += `};\n\n`;
  });

  // ROM packing summary (comment only, no functional impact)
  let summary = `// Tileset inventory kept for editor/debug visibility only.\n`;
  summary += `// ROM packing summary: ${romPlan.banks.length} bank(s), ${romPlan.totalBytes} bytes of map data.\n`;
  romPlan.banks.forEach((bank) => {
    summary += `// Bank ${bank.id}: ${bank.usedBytes}/${ROM_BANK_DATA_BUDGET} bytes -> ${bank.assetNames.join(", ")}\n`;
  });

  return summary + "\n" + content;
};

const buildSpriteSection = (sprites: SpriteAsset[]): string => {
  let content = "// Sprites & Animations Data\n";
  sprites.forEach((sprite) => {
    const safeSpriteName = sanitizeName(sprite.name);
    sprite.animations.forEach((anim) => {
      const safeAnimName = sanitizeName(anim.name);
      const framesVar = `${safeSpriteName}_${safeAnimName}_frames`;
      content += `const GBT_FRAME ${framesVar}[] = {\n`;
      anim.frames.forEach((frame) => {
        content += `    { ${frame.tileIndex}, ${frame.duration} },\n`;
      });
      content += "};\n";
      content += `const GBT_ANIMATION ${safeSpriteName}_${safeAnimName} = { ${framesVar}, ${anim.frames.length}, ${anim.loop ? 1 : 0} };\n\n`;
    });
  });
  return content;
};

export const buildSource = (
  projectName: string,
  expandedTilesets: ExpandedTileset[],
  mapExports: MapExport[],
  sprites: SpriteAsset[],
  romPlan: RomAllocationPlan,
  sounds: SoundAsset[],
): string => {
  let content = `#include "${projectName}.h"\n\n`;

  content += `#ifndef BANKREF\n#define BANKREF(name)\n#endif\n`;
  content += `#ifndef BANKED\n#define BANKED\n#endif\n`;
  content += `#ifndef NONBANKED\n#define NONBANKED\n#endif\n`;
  content += `#ifndef SWITCH_ROM\n#define SWITCH_ROM(bank) ((void)(bank))\n#endif\n`;
  content += `#ifndef CURRENT_BANK\n#define CURRENT_BANK 0\n#endif\n\n`;

  content += "// Sound API Implementation\n";
  content += buildSoundApiImpl();
  sounds.forEach((sound) => { content += buildSoundImpl(sound); });

  content += buildEngineImpl();
  content += "\n";

  // Tileset debug info
  expandedTilesets.forEach((tileset) => {
    content += `// ${tileset.name}: ${tileset.tileCount} hardware tiles\n`;
  });

  content += buildMapDataSection(mapExports, romPlan);
  content += buildSpriteSection(sprites);

  return content;
};
