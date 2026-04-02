import type { Template } from "../../types/template";
import type { SoundAsset } from "../../types";

// GB frequency register: reg = 2048 - (131072 / Hz)
// Common note registers (approximate)
// C4=1548 D4=1616 E4=1664 F4=1694 G4=1714 A4=1750 B4=1775
// C5=1780 D5=1808 E5=1829 G5=1862 A5=1871 C6=1886

const SOUNDS: Omit<SoundAsset, "id">[] = [
  // ── JUMP ──────────────────────────────────────────────────────────────────
  {
    name: "Jump",
    type: "PULSE1",
    pulse1: {
      sweepTime: 2,
      sweepDirection: "UP",
      sweepShift: 2,
      duty: 2,
      length: 6,
      initialVolume: 12,
      envelopeDirection: "DOWN",
      envelopeSweep: 2,
      frequency: 1714,
    },
  },
  // ── EXPLOSION ─────────────────────────────────────────────────────────────
  {
    name: "Explosion",
    type: "NOISE",
    noise: {
      length: 20,
      initialVolume: 15,
      envelopeDirection: "DOWN",
      envelopeSweep: 1,
      shiftClockFrequency: 8,
      counterStep: 0,
      dividingRatio: 0,
    },
  },
  // ── GAME OVER ─────────────────────────────────────────────────────────────
  {
    name: "Game Over",
    type: "PULSE1",
    pulse1: {
      sweepTime: 4,
      sweepDirection: "DOWN",
      sweepShift: 3,
      duty: 2,
      length: 30,
      initialVolume: 14,
      envelopeDirection: "DOWN",
      envelopeSweep: 1,
      frequency: 1750,
    },
  },
  // ── POWER UP ──────────────────────────────────────────────────────────────
  {
    name: "Power Up",
    type: "PULSE1",
    pulse1: {
      sweepTime: 2,
      sweepDirection: "UP",
      sweepShift: 1,
      duty: 2,
      length: 16,
      initialVolume: 14,
      envelopeDirection: "DOWN",
      envelopeSweep: 1,
      frequency: 1664,
    },
  },
  // ── DOOR OPEN ─────────────────────────────────────────────────────────────
  {
    name: "Door Open",
    type: "PULSE2",
    pulse2: {
      duty: 1,
      length: 12,
      initialVolume: 10,
      envelopeDirection: "DOWN",
      envelopeSweep: 2,
      frequency: 1616,
    },
  },
  // ── SELECT / UI BEEP ──────────────────────────────────────────────────────
  {
    name: "Select",
    type: "PULSE2",
    pulse2: {
      duty: 2,
      length: 4,
      initialVolume: 8,
      envelopeDirection: "DOWN",
      envelopeSweep: 5,
      frequency: 1808,
    },
  },
  // ── CONFIRM ───────────────────────────────────────────────────────────────
  {
    name: "Confirm",
    type: "PULSE1",
    pulse1: {
      sweepTime: 0,
      sweepDirection: "UP",
      sweepShift: 0,
      duty: 2,
      length: 6,
      initialVolume: 11,
      envelopeDirection: "DOWN",
      envelopeSweep: 3,
      frequency: 1862,
    },
  },
  // ── WARP / TELEPORT ───────────────────────────────────────────────────────
  {
    name: "Warp",
    type: "WAVE",
    wave: {
      dacEnabled: true,
      length: 30,
      volumeCode: 2,
      frequency: 1750,
      waveData: [
        15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 5,
        6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
      ],
    },
