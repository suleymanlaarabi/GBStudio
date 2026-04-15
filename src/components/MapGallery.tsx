import React, { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { TileMap, Tileset, TileSize } from '../store/useStore';
import { Plus, Trash2, Map as MapIcon, Edit3 } from 'lucide-react';

const GB_COLORS = ['#e0f8cf', '#8bac0f', '#306230', '#0f380f'];

const MapPreview: React.FC<{ map: TileMap; tilesets: Tileset[] }> = ({ map, tilesets }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tileSize = map.tileSize || 8;
    const cellW = canvas.width / map.width;
    const cellH = canvas.height / map.height;
    const pW = cellW / tileSize;
    const pH = cellH / tileSize;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    map.data.forEach((row, my) => {
      row.forEach((cell, mx) => {
        if (!cell) return;
        const ts = tilesets.find(t => t.id === cell.tilesetId);
        const tile = ts?.tiles[cell.tileIndex];
        if (!tile) return;
        tile.data.forEach((tRow, ty) => {
          tRow.forEach((color, tx) => {
            ctx.fillStyle = GB_COLORS[color];
            ctx.fillRect(mx * cellW + tx * pW, my * cellH + ty * pH, pW, pH);
          });
        });
      });
    });
  }, [map, tilesets]);

  return <canvas ref={canvasRef} width={200} height={180} style={{ width: '100%', height: '100%' }} />;
};

export const MapGallery: React.FC = () => {
  const { maps, tilesets, setActiveMap, addMap, removeMap } = useStore();

  const handleCreateMap = () => {
    const name = prompt('Map name?', `Map ${maps.length + 1}`);
    if (!name) return;
    
    const sizeMode = prompt('Tile size mode? (8 or 16)', '8');
    const tileSize = (sizeMode === '16' ? 16 : 8) as TileSize;

    // Default to screen size (20x18 for 8x8, 10x9 for 16x16)
    const defW = tileSize === 8 ? 20 : 10;
    const defH = tileSize === 8 ? 18 : 9;
    
    const w = parseInt(prompt('Width (in logical tiles)?', defW.toString()) || defW.toString());
    const h = parseInt(prompt('Height (in logical tiles)?', defH.toString()) || defH.toString());

    addMap(name, w, h, tileSize);
  };

  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MapIcon size={24} color="var(--accent)" />
          Map Collection
        </div>
        <button className="btn" onClick={handleCreateMap}>
          <Plus size={18} /> New Map
        </button>
      </div>

      <div className="map-gallery-grid">
        {maps.map((map, index) => {
          return (
            <div key={map.id} className="map-card" onClick={() => setActiveMap(index)}>
              <div className="map-preview">
                <MapPreview map={map} tilesets={tilesets} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{map.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>{map.width}x{map.height} • {map.tileSize}x{map.tileSize} mode</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => setActiveMap(index)}>
                    <Edit3 size={16} />
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '6px', color: '#ff4444' }} 
                    onClick={(e) => { e.stopPropagation(); removeMap(index); }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
