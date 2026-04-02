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
  sprites: SpriteAsset[],
): GameBoyHardwareValidation => {
  const tilesetLookup = new Map(tilesets.map((tileset) => [tileset.id, tileset]));

  // BG export currently packs one blank tile plus every tileset tile into a single atlas.
  const bgTileCount =
    1 + tilesets.reduce((count, tileset) => count + getExpandedTileCount(tileset), 0);

  // Sprite VRAM is counted from the unique hardware tiles actually referenced by animations.
  const spriteTileKeys = new Set<string>();

  sprites.forEach((sprite) => {
    sprite.animations.forEach((animation) => {
      animation.frames.forEach((frame) => {
        const tileset = tilesetLookup.get(frame.tilesetId);
        if (!tileset) {
          return;
        }

        const expandedTileCount = getExpandedTileCountForTile(tileset, frame.tileIndex);
        for (let segment = 0; segment < expandedTileCount; segment += 1) {
          spriteTileKeys.add(`${frame.tilesetId}:${frame.tileIndex}:${segment}`);
        }
      });
    });
  });

  const spriteTileCount = spriteTileKeys.size;
  const totalTileCount = bgTileCount + spriteTileCount;
  const errors: string[] = [];

  if (bgTileCount > GB_BG_TILE_LIMIT) {
    errors.push(
      `BG tiles: ${bgTileCount}/${GB_BG_TILE_LIMIT} (${bgTileCount - GB_BG_TILE_LIMIT} en trop)`,
    );
  }

  if (spriteTileCount > GB_SPRITE_TILE_LIMIT) {
    errors.push(
      `Sprite tiles: ${spriteTileCount}/${GB_SPRITE_TILE_LIMIT} (${spriteTileCount - GB_SPRITE_TILE_LIMIT} en trop)`,
    );
  }

  if (totalTileCount > GB_TOTAL_VRAM_TILE_LIMIT) {
    errors.push(
      `VRAM totale: ${totalTileCount}/${GB_TOTAL_VRAM_TILE_LIMIT} (${totalTileCount - GB_TOTAL_VRAM_TILE_LIMIT} en trop)`,
    );
  }

  return {
    bgTileCount,
    spriteTileCount,
    totalTileCount,
    bgTileLimit: GB_BG_TILE_LIMIT,
    spriteTileLimit: GB_SPRITE_TILE_LIMIT,
    totalTileLimit: GB_TOTAL_VRAM_TILE_LIMIT,
    errors,
    isValid: errors.length === 0,
  };
};
