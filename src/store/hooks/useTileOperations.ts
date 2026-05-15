import { useStore } from "..";

export const useTileOperations = () => {
  const {
    tilesets,
    activeTilesetIndex,
    activeTileIndex,
    updatePixel,
    floodFill,
    drawRectangle,
    drawCircle,
  } = useStore();

  const tileset = tilesets[activeTilesetIndex];
  const tile = tileset?.tiles[activeTileIndex];

  return {
    tileset,
    tile,
    updatePixel,
    floodFill,
    drawRectangle,
    drawCircle,
  };
};
