export interface AnimationFrame {
  tileIndex: number;
  tilesetId: string;
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
