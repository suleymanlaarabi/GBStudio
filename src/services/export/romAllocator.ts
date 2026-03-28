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
    if (size > ROM_BANK_DATA_BUDGET) {
      throw new Error(`"${m.map.name}" ${label(m)}: ${size} bytes > one ROM bank (${ROM_BANK_DATA_BUDGET} bytes).`);
    }
    let bank = banks.find((b) => b.usedBytes + size <= ROM_BANK_DATA_BUDGET);
    if (!bank) { bank = { id: startId + banks.length, usedBytes: 0, assetNames: [] }; banks.push(bank); }
    bank.usedBytes += size;
    bank.assetNames.push(label(m));
    setBank(m, bank.id);
  });
  return banks;
};

export const allocateRomBanks = (mapExports: MapExport[]): RomAllocationPlan => {
  let nextId = 1;
  const allBanks: RomBank[] = [];

  // 1. Tile pixel data
  const tilesBanks = packFlat(
    mapExports,
    (m) => m.tileRomSize,
    (m, id) => { m.tilesBank = id; },
    (m) => `${m.map.name}_tiles`,
    nextId,
  );
  allBanks.push(...tilesBanks);
  nextId += tilesBanks.length;

  // 2. Chunk data — pack 64 chunks per bank, per map
  for (const m of mapExports) {
    const chunkBanks: ChunkBankData[] = [];
    for (let i = 0; i < m.allChunks.length; i += CHUNKS_PER_BANK) {
      const slice = m.allChunks.slice(i, i + CHUNKS_PER_BANK);
      const bankId = nextId++;
      const varName = `${m.safeName}_chunks_b${bankId}`;
      chunkBanks.push({ bankId, varName, bytes: slice.flat() });
      allBanks.push({ id: bankId, usedBytes: slice.length * 256, assetNames: [`${m.map.name} chunks`] });
    }
    m.chunkBanks = chunkBanks;

    // Resolve worldChunkIndices → WorldRef
    const worldRefs: WorldRef[] = m.worldChunkIndices.map((globalIdx) => {
      const bankSlot = Math.floor(globalIdx / CHUNKS_PER_BANK);
      const idxInBank = globalIdx % CHUNKS_PER_BANK;
      return {
        bankId: chunkBanks[bankSlot].bankId,
        chunkVarName: chunkBanks[bankSlot].varName,
        byteOffset: idxInBank * 256,
      };
