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
              <div
                key={i}
                className="card"
                style={{
                  aspectRatio: "3/4",
                  position: "relative",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  cursor: "pointer",
                  padding: 16,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FrameCanvas 
                    tile={tilesets.find(ts => ts.id === f.tilesetId)?.tiles[f.tileIndex]} 
                    size={64} 
                  />
                </div>
                <div
                  style={{
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Clock size={16} color="#888" />
                  <input
                    type="number"
                    value={f.duration}
                    style={{
                      width: "100%",
                      height: "32px",
                      background: "transparent",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "bold",
                      outline: "none",
                    }}
                    onChange={(e) =>
                      onUpdateDuration(i, parseInt(e.target.value, 10))
                    }
                  />
                </div>
                <button
                  className="btn btn-secondary"
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    padding: "4px",
                    width: 32,
                    height: 32,
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => onRemoveFrame(i)}
                  title="Remove frame"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              className="btn-secondary"
              style={{
                flexShrink: 0,
                aspectRatio: "3/4",
                border: "2px dashed var(--border)",
                background: "transparent",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text)",
              }}
              onClick={onAddFrame}
            >
              <Plus size={24} />
            </button>
          </>
        ) : (
          <div
            style={{
              width: "100%",
              textAlign: "center",
              color: "#444",
              fontSize: "0.9rem",
            }}
          >
            Select an animation to edit timeline
          </div>
        )}
      </div>
    </div>
  );
};
