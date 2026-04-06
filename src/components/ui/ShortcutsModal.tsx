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

export const ShortcutsModal = ({ isOpen, onClose }: ShortcutsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content card"
        onClick={(event) => event.stopPropagation()}
        style={{ maxWidth: "720px", width: "90%" }}
      >
        <div className="section-title">
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Keyboard size={16} />
            Keyboard shortcuts
          </span>
          <button className="btn btn-secondary" style={{ padding: "4px 10px" }} onClick={onClose}>
            Close
          </button>
        </div>

        <div style={{ display: "grid", gap: "0.5rem", maxHeight: "60vh", overflowY: "auto", paddingTop: "0.5rem" }}>
          {SHORTCUTS.map((shortcut) => (
            <div
              key={`${shortcut.context}-${shortcut.action}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 1fr",
                gap: "0.75rem",
                padding: "0.75rem",
                background: "#111",
                border: "1px solid #222",
                borderRadius: "8px",
                alignItems: "center",
              }}
            >
              <div style={{ color: "#fff", fontWeight: 600 }}>{shortcut.action}</div>
              <div style={{ color: "var(--accent)", fontFamily: "monospace", fontSize: "0.85rem" }}>
                {shortcut.keys}
              </div>
              <div style={{ color: "#888", fontSize: "0.8rem" }}>{shortcut.context}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
