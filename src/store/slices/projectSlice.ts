import type { StateCreator } from "zustand";
import type {
  MapSelectionState,
  ProjectData,
  SelectionState,
  SpriteAsset,
  TileMap,
  Tileset,
} from "../../types";
import { normalizeTilesetLayout } from "../../services/tileService";

export interface ProjectSlice {
  loadProjectData: (data: ProjectData) => void;
}

type ProjectState = ProjectSlice & {
  activeMapIndex: number;
  activeSpriteIndex: number;
  activeTileIndex: number;
  activeTilesetIndex: number;
  history: string[];
  historyIndex: number;
  mapClipboard: unknown;
  mapSelection: { hasSelection: boolean; x: number; y: number; width: number; height: number };
  clipboard: unknown;
  selection: { hasSelection: boolean; x: number; y: number; width: number; height: number };
  tilesets: Tileset[];
  maps: TileMap[];
  sprites: SpriteAsset[];
  view: "tiles" | "gallery" | "map_editor" | "studio";
};

const createHistorySnapshot = (tilesets: Tileset[], maps: TileMap[], sprites: SpriteAsset[]) =>
  JSON.stringify({
    tilesets,
    maps,
    sprites,
    selection: {
      hasSelection: false,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    } satisfies SelectionState,
    mapSelection: {
      hasSelection: false,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    } satisfies MapSelectionState,
  });

export const createProjectSlice: StateCreator<
  ProjectState,
  [],
  [],
  ProjectSlice
> = (set) => ({
  loadProjectData: (data) => {
    const tilesets = data.tilesets.map(normalizeTilesetLayout);
    const history = [createHistorySnapshot(tilesets, data.maps, data.sprites)];

    set({
      tilesets,
      maps: data.maps,
      sprites: data.sprites,
      activeTilesetIndex: 0,
      activeTileIndex: 0,
      activeMapIndex: data.maps.length > 0 ? 0 : -1,
      activeSpriteIndex: 0,
      selection: { hasSelection: false, x: 0, y: 0, width: 0, height: 0 },
      clipboard: null,
      mapSelection: { hasSelection: false, x: 0, y: 0, width: 0, height: 0 },
      mapClipboard: null,
      view: data.maps.length > 0 ? "gallery" : "tiles",
      history,
      historyIndex: 0,
    });
  },
});
