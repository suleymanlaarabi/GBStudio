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

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  isSaving,
  onExportToProject,
  onDownload,
  onChooseProjectFolder,
  onOpenProject,
  onSaveProject,
  onSaveProjectAs,
  projectPath,
  projectFilePath,
  statusMessage,
  statusTone,
  onOpenShortcuts,
  onOpenTemplates,
}) => (
  <div className="app-container">
    <TitleBar />
    <Sidebar
      isSaving={isSaving}
      onExportToProject={onExportToProject}
      onDownload={onDownload}
      onChooseProjectFolder={onChooseProjectFolder}
      onOpenProject={onOpenProject}
      onSaveProject={onSaveProject}
      onSaveProjectAs={onSaveProjectAs}
      projectPath={projectPath}
      projectFilePath={projectFilePath}
      onOpenTemplates={onOpenTemplates}
    />
    <main className="main-content">{children}</main>
    <StatusBar message={statusMessage} tone={statusTone} onOpenShortcuts={onOpenShortcuts} />
  </div>
);
