import React from "react";
import { Download, FolderOpen, Save, Send } from "lucide-react";

interface ExportPanelProps {
  isSaving: boolean;
  onExportToProject: () => void;
  onDownload: () => void;
  onChooseProjectFolder: () => void;
  onOpenProject: () => void;
  onSaveProject: () => void;
  onSaveProjectAs: () => void;
  projectPath: string | null;
  projectFilePath: string | null;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  isSaving,
  onExportToProject,
  onDownload,
  onChooseProjectFolder,
  onOpenProject,
  onSaveProject,
  onSaveProjectAs,
  projectPath,
  projectFilePath,
}) => (
  <div
    style={{
      marginTop: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    }}
  >
    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
      <h3
        style={{
          fontSize: "0.75rem",
          margin: 0,
          color: "#ccc",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Project
      </h3>

      {projectFilePath && (
        <div
          style={{
            fontSize: "0.6rem",
            color: "white",
            wordBreak: "break-all",
            padding: "8px",
            background: "#101621",
            borderRadius: "4px",
            border: "1px solid #26415f",
          }}
          title={projectFilePath}
        >
          {projectFilePath}
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          className="btn btn-secondary"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
          onClick={onOpenProject}
          title="Open a .cartridge project file"
        >
          <FolderOpen size={16} />
          Open
        </button>
        <button
          className="btn btn-secondary"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
          onClick={onSaveProjectAs}
          disabled={isSaving}
          title="Save the current project to a new .cartridge file"
        >
          <Save size={16} />
          Save as
        </button>
      </div>

      <button
        className="btn"
        style={{
          background: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}
        onClick={onSaveProject}
        disabled={isSaving}
        title="Save the current project"
      >
        <Save size={18} />
        {isSaving ? "Saving project..." : "Save project"}
      </button>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
      <h3
        style={{
          fontSize: "0.75rem",
          margin: 0,
          color: "#ccc",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Export C/H
      </h3>

      {projectPath && (
        <div
          style={{
            fontSize: "0.6rem",
            color: "white",
            wordBreak: "break-all",
            padding: "8px",
            background: "#1a1a1a",
            borderRadius: "4px",
            border: "1px solid #333",
          }}
          title={projectPath}
        >
          {projectPath}
        </div>
      )}

      {!projectPath ? (
        <button
          className="btn btn-secondary"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
          onClick={onChooseProjectFolder}
          title="Choose the folder used for C/H export"
        >
          <FolderOpen size={18} />
          Select folder
        </button>
      ) : (
        <button
          className="btn"
          style={{
            background: "#22c55e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
          onClick={onExportToProject}
          disabled={isSaving}
          title="Export C/H files to the selected folder"
        >
          <Send size={18} />
          {isSaving ? "Sauvegarde..." : "Save"}
        </button>
      )}

      <button
        className="btn btn-secondary"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}
        onClick={onDownload}
        title="Download generated C/H files locally"
      >
        <Download size={18} />
        Download ZIP
      </button>
    </div>
  </div>
);
