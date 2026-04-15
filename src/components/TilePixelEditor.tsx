import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import type { GBColor } from '../store/useStore';

const GB_COLORS = ['#e0f8cf', '#8bac0f', '#306230', '#0f380f'];

export const TilePixelEditor: React.FC = () => {
  const { 
    tilesets, activeTilesetIndex, activeTileIndex, 
    updatePixel, floodFill, selectedColor, tool,
    saveHistory 
  } = useStore();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tileset = tilesets[activeTilesetIndex];
  const tile = tileset?.tiles[activeTileIndex];
  const [isDrawing, setIsDrawing] = useState(false);

  // Constants for rendering
  const CANVAS_SIZE = 320; // Fixed visual size
  const gridSize = tile?.size || 8;
  const pixelSize = CANVAS_SIZE / gridSize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !tile) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    tile.data.forEach((row, y) => {
      row.forEach((colorIndex, x) => {
        ctx.fillStyle = GB_COLORS[colorIndex];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        
        // Subtle grid lines
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      });
    });
  }, [tile, pixelSize]);

  const handleAction = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !tile) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);

    if (x >= 0 && x < tile.size && y >= 0 && y < tile.size) {
      const colorToApply = tool === 'eraser' ? 0 : selectedColor;
      if (tool === 'bucket') {
        floodFill(activeTilesetIndex, activeTileIndex, x, y, colorToApply as GBColor);
      } else {
        if (tile.data[y]![x] !== colorToApply) {
          updatePixel(activeTilesetIndex, activeTileIndex, x, y, colorToApply as GBColor);
        }
      }
    }
  };

  if (!tile) return <div className="card">No tile selected</div>;

  return (
    <div className="card">
      <div className="section-title">
        Pixel Studio ({tile.size}x{tile.size})
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', background: '#000', padding: '10px', borderRadius: '12px' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{ cursor: 'crosshair', imageRendering: 'pixelated' }}
          onMouseDown={(e) => { saveHistory(); setIsDrawing(true); handleAction(e); }}
          onMouseMove={(e) => { if (isDrawing && tool !== 'bucket') handleAction(e); }}
          onMouseUp={() => { setIsDrawing(false); saveHistory(); }}
          onMouseLeave={() => setIsDrawing(false)}
        />
      </div>
      <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem', textAlign: 'center' }}>
        {tileset.name} / Tile #{activeTileIndex} • Tool: {tool.toUpperCase()}
      </p>
    </div>
  );
};
