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
