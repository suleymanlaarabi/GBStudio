import type { StateCreator } from "zustand";
import type {
  MapLayer,
  MapSelectionState,
  ProjectData,
  SelectionState,
  SpriteAsset,
  TileMap,
  Tileset,
} from "../../types";
import type { Template } from "../../types/template";
import { normalizeTilesetLayout } from "../../services/tileService";

const migrateMap = (raw: unknown): TileMap => {
  const m = raw as TileMap & { data?: ((import("../../types").TileCell | null)[] | null)[] };
  if (m.layers && m.layers.length > 0) return m;
  const legacyData = m.data ?? [];
  const layer: MapLayer = {
    id: crypto.randomUUID(),
    name: "Layer 1",
    visible: true,
    data: legacyData as TileMap["layers"][0]["data"],
  };
  return { id: m.id, name: m.name, width: m.width, height: m.height, tileSize: m.tileSize, layers: [layer] };
};

export interface ProjectSlice {
  loadProjectData: (data: ProjectData) => void;
  importTemplate: (template: Template) => void;
}

type ProjectState = ProjectSlice & {
  activeMapIndex: number;
  activeSpriteIndex: number;
  activeTileIndex: number;
  activeTilesetIndex: number;
  activeLayerIndex: number;
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
  commit: () => void;
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
> = (set, get) => ({
  importTemplate: (template) => {
    const tilesetIdMap = new Map<string, string>();

    const newTilesets = template.tilesets.map((ts) => {
      const newTsId = crypto.randomUUID();
      tilesetIdMap.set(ts.id, newTsId);

      const tileIdMap = new Map<string, string>();
      const newTiles = ts.tiles.map((tile) => {
        const newTileId = crypto.randomUUID();
        tileIdMap.set(tile.id, newTileId);
        return { ...tile, id: newTileId };
      });

      const newLayout = ts.layout
        ? {
            columns: ts.layout.columns,
            positions: Object.fromEntries(
              Object.entries(ts.layout.positions).map(([oldId, pos]) => [
                tileIdMap.get(oldId) ?? oldId,
                pos,
              ])
            ),
          }
        : undefined;

      return { ...ts, id: newTsId, tiles: newTiles, layout: newLayout };
    });

    const newMaps = template.maps.map((map) => ({
      ...map,
      id: crypto.randomUUID(),
      layers: map.layers.map((layer) => ({
        ...layer,
        id: crypto.randomUUID(),
        data: layer.data.map((row) =>
          row.map((cell) =>
            cell
              ? { tilesetId: tilesetIdMap.get(cell.tilesetId) ?? cell.tilesetId, tileIndex: cell.tileIndex }
              : null
          )
        ),
      })),
    }));

    const newSprites = template.sprites.map((sprite) => ({
      ...sprite,
      id: crypto.randomUUID(),
      animations: sprite.animations.map((anim) => ({
        ...anim,
        id: crypto.randomUUID(),
        frames: anim.frames.map((frame) => ({
          ...frame,
          tilesetId: tilesetIdMap.get(frame.tilesetId) ?? frame.tilesetId,
        })),
      })),
    }));

    set((state) => ({
      tilesets: [...state.tilesets, ...newTilesets],
      maps: [...state.maps, ...newMaps.map(migrateMap)],
      sprites: [...state.sprites, ...newSprites],
      view: "gallery" as const,
    }));
    get().commit();
  },

  loadProjectData: (data) => {
    const tilesets = data.tilesets.map(normalizeTilesetLayout);
    const maps = data.maps.map(migrateMap);
    const history = [createHistorySnapshot(tilesets, maps, data.sprites)];

    set({
      tilesets,
      maps,
      sprites: data.sprites,
      activeTilesetIndex: 0,
      activeTileIndex: 0,
      activeMapIndex: maps.length > 0 ? 0 : -1,
      activeLayerIndex: 0,
      activeSpriteIndex: 0,
      selection: { hasSelection: false, x: 0, y: 0, width: 0, height: 0 },
      clipboard: null,
      mapSelection: { hasSelection: false, x: 0, y: 0, width: 0, height: 0 },
      mapClipboard: null,
      view: maps.length > 0 ? "gallery" : "tiles",
      history,
      historyIndex: 0,
    });
  },
});
