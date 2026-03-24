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
