import type { TileMap } from "./map";
import type { SpriteAsset } from "./sprite";
import type { Tileset } from "./tile";

export interface ProjectData {
  tilesets: Tileset[];
  maps: TileMap[];
  sprites: SpriteAsset[];
}

export interface ProjectDocument {
  format: "cartridge-project";
  version: 1;
  appVersion: string;
  savedAt: string;
  name: string;
  data: ProjectData;
}
