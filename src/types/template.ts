import type { TileMap } from "./map";
import type { Tileset } from "./tile";
import type { SpriteAsset } from "./sprite";

export type TemplateCategory = "dungeon" | "overworld" | "platformer" | "custom";

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
}
