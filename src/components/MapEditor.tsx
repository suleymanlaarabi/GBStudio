import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { ZoomIn, ZoomOut, Maximize, Move, MousePointer2, ChevronLeft, Database } from 'lucide-react';

const GB_COLORS = ['#e0f8cf', '#8bac0f', '#306230', '#0f380f'];

export const MapEditor: React.FC = () => {
  const { 
    maps, activeMapIndex, tilesets, 
    activeTileIndex, setActiveTile, updateMapCell, 
    zoom, setZoom, setView, saveHistory,
    activeTilesetIndex, setActiveTileset
  } = useStore();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const map = maps[activeMapIndex];
  
  const activeTileset = tilesets[activeTilesetIndex];
  const [isDrawing, setIsDrawing] = useState(false);

  const tileSize = map?.tileSize || 8;
  const unitSize = tileSize * zoom;

  // Filter tilesets to only show compatible ones (same size as map)
  const compatibleTilesets = tilesets.filter(ts => ts.tileSize === tileSize);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    map.data.forEach((row, my) => {
      row.forEach((cell, mx) => {
        if (!cell) return;
        const ts = tilesets.find(t => t.id === cell.tilesetId);
        const tile = ts?.tiles[cell.tileIndex];
        if (!tile) return;

        for (let y = 0; y < tileSize; y++) {
          for (let x = 0; x < tileSize; x++) {
            const color = tile.data[y]![x]!;
            ctx.fillStyle = GB_COLORS[color];
            ctx.fillRect(mx * unitSize + x * zoom, my * unitSize + y * zoom, zoom, zoom);
          }
        }
      });
    });

    // Grid
    if (zoom > 1) {
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      for(let i=0; i<=map.width; i++) { ctx.beginPath(); ctx.moveTo(i*unitSize, 0); ctx.lineTo(i*unitSize, map.height*unitSize); ctx.stroke(); }
      for(let i=0; i<=map.height; i++) { ctx.beginPath(); ctx.moveTo(0, i*unitSize); ctx.lineTo(map.width*unitSize, i*unitSize); ctx.stroke(); }
    }
  }, [map, tilesets, zoom, unitSize, tileSize]);

  const handleAction = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !map || !activeTileset) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / unitSize);
    const y = Math.floor((e.clientY - rect.top) / unitSize);

    if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
      const currentCell = map.data[y]![x];
      if (!currentCell || currentCell.tilesetId !== activeTileset.id || currentCell.tileIndex !== activeTileIndex) {
        updateMapCell(activeMapIndex, x, y, activeTileset.id, activeTileIndex);
      }
    }
  };

  if (!map) return <div>Map not found</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', height: 'calc(100vh - 120px)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => setView('gallery')}><ChevronLeft size={18} /></button>
            <h2 className="section-title" style={{ margin: 0 }}>{map.name} <span style={{opacity: 0.5, fontSize: '0.8rem'}}>({map.width}x{map.height} tiles • {tileSize}x{tileSize})</span></h2>
          </div>
          <div className="card" style={{ display: 'flex', gap: '0.5rem', padding: '0.4rem' }}>
            <button className="btn btn-secondary" style={{ padding: '4px' }} onClick={() => setZoom(zoom - 1)}><ZoomOut size={14}/></button>
            <span style={{ fontSize: '0.7rem', alignSelf: 'center', minWidth: '35px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
            <button className="btn btn-secondary" style={{ padding: '4px' }} onClick={() => setZoom(zoom + 1)}><ZoomIn size={14}/></button>
          </div>
        </div>

        <div className="map-editor-container" style={{ flex: 1, overflow: 'auto', background: '#000' }}>
          <canvas
            ref={canvasRef}
            width={map.width * unitSize}
            height={map.height * unitSize}
            style={{ cursor: 'cell', boxShadow: '0 0 40px rgba(0,0,0,0.5)', imageRendering: 'pixelated', display: 'block', margin: 'auto' }}
            onMouseDown={(e) => { saveHistory(); setIsDrawing(true); handleAction(e); }}
            onMouseMove={(e) => isDrawing && handleAction(e)}
            onMouseUp={() => { setIsDrawing(false); saveHistory(); }}
            onMouseLeave={() => setIsDrawing(false)}
          />
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
        <div className="section-title" style={{ fontSize: '0.9rem' }}><Database size={16} /> Asset Library</div>
        
        <select 
          className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem' }}
          value={activeTilesetIndex}
          onChange={(e) => setActiveTileset(parseInt(e.target.value))}
        >
          {tilesets.map((ts, i) => (
            <option key={ts.id} value={i} disabled={ts.tileSize !== tileSize}>
              {ts.name} ({ts.tileSize}x{ts.tileSize}){ts.tileSize !== tileSize ? ' (Incompatible)' : ''}
            </option>
          ))}
        </select>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${activeTileset?.tileSize === 8 ? 4 : 2}, 1fr)`, gap: '6px' }}>
            {activeTileset?.tiles.map((t, i) => (
              <div 
                key={t.id} className={`tileset-item ${activeTileIndex === i ? 'active' : ''}`}
                style={{ width: '100%', height: 'auto', aspectRatio: '1', border: activeTileIndex === i ? '2px solid var(--accent)' : '1px solid #222' }}
                onClick={() => setActiveTile(i)}
              >
                <canvas 
                  width={32} height={32} 
                  ref={el => {
                    if (!el) return;
                    const ctx = el.getContext('2d');
                    if (ctx) {
                      const p = 32 / (activeTileset?.tileSize || 8);
                      t.data.forEach((r, y) => r.forEach((c, x) => {
                        ctx.fillStyle = GB_COLORS[c];
                        ctx.fillRect(x*p, y*p, p, p);
                      }));
                    }
                  }} 
                />
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ background: '#050505', padding: '0.5rem', borderRadius: '8px', border: '1px solid #222' }}>
           <div style={{ fontSize: '0.65rem', color: '#666', marginBottom: '4px' }}>Brush Size</div>
           <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>
             {activeTileset?.tileSize} x {activeTileset?.tileSize}
           </div>
        </div>
      </div>
    </div>
  );
};
