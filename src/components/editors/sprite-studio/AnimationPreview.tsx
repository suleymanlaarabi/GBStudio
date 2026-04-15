import React, { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { GB_COLORS } from "../../../constants/colors";
import type { SpriteAnimation, Tileset } from "../../../types";

interface AnimationPreviewProps {
  anim: SpriteAnimation;
  tilesets: Tileset[];
  size?: number;
}

export const AnimationPreview: React.FC<AnimationPreviewProps> = ({ anim, tilesets, size = 80 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || anim.frames.length === 0) return;
    const frame = anim.frames[currentFrame];
    if (!frame) return;
    const timer = setTimeout(() => setCurrentFrame((prev) => (prev + 1) % anim.frames.length), (frame.duration / 60) * 1000);
    return () => clearTimeout(timer);
  }, [currentFrame, isPlaying, anim]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || anim.frames.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const frame = anim.frames[currentFrame];
    if (!frame) return;

    const tileset = tilesets.find(ts => ts.id === frame.tilesetId);
    const tile = tileset?.tiles[frame.tileIndex];
    if (!tile) return;
    
    const tileSize = tile.size || 8;
    const scale = Math.floor(size / tileSize);
    const offset = (size - (tileSize * scale)) / 2;
    
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size, size);

    tile.data.forEach((row, y) => row.forEach((color, x) => {
      ctx.fillStyle = GB_COLORS[color];
      ctx.fillRect(
        Math.floor(offset + x * scale), 
        Math.floor(offset + y * scale), 
        scale, 
        scale
      );
    }));
  }, [currentFrame, anim, tilesets, size]);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size} 
        style={{ background: "#000", borderRadius: "6px", imageRendering: "pixelated" }} 
      />
      <button
        style={{ position: "absolute", bottom: 2, right: 2, background: "rgba(0,0,0,0.7)", border: "none", color: "white", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          setIsPlaying(!isPlaying);
        }}
      >
        {isPlaying ? <Pause size={10} /> : <Play size={10} />}
      </button>
    </div>
  );
};
