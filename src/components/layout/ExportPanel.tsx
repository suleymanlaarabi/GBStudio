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
