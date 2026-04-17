import type { MapExport, RomBank, RomAllocationPlan } from "./types";

export const ROM_BANK_SIZE = 16 * 1024;
export const ROM_BANK_DATA_BUDGET = ROM_BANK_SIZE;

export const allocateRomBanks = (mapExports: MapExport[]): RomAllocationPlan => {
  const sortedMaps = [...mapExports].sort((left, right) => right.romSize - left.romSize);
  const banks: RomBank[] = [];

  sortedMaps.forEach((mapExport) => {
    if (mapExport.romSize > ROM_BANK_DATA_BUDGET) {
      throw new Error(
        `Map "${mapExport.map.name}" needs ${mapExport.romSize} bytes and cannot fit in one ROM bank (${ROM_BANK_DATA_BUDGET} bytes).`,
      );
    }

    let targetBank = banks.find(
      (bank) => bank.usedBytes + mapExport.romSize <= ROM_BANK_DATA_BUDGET,
    );

    if (!targetBank) {
      targetBank = { id: banks.length + 1, usedBytes: 0, assetNames: [] };
      banks.push(targetBank);
    }

    targetBank.usedBytes += mapExport.romSize;
    targetBank.assetNames.push(mapExport.map.name);
    mapExport.romBank = targetBank.id;
  });

  return {
    banks,
    totalBytes: mapExports.reduce((total, mapExport) => total + mapExport.romSize, 0),
  };
};
