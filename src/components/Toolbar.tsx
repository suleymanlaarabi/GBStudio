import React from 'react';
import { useStore } from '../store/useStore';
import type { GBColor } from '../store/useStore';
import { Pencil, Eraser, PaintBucket } from 'lucide-react';

export const Palette: React.FC = () => {
  const { selectedColor, setSelectedColor } = useStore();
  const colors: GBColor[] = [0, 1, 2, 3];

  return (
    <div className="card">
      <h3 className="section-title">Palette</h3>
      <div className="palette">
        {colors.map((color) => (
          <div
            key={color}
            className={`palette-color color-${color} ${selectedColor === color ? 'selected' : ''}`}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </div>
    </div>
  );
};

export const Toolbox: React.FC = () => {
  const { tool, setTool } = useStore();

  return (
    <div className="card">
      <h3 className="section-title">Tools</h3>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          className={`btn ${tool === 'pencil' ? '' : 'btn-secondary'}`} 
          onClick={() => setTool('pencil')}
          title="Pencil"
        >
          <Pencil size={18} />
        </button>
        <button 
          className={`btn ${tool === 'eraser' ? '' : 'btn-secondary'}`} 
          onClick={() => setTool('eraser')}
          title="Eraser"
        >
          <Eraser size={18} />
        </button>
        <button 
          className={`btn ${tool === 'bucket' ? '' : 'btn-secondary'}`} 
          onClick={() => setTool('bucket')}
          title="Bucket Fill"
        >
          <PaintBucket size={18} />
        </button>
      </div>
    </div>
  );
};
