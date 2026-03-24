import type { ProjectDocument, SpriteAsset, Tileset } from "../types";

export const GB_BG_TILE_LIMIT = 256;
export const GB_SPRITE_TILE_LIMIT = 128;
export const GB_TOTAL_VRAM_TILE_LIMIT = GB_BG_TILE_LIMIT + GB_SPRITE_TILE_LIMIT;

export interface GameBoyHardwareValidation {
  bgTileCount: number;
  spriteTileCount: number;
  totalTileCount: number;
  bgTileLimit: number;
  spriteTileLimit: number;
  totalTileLimit: number;
  errors: string[];
  isValid: boolean;
}

const getExpandedTileCount = (tileset: Tileset): number =>
  tileset.tiles.reduce((count, tile) => count + (tile.size === 16 ? 4 : 1), 0);

const getExpandedTileCountForTile = (tileset: Tileset, tileIndex: number): number => {
  const tile = tileset.tiles[tileIndex];
  if (!tile) {
    return 0;
  }

  return tile.size === 16 ? 4 : 1;
};

export const validateGameBoyHardwareLimits = (
  tilesets: Tileset[],
