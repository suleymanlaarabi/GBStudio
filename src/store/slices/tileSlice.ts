import type { StateCreator } from "zustand";
import type { GBColor, TileSize, Tileset, TileMap } from "../../types";
import {
  appendTile,
  createEmptyTileset,
  drawCircleOnTile,
  drawRectangleOnTile,
  floodFillTile,
  updateTilePixel,
  removeTileFromTileset,
  cloneTileInTileset,
  moveTileInTilesetLayout,
  normalizeTilesetLayout,
} from "../../services/tileService";

export interface TileSlice {
  tilesets: Tileset[];
  addTileset: (name: string, size: TileSize) => void;
  removeTileset: (index: number) => void;
  addTile: (tilesetIndex: number) => void;
  removeTile: (tilesetIndex: number, tileIndex: number) => void;
  cloneTile: (tilesetIndex: number, tileIndex: number) => void;
  moveTileInGrid: (tilesetIndex: number, tileId: string, x: number, y: number) => void;
  updatePixel: (
    tilesetIndex: number,
    tileIndex: number,
    x: number,
    y: number,
    color: GBColor | null,
  ) => void;
  floodFill: (
    tilesetIndex: number,
    tileIndex: number,
    x: number,
    y: number,
    color: GBColor,
  ) => void;
  drawRectangle: (
    tilesetIndex: number,
    tileIndex: number,
    x: number,
    y: number,
    width: number,
    height: number,
    color: GBColor,
    filled: boolean,
  ) => void;
  drawCircle: (
    tilesetIndex: number,
    tileIndex: number,
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    color: GBColor,
    filled: boolean,
  ) => void;
}

type TileState = TileSlice & {
  activeTileIndex: number;
  activeTilesetIndex: number;
  commit: () => void;
  maps: TileMap[];
};

export const createTileSlice: StateCreator<TileState, [], [], TileSlice> = (set, get) => ({
  tilesets: [createEmptyTileset("Main Tileset", 8)],

  addTileset: (name, size) => {
    set((state) => ({
      tilesets: [...state.tilesets, createEmptyTileset(name, size)],
      activeTilesetIndex: state.tilesets.length,
      activeTileIndex: 0,
    }));
    get().commit();
  },

  removeTileset: (index) => {
    set((state) => {
      const tilesetId = state.tilesets[index]?.id;
      if (!tilesetId) return state;

      const newTilesets = state.tilesets
        .filter((_, i) => i !== index)
        .map(normalizeTilesetLayout);
      const newMaps = state.maps.map((map) => ({
        ...map,
        layers: map.layers.map((layer) => ({
          ...layer,
          chunks: Object.fromEntries(
            Object.entries(layer.chunks).map(([key, chunk]) => [
              key,
              {
                ...chunk,
                data: chunk.data.map((row) =>
                  row.map((cell) => (cell && cell.tilesetId === tilesetId ? null : cell)),
                ),
              },
            ])
          ),
        })),
      }));

      let newActiveIndex = state.activeTilesetIndex;
      if (index <= state.activeTilesetIndex) {
        newActiveIndex = Math.max(0, state.activeTilesetIndex - 1);
      }

      return {
        tilesets: newTilesets,
        maps: newMaps,
        activeTilesetIndex: newActiveIndex,
        activeTileIndex: 0,
      };
    });
    get().commit();
  },

  addTile: (tilesetIndex) => {
    set((state) => {
      const tilesets = appendTile(state.tilesets, tilesetIndex);
      const tileCount = tilesets[tilesetIndex]?.tiles.length ?? 1;
      return {
        tilesets,
        activeTileIndex: tileCount - 1,
      };
    });
    get().commit();
  },

  removeTile: (tilesetIndex, tileIndex) => {
    set((state) => {
      // Get the tileset ID before removing the tile
      const tilesetId = state.tilesets[tilesetIndex]?.id;

      // Create updated tilesets
      const newTilesets = removeTileFromTileset(state.tilesets, tilesetIndex, tileIndex);

      // If we have a valid tileset, update maps to remove references to the deleted tile
      // AND shift indices for subsequent tiles in the same tileset
      if (tilesetId) {
        const newMaps = state.maps.map((map) => ({
          ...map,
          layers: map.layers.map((layer) => ({
            ...layer,
            chunks: Object.fromEntries(
              Object.entries(layer.chunks).map(([key, chunk]) => [
                key,
                {
                  ...chunk,
                  data: chunk.data.map((row) =>
                    row.map((cell) => {
                      if (cell && cell.tilesetId === tilesetId) {
                        if (cell.tileIndex === tileIndex) return null;
                        if (cell.tileIndex > tileIndex) return { ...cell, tileIndex: cell.tileIndex - 1 };
                      }
                      return cell;
                    }),
                  ),
                },
              ])
            ),
          })),
        }));

        return {
          tilesets: newTilesets,
          maps: newMaps,
        };
      }

      return { tilesets: newTilesets };
    });
    get().commit();
  },

  cloneTile: (tilesetIndex, tileIndex) => {
    set((state) => {
      const tilesets = cloneTileInTileset(state.tilesets, tilesetIndex, tileIndex);
      const tileCount = tilesets[tilesetIndex]?.tiles.length ?? 1;
      return {
        tilesets,
        activeTileIndex: tileCount - 1,
      };
    });
    get().commit();
  },

  moveTileInGrid: (tilesetIndex, tileId, x, y) => {
    set((state) => ({
      tilesets: moveTileInTilesetLayout(state.tilesets, tilesetIndex, tileId, x, y),
    }));
    get().commit();
  },

  updatePixel: (tilesetIndex, tileIndex, x, y, color) => {
    set((state) => ({
      tilesets: updateTilePixel(state.tilesets, tilesetIndex, tileIndex, x, y, color),
    }));
  },

  floodFill: (tilesetIndex, tileIndex, x, y, color) => {
    set((state) => ({
      tilesets: floodFillTile(state.tilesets, tilesetIndex, tileIndex, x, y, color),
    }));
    get().commit();
  },

  drawRectangle: (
    tilesetIndex,
    tileIndex,
    x,
    y,
    width,
    height,
    color,
    filled,
  ) => {
    set((state) => ({
      tilesets: drawRectangleOnTile(
        state.tilesets,
        tilesetIndex,
        tileIndex,
        x,
        y,
        width,
        height,
        color,
        filled,
      ),
    }));
    get().commit();
  },

  drawCircle: (
    tilesetIndex,
    tileIndex,
    centerX,
    centerY,
    radiusX,
    radiusY,
    color,
    filled,
  ) => {
    set((state) => ({
      tilesets: drawCircleOnTile(
        state.tilesets,
        tilesetIndex,
        tileIndex,
        centerX,
        centerY,
        radiusX,
        radiusY,
        color,
        filled,
      ),
    }));
    get().commit();
  },
});
