import type { MapExport, ChunkBankData, WorldRef, RomBank, RomAllocationPlan } from "./types";

export const ROM_BANK_SIZE = 16 * 1024;
export const ROM_BANK_DATA_BUDGET = ROM_BANK_SIZE;
const CHUNKS_PER_BANK = 64; // 64 × 256 = 16 384 bytes = exactly one ROM bank

const packFlat = (
  items: MapExport[],
  getSize: (m: MapExport) => number,
  setBank: (m: MapExport, id: number) => void,
  label: (m: MapExport) => string,
  startId: number,
): RomBank[] => {
  const banks: RomBank[] = [];
  [...items].sort((a, b) => getSize(b) - getSize(a)).forEach((m) => {
    const size = getSize(m);
    if (size === 0) return;
