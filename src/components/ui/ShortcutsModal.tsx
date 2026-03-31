import { Keyboard } from "lucide-react";

interface ShortcutItem {
  action: string;
  keys: string;
  context: string;
}

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS: ShortcutItem[] = [
  { action: "Undo", keys: "Ctrl/Cmd+Z", context: "Global" },
  { action: "Redo", keys: "Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y", context: "Global" },
  { action: "Open shortcuts", keys: "?", context: "Global" },
  { action: "Tile copy", keys: "Ctrl/Cmd+C", context: "Tile editor" },
  { action: "Tile paste", keys: "Ctrl/Cmd+V", context: "Tile editor" },
  { action: "Tile delete selection", keys: "Delete / Backspace", context: "Tile editor" },
  { action: "Map copy", keys: "Ctrl/Cmd+C", context: "Map editor" },
  { action: "Map cut", keys: "Ctrl/Cmd+X", context: "Map editor" },
  { action: "Map paste", keys: "Ctrl/Cmd+V", context: "Map editor" },
  { action: "Map delete selection", keys: "Delete / Backspace", context: "Map editor" },
  { action: "Map pencil", keys: "B", context: "Map editor" },
  { action: "Map eraser", keys: "E", context: "Map editor" },
  { action: "Map eyedropper", keys: "I", context: "Map editor" },
  { action: "Map fill", keys: "G", context: "Map editor" },
  { action: "Map line", keys: "L", context: "Map editor" },
  { action: "Map rectangle", keys: "R", context: "Map editor" },
  { action: "Map select", keys: "M", context: "Map editor" },
  { action: "Clear selection", keys: "Escape", context: "Tile / Map editor" },
];
