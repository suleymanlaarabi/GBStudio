import { create } from 'zustand';

export type GBColor = 0 | 1 | 2 | 3;
export type TileSize = 8 | 16;

export interface Tile {
  id: string;
  data: GBColor[][]; 
  size: TileSize;
}

export interface Tileset {
  id: string;
  name: string;
  tiles: Tile[];
  tileSize: TileSize;
}

export interface TileCell {
  tilesetId: string;
  tileIndex: number;
}

export interface TileMap {
  id: string;
  name: string;
  width: number; // In logical tiles
  height: number; // In logical tiles
  tileSize: TileSize; // 8 or 16
  data: (TileCell | null)[][]; 
}

export interface AnimationFrame { tileIndex: number; duration: number; }
export interface SpriteAnimation { id: string; name: string; frames: AnimationFrame[]; loop: boolean; }
export interface SpriteAsset { id: string; name: string; animations: SpriteAnimation[]; tilesetId: string; }

type View = 'tiles' | 'gallery' | 'map_editor' | 'studio';

interface EditorState {
  tilesets: Tileset[];
  maps: TileMap[];
  sprites: SpriteAsset[];
  activeTilesetIndex: number;
  activeTileIndex: number;
  activeMapIndex: number;
  activeSpriteIndex: number;
  selectedColor: GBColor;
  tool: 'pencil' | 'eraser' | 'bucket';
  view: View;
  zoom: number;
  history: string[]; 
  historyIndex: number;

  setView: (view: View) => void;
  setZoom: (zoom: number) => void;
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;

  addTileset: (name: string, size: TileSize) => void;
  setActiveTileset: (index: number) => void;
  addTile: (tsIdx: number) => void;
  setActiveTile: (index: number) => void;
  updatePixel: (tsIdx: number, tIdx: number, x: number, y: number, color: GBColor) => void;
  floodFill: (tsIdx: number, tIdx: number, x: number, y: number, color: GBColor) => void;

  updateMapCell: (mIdx: number, x: number, y: number, tilesetId: string, tileIdx: number) => void;
  addMap: (name: string, width: number, height: number, tileSize: TileSize) => void;
  removeMap: (index: number) => void;
  setActiveMap: (index: number) => void;

  addSprite: (name: string, tilesetId: string) => void;
  setActiveSprite: (index: number) => void;
  addAnimation: (spriteId: string, name: string) => void;
  addFrame: (spriteId: string, animId: string, tileIndex: number) => void;
  updateFrameDuration: (spriteId: string, animId: string, frameIndex: number, duration: number) => void;
  removeFrame: (spriteId: string, animId: string, frameIndex: number) => void;
  
  setSelectedColor: (color: GBColor) => void;
  setTool: (tool: 'pencil' | 'eraser' | 'bucket') => void;
}

const createEmptyTile = (size: TileSize): Tile => ({
  id: crypto.randomUUID(),
  data: Array(size).fill(0).map(() => Array(size).fill(0)),
  size
});

const createEmptyTileset = (name: string, size: TileSize): Tileset => ({
  id: crypto.randomUUID(),
  name,
  tileSize: size,
  tiles: [createEmptyTile(size)],
});

const createEmptyMap = (name: string, width: number, height: number, tileSize: TileSize): TileMap => ({
  id: crypto.randomUUID(),
  name, width, height, tileSize,
  data: Array(height).fill(null).map(() => Array(width).fill(null)),
});

const initialData = {
  tilesets: [createEmptyTileset('Main Tileset', 8)],
  maps: [],
  sprites: [],
};

