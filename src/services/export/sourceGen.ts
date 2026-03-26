import type { SpriteAsset, SoundAsset } from "../../types";
import { formatFlatByteArray } from "../../utils";
import type { ExpandedTileset, MapExport, RomAllocationPlan } from "./types";
import { ROM_BANK_DATA_BUDGET } from "./romAllocator";
import { sanitizeName } from "./utils";

// ── Sound ──────────────────────────────────────────────────────────────────

const buildSoundImpl = (sound: SoundAsset): string => {
  const name = sanitizeName(sound.name);
  let c = `void play_sfx_${name}(void) {\n`;

  if (sound.type === "PULSE1" && sound.pulse1) {
    const p = sound.pulse1;
    const nr10 = (p.sweepTime << 4) | (p.sweepDirection === "DOWN" ? 8 : 0) | p.sweepShift;
    const nr11 = (p.duty << 6) | (64 - p.length);
    const nr12 = (p.initialVolume << 4) | (p.envelopeDirection === "UP" ? 8 : 0) | p.envelopeSweep;
    const nr13 = p.frequency & 0xFF;
    const nr14 = 0x80 | ((p.frequency >> 8) & 0x07);
    c += `    NR10_REG = 0x${nr10.toString(16).padStart(2, "0")};\n`;
    c += `    NR11_REG = 0x${nr11.toString(16).padStart(2, "0")};\n`;
    c += `    NR12_REG = 0x${nr12.toString(16).padStart(2, "0")};\n`;
    c += `    NR13_REG = 0x${nr13.toString(16).padStart(2, "0")};\n`;
    c += `    NR14_REG = 0x${nr14.toString(16).padStart(2, "0")};\n`;
  } else if (sound.type === "PULSE2" && sound.pulse2) {
    const p = sound.pulse2;
    const nr21 = (p.duty << 6) | (64 - p.length);
    const nr22 = (p.initialVolume << 4) | (p.envelopeDirection === "UP" ? 8 : 0) | p.envelopeSweep;
    const nr23 = p.frequency & 0xFF;
    const nr24 = 0x80 | ((p.frequency >> 8) & 0x07);
    c += `    NR21_REG = 0x${nr21.toString(16).padStart(2, "0")};\n`;
    c += `    NR22_REG = 0x${nr22.toString(16).padStart(2, "0")};\n`;
    c += `    NR23_REG = 0x${nr23.toString(16).padStart(2, "0")};\n`;
    c += `    NR24_REG = 0x${nr24.toString(16).padStart(2, "0")};\n`;
  } else if (sound.type === "NOISE" && sound.noise) {
    const n = sound.noise;
    const nr41 = 64 - n.length;
    const nr42 = (n.initialVolume << 4) | (n.envelopeDirection === "UP" ? 8 : 0) | n.envelopeSweep;
    const nr43 = (n.shiftClockFrequency << 4) | (n.counterStep << 3) | n.dividingRatio;
    const nr44 = 0x80;
    c += `    NR41_REG = 0x${nr41.toString(16).padStart(2, "0")};\n`;
    c += `    NR42_REG = 0x${nr42.toString(16).padStart(2, "0")};\n`;
    c += `    NR43_REG = 0x${nr43.toString(16).padStart(2, "0")};\n`;
    c += `    NR44_REG = 0x${nr44.toString(16).padStart(2, "0")};\n`;
  } else if (sound.type === "WAVE" && sound.wave) {
    const w = sound.wave;
    c += `    NR30_REG = 0x00;\n`;
    for (let i = 0; i < 16; i++) {
      const byte = (w.waveData[i * 2] << 4) | (w.waveData[i * 2 + 1]);
      c += `    _AUD3WAVERAM[${i}] = 0x${byte.toString(16).padStart(2, "0")};\n`;
    }
    const nr30 = w.dacEnabled ? 0x80 : 0x00;
    const nr31 = 256 - w.length;
    const nr32 = w.volumeCode << 5;
    const nr33 = w.frequency & 0xFF;
    const nr34 = 0x80 | ((w.frequency >> 8) & 0x07);
    c += `    NR30_REG = 0x${nr30.toString(16).padStart(2, "0")};\n`;
    c += `    NR31_REG = 0x${nr31.toString(16).padStart(2, "0")};\n`;
    c += `    NR32_REG = 0x${nr32.toString(16).padStart(2, "0")};\n`;
    c += `    NR33_REG = 0x${nr33.toString(16).padStart(2, "0")};\n`;
    c += `    NR34_REG = 0x${nr34.toString(16).padStart(2, "0")};\n`;
  }

  c += "}\n\n";
  return c;
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

// ── Engine ─────────────────────────────────────────────────────────────────

const buildEngineImpl = (): string => `\
// Engine — chunk-based streaming, 256-byte WRAM chunk cache
static const unsigned char *gbt_loaded_tiles = 0;
static uint8_t gbt_loaded_tiles_bank = 0xffu;
static unsigned char gbt_tile_buf[32];
static unsigned char gbt_chunk_cache[256];
static uint8_t gbt_cached_chunk_bank = 0xffu;
static const unsigned char *gbt_cached_chunk_ptr = 0;
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
    if (bank != previous) SWITCH_ROM(bank);
    return previous;
}

static void gbt_leave_bank(uint8_t previous) {
    if (previous != CURRENT_BANK) SWITCH_ROM(previous);
}

static void gbt_vblank_isr(void) {
    SCX_REG = gbt_pending_scx;
    SCY_REG = gbt_pending_scy;
}

static uint8_t gbt_min_u8(uint8_t a, uint8_t b) {
    return a < b ? a : b;
}

// Load 256-byte chunk into WRAM cache if not already cached.
// Must be called with map->world_bank active.
static uint8_t gbt_get_tile_from(const GBT_MAP *map, uint16_t tx, uint16_t ty) {
    const GBT_CHUNK_REF *ref;
    uint8_t cx = (uint8_t)(tx >> 4);
    uint8_t cy = (uint8_t)(ty >> 4);
    if (cx >= map->world_w || cy >= map->world_h) return 0u;
    ref = &map->world[(uint16_t)cy * map->world_w + cx];
    if (ref->data != gbt_cached_chunk_ptr || ref->bank != gbt_cached_chunk_bank) {
        const unsigned char *src;
        uint8_t i;
        uint8_t prev = gbt_enter_bank(ref->bank);
        src = ref->data;
        i = 0u;
        do { gbt_chunk_cache[i] = src[i]; i++; } while (i != 0u);
        gbt_leave_bank(prev);
        gbt_cached_chunk_bank = ref->bank;
        gbt_cached_chunk_ptr = ref->data;
    }
    return gbt_chunk_cache[((uint8_t)(ty & 15u) << 4) | (uint8_t)(tx & 15u)];
}

static void gbt_clear_bkg_map(void) {
    uint8_t i = 0u, row = 0u;
    do { gbt_tile_buf[i] = 0u; i++; } while (i != 32u);
    do { set_bkg_tiles(0, row, 32u, 1u, gbt_tile_buf); row++; } while (row != 32u);
}

static void gbt_stream_column_active(uint16_t map_col, uint16_t start_row) {
    uint8_t i = 0u;
    uint8_t vram_x = (uint8_t)(map_col & 31u);
    uint8_t vram_y0 = (uint8_t)(start_row & 31u);
    uint8_t first;
    uint8_t prev = gbt_enter_bank(gbt_cam_map->world_bank);
    do { gbt_tile_buf[i] = gbt_get_tile_from(gbt_cam_map, map_col, start_row + i); i++; } while (i != 32u);
    gbt_leave_bank(prev);
    first = 32u - vram_y0;
    set_bkg_tiles(vram_x, vram_y0, 1u, first, gbt_tile_buf);
    if (vram_y0 > 0u) set_bkg_tiles(vram_x, 0u, 1u, vram_y0, gbt_tile_buf + first);
}

static void gbt_stream_row_active(uint16_t map_row, uint16_t start_col) {
    uint8_t i = 0u;
    uint8_t vram_y = (uint8_t)(map_row & 31u);
    uint8_t vram_x0 = (uint8_t)(start_col & 31u);
    uint8_t first;
    uint8_t prev = gbt_enter_bank(gbt_cam_map->world_bank);
    do { gbt_tile_buf[i] = gbt_get_tile_from(gbt_cam_map, start_col + i, map_row); i++; } while (i != 32u);
    gbt_leave_bank(prev);
    first = 32u - vram_x0;
    set_bkg_tiles(vram_x0, vram_y, first, 1u, gbt_tile_buf);
    if (vram_x0 > 0u) set_bkg_tiles(0u, vram_y, vram_x0, 1u, gbt_tile_buf + first);
}

static void gbt_load_map_active(const GBT_MAP *map) {
    if (gbt_loaded_tiles != map->tiles || gbt_loaded_tiles_bank != map->tiles_bank) {
        uint8_t prev = gbt_enter_bank(map->tiles_bank);
        set_bkg_data(0, map->tile_count, map->tiles);
