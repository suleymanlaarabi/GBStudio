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
        style={{ width: "100%", height: "100%", imageRendering: "pixelated" }}
      />
    </div>
  );
};

export const SpriteAssetLibrary: React.FC<SpriteAssetLibraryProps> = ({
  tilesets,
  activeTilesetIndex,
  tiles,
  activeTileIndex,
  onSelectTileset,
  onSelectTile,
}) => {
  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        overflow: "hidden",
      }}
    >
      <div className="section-title" style={{ fontSize: "0.9rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Database size={16} /> Asset Library
        </div>
      </div>
      <CustomSelect
        value={activeTilesetIndex.toString()}
        onChange={(value) => onSelectTileset(parseInt(String(value), 10))}
        options={tilesets.map((ts, i) => ({
          label: ts.name,
          value: i.toString(),
        }))}
      />
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))",
          }}
        >
          {tiles.map((t, i) => (
            <TileThumbnail
              key={t.id}
              tile={t}
              isActive={activeTileIndex === i}
              onClick={() => onSelectTile(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
