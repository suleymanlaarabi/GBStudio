import React from "react";
import {
import { useStore } from "../../store";
import { ExportPanel } from "./ExportPanel";
  Grid3X3,
  Map as MapIcon,
  MonitorPlay,
  Redo2,
  Undo2,
  LayoutTemplate,
  Volume2,
  Settings,
} from "lucide-react";

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
