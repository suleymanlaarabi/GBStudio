import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import type { Tile, SpriteAsset, SpriteAnimation } from '../store/useStore';
import { Plus, Trash2, Play, Pause, Film, Database, Clock } from 'lucide-react';

const GB_COLORS = ['#e0f8cf', '#8bac0f', '#306230', '#0f380f'];

const AnimationPreview: React.FC<{ anim: SpriteAnimation, tiles: Tile[] }> = ({ anim, tiles }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || anim.frames.length === 0) return;
    const frame = anim.frames[currentFrame];
    if (!frame) return;
    const timer = setTimeout(() => {
      setCurrentFrame((prev) => (prev + 1) % anim.frames.length);
    }, (frame.duration / 60) * 1000);
    return () => clearTimeout(timer);
  }, [currentFrame, isPlaying, anim]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || anim.frames.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const frame = anim.frames[currentFrame];
    const tile = tiles[frame?.tileIndex ?? 0];
    if (!tile) return;
    const p = canvas.width / (tile?.size || 8);
    tile.data.forEach((row, y) => row.forEach((color, x) => {
      ctx.fillStyle = GB_COLORS[color];
      ctx.fillRect(x * p, y * p, p, p);
    }));
  }, [currentFrame, anim, tiles]);

  return (
    <div style={{ position: 'relative', width: 64, height: 64 }}>
      <canvas ref={canvasRef} width={64} height={64} style={{ background: '#000', borderRadius: '6px' }} />
      <button 
        style={{ position: 'absolute', bottom: 2, right: 2, background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
      >
        {isPlaying ? <Pause size={10} /> : <Play size={10} />}
      </button>
    </div>
  );
};

export const SpriteStudio: React.FC = () => {
  const { 
    sprites, tilesets, activeTilesetIndex, setActiveTileset,
    addSprite, addAnimation, addFrame, 
    updateFrameDuration, removeFrame, activeTileIndex,
    setActiveTile
  } = useStore();
  
  const [selectedSpriteId, setSelectedSpriteId] = useState<string | null>(null);
  const [selectedAnimId, setSelectedAnimId] = useState<string | null>(null);

  const activeTileset = tilesets[activeTilesetIndex];
  const tiles = activeTileset?.tiles || [];
  
  const activeSprite = sprites.find(s => s.id === selectedSpriteId);
  const activeAnim = activeSprite?.animations.find(a => a.id === selectedAnimId);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 300px', gap: '1rem', height: 'calc(100vh - 100px)' }}>
      {/* 1. Sprite List */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="section-title">
          Sprites
          <button className="btn btn-secondary" style={{padding: '4px'}} onClick={() => addSprite(prompt('Name?') || 'Player', activeTileset?.id || '')}>
            <Plus size={16} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {sprites.map(s => (
            <button 
              key={s.id} 
              className={`btn ${selectedSpriteId === s.id ? '' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '8px 12px' }}
              onClick={() => setSelectedSpriteId(s.id)}
            >
              <Film size={14} style={{ marginRight: '8px' }} /> {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Animation Studio */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
        {/* Animations Selector */}
        <div className="card" style={{ flexShrink: 0 }}>
          <div className="section-title">
            {activeSprite ? `${activeSprite.name} Animations` : 'Animations'}
            {activeSprite && (
              <button className="btn btn-secondary" style={{padding: '4px'}} onClick={() => addAnimation(activeSprite.id, prompt('Anim Name?') || 'Idle')}>
                <Plus size={16} />
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {activeSprite?.animations.map(a => (
              <div 
                key={a.id} 
                className={`card ${selectedAnimId === a.id ? 'active' : ''}`} 
                style={{ 
                  minWidth: '160px', cursor: 'pointer', padding: '0.5rem', 
                  border: selectedAnimId === a.id ? '2px solid var(--accent)' : '1px solid #333',
                  background: selectedAnimId === a.id ? 'rgba(134, 59, 255, 0.1)' : 'var(--bg-card)'
                }}
                onClick={() => setSelectedAnimId(a.id)}
              >
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <AnimationPreview anim={a} tiles={tiles} />
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{a.name}</div>
                </div>
              </div>
            ))}
            {!activeSprite && <p style={{ color: '#555', fontSize: '0.9rem' }}>Select a sprite to see animations</p>}
          </div>
        </div>

        {/* Timeline (The refactored part) */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>Timeline: {activeAnim?.name || '---'}</h3>
            {activeAnim && <div style={{ fontSize: '0.75rem', color: '#888' }}>{activeAnim.frames.length} Frames</div>}
          </div>

          <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', display: 'flex', alignItems: 'center', gap: '4px', padding: '1rem', background: '#050505' }}>
            {activeAnim ? (
              <>
                {activeAnim.frames.map((f, i) => (
                  <div key={i} style={{ flexShrink: 0, width: 80, height: 120, position: 'relative', background: '#151515', borderRadius: '4px', border: '1px solid #333', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Tile Area */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                      <canvas 
                        width={64} height={64} 
                        style={{ width: '100%', height: 'auto', imageRendering: 'pixelated' }}
                        ref={el => {
                          if (!el) return;
                          const ctx = el.getContext('2d');
                          const tile = tiles[f.tileIndex];
                          if (ctx && tile) {
                            const p = 64 / tile.size;
                            tile.data.forEach((r, y) => r.forEach((c, x) => {
                              ctx.fillStyle = GB_COLORS[c];
                              ctx.fillRect(x*p, y*p, p, p);
                            }));
                          }
                        }} 
                      />
                    </div>
                    {/* Controls Area */}
                    <div style={{ height: '35px', padding: '2px 4px', display: 'flex', alignItems: 'center', gap: '2px', background: '#1e1e1e' }}>
                       <Clock size={10} color="#888" />
                       <input 
                        type="number" 
                        value={f.duration} 
                        style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold', outline: 'none' }}
                        onChange={(e) => updateFrameDuration(activeSprite!.id, activeAnim.id, i, parseInt(e.target.value))}
                      />
                    </div>
                    {/* Delete Overlay */}
                    <button 
                      style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(255,68,68,0.2)', border: 'none', color: '#ff4444', borderRadius: '2px', width: 16, height: 16, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => removeFrame(activeSprite!.id, activeAnim.id, i)}
                    >
                      ×
                    </button>
                    {/* Index label */}
                    <div style={{ position: 'absolute', top: 2, left: 2, background: 'rgba(0,0,0,0.5)', fontSize: '8px', color: '#aaa', padding: '1px 3px', borderRadius: '2px' }}>
                      {i+1}
                    </div>
                  </div>
                ))}
                
                {/* Add Button as a Placeholder Frame */}
                <button 
                  className="btn-secondary"
                  style={{ flexShrink: 0, width: 80, height: 120, border: '2px dashed #333', background: 'transparent', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#555' }}
                  onClick={() => addFrame(activeSprite!.id, activeAnim.id, activeTileIndex)}
                >
                  <Plus size={24} />
                </button>
              </>
            ) : (
              <div style={{ width: '100%', textAlign: 'center', color: '#444', fontSize: '0.9rem' }}>
                Select an animation to edit timeline
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Asset Library */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
        <div className="section-title" style={{ fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={16} /> Asset Library
          </div>
        </div>

        <select 
          className="btn btn-secondary" 
          style={{ width: '100%', fontSize: '0.8rem', padding: '6px' }}
          value={activeTilesetIndex}
          onChange={(e) => setActiveTileset(parseInt(e.target.value))}
        >
          {tilesets.map((ts, i) => (
            <option key={ts.id} value={i}>{ts.name}</option>
          ))}
        </select>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {tiles.map((t, i) => (
              <div 
                key={t.id} 
                className={`tileset-item ${activeTileIndex === i ? 'active' : ''}`}
                style={{ width: '100%', height: 'auto', aspectRatio: '1' }}
                onClick={() => setActiveTile(i)}
              >
                <canvas 
                  width={32} height={32} 
                  ref={el => {
                    if (!el) return;
                    const ctx = el.getContext('2d');
                    if (ctx) {
                      t.data.forEach((r, y) => r.forEach((c, x) => {
                        ctx.fillStyle = GB_COLORS[c];
                        ctx.fillRect(x*4, y*4, 4, 4);
                      }));
                    }
                  }} 
                />
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ background: 'rgba(134, 59, 255, 0.1)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--accent)', textAlign: 'center', fontSize: '0.7rem', color: 'var(--accent)' }}>
          Select tile then click + in timeline
        </div>
      </div>
    </div>
  );
};
