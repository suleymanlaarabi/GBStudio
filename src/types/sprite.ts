export interface AnimationFrame {
  tileIndex: number;
  tilesetId: string;
  // Duration is expressed in engine ticks, not milliseconds.
  // The preview/runtime currently treat 60 ticks as 1 second, so most sprite frames
  // should stay in a small range such as 6-12 ticks unless intentionally very slow.
  duration: number;
}

export interface SpriteAnimation {
  id: string;
  name: string;
  frames: AnimationFrame[];
  loop: boolean;
}

export interface SpriteAsset {
  id: string;
  name: string;
  animations: SpriteAnimation[];
}

export interface SpriteInstance {
  id: string;
  spriteAssetId: string;
  animationId: string;
  x: number;          // world tile X
  y: number;          // world tile Y
  flipH: boolean;
  flipV: boolean;
  paletteId: string;  // "obp0" | "obp1"
  priority: boolean;  // sprite renders behind background tiles when true
}
