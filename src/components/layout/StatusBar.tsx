import { CheckCircle2, AlertTriangle, Info, LoaderCircle, Keyboard } from "lucide-react";
import { useStore } from "../../store";

export type StatusTone = "info" | "success" | "error" | "busy";

interface StatusBarProps {
  message: string;
  tone: StatusTone;
  onOpenShortcuts: () => void;
}

const TONE_ICON = {
  info: Info,
  success: CheckCircle2,
  error: AlertTriangle,
  busy: LoaderCircle,
} as const;

export const StatusBar = ({ message, tone, onOpenShortcuts }: StatusBarProps) => {
  const {
    view,
    tool,
    mapTool,
    selection,
    mapSelection,
    history,
    historyIndex,
  } = useStore();

  const Icon = TONE_ICON[tone];
  const selectionLabel =
    view === "map_editor"
      ? mapSelection.hasSelection
        ? `Map selection ${mapSelection.width}x${mapSelection.height}`
        : "No map selection"
      : selection.hasSelection
        ? `Tile selection ${selection.width}x${selection.height}`
        : "No tile selection";

  return (
    <footer className="status-bar">
      <div className={`status-pill status-pill-${tone}`}>
        <Icon size={14} className={tone === "busy" ? "status-spin" : undefined} />
        <span>{message}</span>
      </div>

      <div className="status-meta">
        <span>View: {view}</span>
        <span>Tool: {view === "map_editor" ? mapTool : tool}</span>
        <span>{selectionLabel}</span>
        <span>History: {historyIndex + 1}/{Math.max(history.length, 1)}</span>
      </div>

      <button className="btn btn-secondary status-shortcuts" onClick={onOpenShortcuts} title="Show keyboard shortcuts">
        <Keyboard size={14} />
        Shortcuts
      </button>
    </footer>
  );
};
