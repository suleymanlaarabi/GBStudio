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
