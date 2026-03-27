import type { TileMap } from "./map";
import type { Tileset } from "./tile";
import type { SpriteAsset } from "./sprite";
import type { SoundAsset } from "./sound";

export type TemplateCategory = "dungeon" | "overworld" | "platformer" | "shooter" | "assets" | "sounds" | "custom";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  author?: string;
  createdAt: string;
  tilesets: Tileset[];
  maps: TileMap[];
  sprites: SpriteAsset[];
  sounds?: SoundAsset[];
  isBuiltin?: boolean;
}

export interface TemplateFile {
  format: "cartridge-template";
  version: 1;
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  author?: string;
  createdAt: string;
  tilesets: Tileset[];
  maps: TileMap[];
  sprites: SpriteAsset[];
  sounds?: SoundAsset[];
}
