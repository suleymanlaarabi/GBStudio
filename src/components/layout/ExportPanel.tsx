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
