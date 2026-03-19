import {
import type { MapTool } from "../../../types";
  Eraser,
  MousePointer2,
  PaintBucket,
  Pipette,
  Pencil,
  Slash,
  Square,
  Camera,
  Shield,
  Ghost,
} from "lucide-react";

export const TOOL_OPTIONS: Array<{
  id: MapTool;
  icon: typeof Pencil;
  label: string;
}> = [
  { id: "pencil", icon: Pencil, label: "Pencil" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
  { id: "eyedropper", icon: Pipette, label: "Eyedropper" },
  { id: "fill", icon: PaintBucket, label: "Fill" },
  { id: "line", icon: Slash, label: "Line" },
  { id: "rectangle", icon: Square, label: "Rectangle" },
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "camera_spawn", icon: Camera, label: "Camera Spawn" },
  { id: "collision", icon: Shield, label: "Collision (left=solid, right=clear)" },
  { id: "sprite_place", icon: Ghost, label: "Place Sprite" },
];
