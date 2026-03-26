import { useStore } from "../../../store";
import { useKeyboardShortcuts } from "../../../store/hooks/useKeyboardShortcuts";
import type { CellCoords } from "./types";

interface UseMapEditorShortcutsProps {
  hoverCell: CellCoords | null;
}

export const useMapEditorShortcuts = ({ hoverCell }: UseMapEditorShortcutsProps) => {
  const {
    setMapTool,
    mapSelection,
    clearMapSelection,
    copyMapSelection,
    cutMapSelection,
    pasteMapSelection,
    deleteMapSelection,
  } = useStore();

  useKeyboardShortcuts({
    shortcuts: [
      {
        matcher: (event) =>
          (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c",
        handler: (event) => {
          event.preventDefault();
          copyMapSelection();
        },
      },
      {
        matcher: (event) =>
          (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "x",
        handler: (event) => {
          event.preventDefault();
          cutMapSelection();
        },
      },
