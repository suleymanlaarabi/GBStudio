import React from "react";
import { Sidebar } from "./Sidebar";
import { StatusBar, type StatusTone } from "./StatusBar";
import { TitleBar } from "./TitleBar";

interface AppLayoutProps {
  children: React.ReactNode;
  isSaving: boolean;
  onExportToProject: () => void;
  onDownload: () => void;
  onChooseProjectFolder: () => void;
  onOpenProject: () => void;
  onSaveProject: () => void;
  onSaveProjectAs: () => void;
  projectPath: string | null;
  projectFilePath: string | null;
  statusMessage: string;
  statusTone: StatusTone;
  onOpenShortcuts: () => void;
  onOpenTemplates: () => void;
}
