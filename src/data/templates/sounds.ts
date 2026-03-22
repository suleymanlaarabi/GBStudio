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