export const useStore = create<EditorState>((set, get) => ({
  ...initialData,
  activeTilesetIndex: 0,
  activeTileIndex: 0,
  activeMapIndex: -1,
  activeSpriteIndex: 0,
  selectedColor: 3,
  tool: 'pencil',
  view: 'tiles',
  zoom: 3,
  history: [JSON.stringify(initialData)],
  historyIndex: 0,

  saveHistory: () => {
    const { tilesets, maps, sprites, history, historyIndex } = get();
    const snapshot = JSON.stringify({ tilesets, maps, sprites });
    if (snapshot === history[historyIndex]) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(snapshot);
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const { tilesets, maps, sprites } = JSON.parse(history[newIndex]!);
      set({ tilesets, maps, sprites, historyIndex: newIndex });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const { tilesets, maps, sprites } = JSON.parse(history[newIndex]!);
      set({ tilesets, maps, sprites, historyIndex: newIndex });
    }
  },

  setView: (view) => set({ view }),
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(15, zoom)) }),

  addTileset: (name, size = 8) => {
    set(state => ({ 
      tilesets: [...state.tilesets, createEmptyTileset(name, size)],
      activeTilesetIndex: state.tilesets.length,
      activeTileIndex: 0
    }));
    get().saveHistory();
  },
  
  setActiveTileset: (index) => set({ activeTilesetIndex: index, activeTileIndex: 0 }),
  
  addTile: (tsIdx) => {
    set(state => {
      const newTsList = [...state.tilesets];
      const targetTs = { ...newTsList[tsIdx]! };
      targetTs.tiles = [...targetTs.tiles, createEmptyTile(targetTs.tileSize)];
      newTsList[tsIdx] = targetTs;
      return { tilesets: newTsList, activeTileIndex: targetTs.tiles.length - 1 };
    });
    get().saveHistory();
  },

  setActiveTile: (index) => set({ activeTileIndex: index }),

  updatePixel: (tsIdx, tIdx, x, y, color) => {
    set(state => {
      const newTsList = [...state.tilesets];
      const targetTs = { ...newTsList[tsIdx]! };
      const newTiles = [...targetTs.tiles];
      const targetTile = { ...newTiles[tIdx]! };
      targetTile.data = targetTile.data.map((r, ry) => ry === y ? r.map((p, px) => px === x ? color : p) : r);
      newTiles[tIdx] = targetTile;
      targetTs.tiles = newTiles;
      newTsList[tsIdx] = targetTs;
      return { tilesets: newTsList };
    });
  },

  floodFill: (tsIdx, tIdx, startX, startY, targetColor) => {
    set(state => {
      const newTsList = [...state.tilesets];
      const targetTs = { ...newTsList[tsIdx]! };
      const newTiles = [...targetTs.tiles];
      const targetTile = { ...newTiles[tIdx]! };
      const newData = targetTile.data.map(row => [...row]);
      const startColor = newData[startY]![startX];
      if (startColor === targetColor) return state;
      const fill = (x: number, y: number) => {
        if (x < 0 || x >= targetTs.tileSize || y < 0 || y >= targetTs.tileSize || newData[y]![x] !== startColor) return;
        newData[y]![x] = targetColor;
        fill(x+1, y); fill(x-1, y); fill(x, y+1); fill(x, y-1);
      };
      fill(startX, startY);
      targetTile.data = newData;
      newTiles[tIdx] = targetTile;
      targetTs.tiles = newTiles;
      newTsList[tsIdx] = targetTs;
      return { tilesets: newTsList };
    });
    get().saveHistory();
  },

  updateMapCell: (mIdx, x, y, tilesetId, tileIdx) => {
    set(state => {
      const newMaps = [...state.maps];
      const map = { ...newMaps[mIdx]! };
      if (y >= map.height || x >= map.width) return state;
      const newData = map.data.map((row, ry) => 
        ry === y ? row.map((cell, cx) => cx === x ? { tilesetId, tileIndex: tileIdx } : cell) : row
      );
      map.data = newData;
      newMaps[mIdx] = map;
      return { maps: newMaps };
    });
  },

  addMap: (name, width, height, tileSize) => {
    set(state => ({
      maps: [...state.maps, createEmptyMap(name, width, height, tileSize)],
      activeMapIndex: state.maps.length,
      view: 'map_editor'
    }));
    get().saveHistory();
  },

  removeMap: (index) => {
    set(state => ({ maps: state.maps.filter((_, i) => i !== index), activeMapIndex: -1 }));
    get().saveHistory();
  },

  setActiveMap: (index) => set({ activeMapIndex: index, view: 'map_editor' }),

  addSprite: (name, tilesetId) => {
    set(state => ({
      sprites: [...state.sprites, { id: crypto.randomUUID(), name, animations: [], tilesetId }],
      activeSpriteIndex: state.sprites.length
    }));
    get().saveHistory();
  },

  setActiveSprite: (index) => set({ activeSpriteIndex: index }),

  addAnimation: (spriteId, name) => {
    set(state => ({
      sprites: state.sprites.map(s => s.id === spriteId ? { ...s, animations: [...s.animations, { id: crypto.randomUUID(), name, frames: [], loop: true }] } : s)
    }));
    get().saveHistory();
  },

  addFrame: (spriteId, animId, tileIdx) => {
    set(state => ({
      sprites: state.sprites.map(s => s.id === spriteId ? { ...s, animations: s.animations.map(a => a.id === animId ? { ...a, frames: [...a.frames, { tileIndex: tileIdx, duration: 8 }] } : a) } : s)
    }));
    get().saveHistory();
  },

  updateFrameDuration: (sId, aId, fIdx, dur) => {
    get().saveHistory();
    set(state => ({
      sprites: state.sprites.map(s => s.id === sId ? { ...s, animations: s.animations.map(a => a.id === aId ? { ...a, frames: a.frames.map((f, i) => i === fIdx ? { ...f, duration: dur } : f) } : a) } : s)
    }));
  },

  removeFrame: (sId, aId, fIdx) => {
    set(state => ({
      sprites: state.sprites.map(s => s.id === sId ? { ...s, animations: s.animations.map(a => a.id === aId ? { ...a, frames: a.frames.filter((_, i) => i !== fIdx) } : a) } : s)
    }));
    get().saveHistory();
  },

  setSelectedColor: (color) => set({ selectedColor: color }),
  setTool: (tool) => set({ tool }),
}));
