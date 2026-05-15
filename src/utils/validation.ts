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

/**
 * Validates a parsed project document structure
 * Checks for required fields, correct types, and data integrity
 */
export const isValidProjectDocument = (obj: unknown): obj is ProjectDocument => {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const doc = obj as Partial<ProjectDocument>;

  // Check required top-level fields
  if (
    typeof doc.format !== "string" ||
    typeof doc.version !== "number" ||
    typeof doc.appVersion !== "string" ||
    typeof doc.savedAt !== "string" ||
    typeof doc.name !== "string" ||
    !doc.data ||
    typeof doc.data !== "object"
  ) {
    return false;
  }

  // Validate format
  if (doc.format !== "cartridge-project") {
    return false;
  }

  // Validate version
  if (doc.version !== 1) {
    return false;
  }

  // Validate data structure
  const data = doc.data as Partial<ProjectDocument["data"]>;

  if (!Array.isArray(data.tilesets) || !Array.isArray(data.maps) || !Array.isArray(data.sprites)) {
    return false;
  }

  // Validate that arrays don't contain undefined/null in a basic way
  if (data.tilesets.some((item) => !item || typeof item !== "object")) {
    return false;
  }
  if (data.maps.some((item) => !item || typeof item !== "object")) {
    return false;
  }
  if (data.sprites.some((item) => !item || typeof item !== "object")) {
    return false;
  }

  return true;
};

/**
 * Attempts to parse and validate a project document from a JSON string
 * Returns the parsed document if valid, null if invalid or corrupted
 */
export const safeParseProjectDocument = (jsonString: string): ProjectDocument | null => {
  try {
    const parsed = JSON.parse(jsonString);
    if (isValidProjectDocument(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    // JSON parsing failed - data is corrupted
    return null;
  }
};

/**
 * Attempts to parse autosave data from localStorage with robust error handling
 * Returns validated project data or null if invalid
 */
export const loadAutosaveData = (storageKey: string): ProjectDocument | null => {
  try {
    const autosaveData = localStorage.getItem(storageKey);
    if (!autosaveData) {
      return null;
    }

    return safeParseProjectDocument(autosaveData);
  } catch (error) {
    console.error("Failed to load autosave data:", error);
    return null;
  }
};
