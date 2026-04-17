import type { StateCreator } from "zustand";
import type {
  MapClipboard,
  MapLayer,
  MapSelectionState,
  ProjectData,
  SelectionState,
  SoundAsset,
  SpriteAsset,
  TileMap,
  Tileset,
  View,
} from "../../types";
import type { Template } from "../../types/template";
import { normalizeTilesetLayout } from "../../services/tileService";
import { migrateFlatDataToChunks } from "../../services/mapService";

const migrateMap = (raw: unknown): TileMap => {
  const m = raw as TileMap & { data?: ((import("../../types").TileCell | null)[] | null)[] };
  if (m.layers && m.layers.length > 0 && "chunks" in m.layers[0]) return m;

  const legacyData = m.data ?? [];
  const layers = m.layers && m.layers.length > 0
    ? m.layers.map((l: any) => ({
        ...l,
        chunks: l.chunks ?? migrateFlatDataToChunks(l.data ?? []),
      }))
    : [{
        id: crypto.randomUUID(),
        name: "Layer 1",
        visible: true,
        chunks: migrateFlatDataToChunks(legacyData as any),
      }];

  return { id: m.id, name: m.name, width: m.width, height: m.height, tileSize: m.tileSize, layers: layers as MapLayer[] };
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
  mapClipboard: MapClipboard | null;
  mapSelection: { hasSelection: boolean; x: number; y: number; width: number; height: number };
  clipboard: unknown;
  selection: { hasSelection: boolean; x: number; y: number; width: number; height: number };
  tilesets: Tileset[];
  maps: TileMap[];
  sprites: SpriteAsset[];
  sounds: SoundAsset[];
  view: View;
  commit: () => void;
};

const createHistorySnapshot = (
  tilesets: Tileset[],
  maps: TileMap[],
  sprites: SpriteAsset[],
  sounds: SoundAsset[],
) =>
  JSON.stringify({
    tilesets,
    maps,
    sprites,
    sounds,
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
        chunks: Object.fromEntries(
          Object.entries(layer.chunks).map(([key, chunk]) => [
            key,
            {
              ...chunk,
              data: chunk.data.map((row) =>
                row.map((cell) =>
                  cell
                    ? {
                        tilesetId: tilesetIdMap.get(cell.tilesetId) ?? cell.tilesetId,
                        tileIndex: cell.tileIndex,
                      }
                    : null
                )
              ),
            },
          ])
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

    const newSounds = (template.sounds ?? []).map((s) => ({
      ...s,
      id: crypto.randomUUID(),
    }));

    set((state) => ({
      tilesets: [...state.tilesets, ...newTilesets],
      maps: [...state.maps, ...newMaps.map(migrateMap)],
      sprites: [...state.sprites, ...newSprites],
      sounds: [...state.sounds, ...newSounds],
      view: "gallery" as const,
    }));
    get().commit();
  },

  loadProjectData: (data) => {
    const tilesets = data.tilesets.map(normalizeTilesetLayout);
    const maps = data.maps.map(migrateMap);
    const sounds = data.sounds || [];
    const history = [createHistorySnapshot(tilesets, maps, data.sprites, sounds)];

    set({
      tilesets,
      maps,
      sprites: data.sprites,
      sounds,
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
