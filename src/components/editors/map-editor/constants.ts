import {
  Eraser,
  MousePointer2,
  PaintBucket,
  Pipette,
  Pencil,
  Slash,
  Square,
} from "lucide-react";
import type { MapTool } from "../../../types";

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
];
