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
