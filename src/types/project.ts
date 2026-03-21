import type { TileMap } from "./map";
import type { SpriteAsset } from "./sprite";
import type { Tileset } from "./tile";
import type { SoundAsset } from "./sound";

export interface ProjectData {
  tilesets: Tileset[];
  maps: TileMap[];
  sprites: SpriteAsset[];
  sounds?: SoundAsset[];
}

export interface ProjectDocument {
  format: "cartridge-project";
  version: 1;
  appVersion: string;
  savedAt: string;
  name: string;
  data: ProjectData;
}
