import React from "react";
import { Database } from "lucide-react";
import { GB_COLORS } from "../../../constants/colors";
import type { Tileset, Tile } from "../../../types";
import { CustomSelect } from "../../ui/CustomSelect";

interface SpriteAssetLibraryProps {
  tilesets: Tileset[];
  activeTilesetIndex: number;
  tiles: Tile[];
  activeTileIndex: number;
  onSelectTileset: (index: number) => void;
  onSelectTile: (index: number) => void;
}

const TileThumbnail: React.FC<{
  tile: Tile;
  isActive: boolean;
  onClick: () => void;
}> = ({ tile, isActive, onClick }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tileSize = tile.size || 8;
    const canvasSize = 64;
    const scale = Math.floor(canvasSize / tileSize);
    const offset = (canvasSize - tileSize * scale) / 2;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    tile.data.forEach((r, y) =>
      r.forEach((c, x) => {
        if (c === null || c === undefined) return;
        ctx.fillStyle = GB_COLORS[c];
        ctx.fillRect(
          Math.floor(offset + x * scale),
          Math.floor(offset + y * scale),
          scale,
          scale,
        );
      }),
    );
  }, [tile]);

  return (
    <div
      className={`tileset-item ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      <canvas
        ref={canvasRef}
        width={64}
        height={64}
