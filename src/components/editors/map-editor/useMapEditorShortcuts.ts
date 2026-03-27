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
      {
        matcher: (event) =>
          (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v",
        handler: (event) => {
          event.preventDefault();
          if (hoverCell) pasteMapSelection(hoverCell.x, hoverCell.y);
          else if (mapSelection.hasSelection)
            pasteMapSelection(mapSelection.x, mapSelection.y);
          else pasteMapSelection(0, 0);
        },
      },
      {
        matcher: (event) => event.key === "Delete" || event.key === "Backspace",
        handler: (event) => {
          event.preventDefault();
          deleteMapSelection();
        },
