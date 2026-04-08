import React from "react";
import { Clock, Plus, X } from "lucide-react";
import { GB_COLORS } from "../../../constants/colors";
import type { SpriteAnimation, Tile, Tileset } from "../../../types";

interface FrameCanvasProps {
  tile: Tile | undefined;
  size: number;
}

const FrameCanvas: React.FC<FrameCanvasProps> = ({ tile, size }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !tile) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tileSize = tile.size || 8;
    const scale = Math.floor(size / tileSize);
    const offset = (size - tileSize * scale) / 2;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size, size);

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
  }, [tile, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: "100%", height: "auto", imageRendering: "pixelated" }}
    />
  );
};

interface TimelineProps {
  activeAnim: SpriteAnimation | undefined;
  tilesets: Tileset[];
  onUpdateDuration: (frameIndex: number, duration: number) => void;
  onRemoveFrame: (frameIndex: number) => void;
  onAddFrame: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  activeAnim,
  tilesets,
  onUpdateDuration,
  onRemoveFrame,
  onAddFrame,
}) => {
  return (
    <div
      className="card"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        padding: 0,
      }}
    >
      <div
        style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid #333",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#fff" }}>
          Timeline: {activeAnim?.name || "---"}
        </h3>
        {activeAnim && (
          <div style={{ fontSize: "0.75rem", color: "#888" }}>
            {activeAnim.frames.length} Frames
          </div>
        )}
      </div>
      <div
        style={{
          flex: 1,
          overflowX: "hidden",
          overflowY: "auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: "12px",
          padding: "1rem",
          background: "var(--bg-main)",
        }}
      >
        {activeAnim ? (
          <>
            {activeAnim.frames.map((f, i) => (
