import type { TileMap, Tileset, SpriteAsset, SoundAsset } from "../../types";
import { expandTileset } from "./tiles";
import { allocateRomBanks } from "./romAllocator";
import { buildMapExport } from "./mapBuilder";
import { buildHeader } from "./headerGen";
import { buildSource } from "./sourceGen";

export const generateCFile = (
  projectName: string,
  tilesets: Tileset[],
  maps: TileMap[],
  sprites: SpriteAsset[],
  sounds: SoundAsset[] = [],
): string => {
  const expandedTilesets = tilesets.map(expandTileset);
  const mapExports = maps.map((map) => buildMapExport(map, tilesets));
  const romPlan = allocateRomBanks(mapExports);
  return buildSource(projectName, expandedTilesets, mapExports, sprites, romPlan, sounds);
};

export const generateHFile = (
  projectName: string,
  tilesets: Tileset[],
  maps: TileMap[],
  sprites: SpriteAsset[],
  sounds: SoundAsset[] = [],
): string => {
  const mapExports = maps.map((map) => buildMapExport(map, tilesets));
  const romPlan = allocateRomBanks(mapExports);
  return buildHeader(projectName, mapExports, sprites, romPlan, sounds);
};
