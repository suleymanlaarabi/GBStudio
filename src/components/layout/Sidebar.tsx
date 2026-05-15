import React from "react";
import {
  Grid3X3,
  Map as MapIcon,
  MonitorPlay,
  Redo2,
  Undo2,
  LayoutTemplate,
  Volume2,
  Settings,
} from "lucide-react";
import { useStore } from "../../store";
import { ExportPanel } from "./ExportPanel";

interface SidebarProps {
  isSaving: boolean;
  onExportToProject: () => void;
  onDownload: () => void;
  onChooseProjectFolder: () => void;
  onOpenProject: () => void;
  onSaveProject: () => void;
  onSaveProjectAs: () => void;
  projectPath: string | null;
  projectFilePath: string | null;
  onOpenTemplates: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSaving,
  onExportToProject,
  onDownload,
  onChooseProjectFolder,
  onOpenProject,
  onSaveProject,
  onSaveProjectAs,
  projectPath,
  projectFilePath,
  onOpenTemplates,
}) => {
  const { history, historyIndex, redo, undo, view, setView } = useStore();

  return (
    <aside
      className="sidebar"
      style={{
        padding: 12,
      }}
    >
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        <button
          className={`btn ${view === "tiles" ? "" : "btn-secondary"}`}
          onClick={() => setView("tiles")}
          title="Open the tileset editor"
          style={{
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
          }}
        >
          <Grid3X3 size={20} />
          Tileset Editor
        </button>
        <button
          className={`btn ${view === "gallery" || view === "map_editor" ? "" : "btn-secondary"}`}
          onClick={() => setView("gallery")}
          title="Open the map gallery"
          style={{
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
          }}
        >
          <MapIcon size={20} />
          World Maps
        </button>
        <button
          className={`btn ${view === "studio" ? "" : "btn-secondary"}`}
          onClick={() => setView("studio")}
          title="Open the sprite studio"
          style={{
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
          }}
        >
          <MonitorPlay size={20} />
          Sprite Studio
        </button>

        <button
          className={`btn ${view === "sound" ? "" : "btn-secondary"}`}
          onClick={() => setView("sound")}
          title="Open the sound studio"
          style={{
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
          }}
        >
          <Volume2 size={20} />
          Sound Studio
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenTemplates}
          title="Browse and import templates"
          style={{
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
          }}
        >
          <LayoutTemplate size={20} />
          Templates
        </button>

        <button
          className={`btn ${view === "settings" ? "" : "btn-secondary"}`}
          onClick={() => setView("settings")}
          title="Open application settings"
          style={{
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
          }}
        >
          <Settings size={20} />
          Settings
        </button>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1, padding: "10px" }}
            onClick={undo}
            disabled={historyIndex <= 0}
            title="Undo"
          >
            <Undo2 size={18} />
          </button>
          <button
            className="btn btn-secondary"
            style={{ flex: 1, padding: "10px" }}
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <Redo2 size={18} />
          </button>
        </div>
      </nav>

      <ExportPanel
        isSaving={isSaving}
        onExportToProject={onExportToProject}
        onDownload={onDownload}
        onChooseProjectFolder={onChooseProjectFolder}
        onOpenProject={onOpenProject}
        onSaveProject={onSaveProject}
        onSaveProjectAs={onSaveProjectAs}
        projectPath={projectPath}
        projectFilePath={projectFilePath}
      />
    </aside>
  );
};
