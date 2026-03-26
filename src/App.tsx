import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { TilePixelEditor } from "./components/editors/TilePixelEditor";
import { MapEditor } from "./components/editors/MapEditor";
import { SpriteStudio } from "./components/editors/SpriteStudio";
import { SoundStudio } from "./components/editors/SoundStudio";
import { Settings } from "./components/editors/Settings";
import { AppLayout } from "./components/layout/AppLayout";
import type { StatusTone } from "./components/layout/StatusBar";
import { MapGallery } from "./components/panels/MapGallery";
import { Palette, Toolbox } from "./components/panels/Toolbar";
import { TilesetPanel } from "./components/panels/TilesetPanel";
import { ShortcutsModal } from "./components/ui/ShortcutsModal";
import { ExportPreviewModal } from "./components/ui/ExportPreviewModal";
import { TemplateGallery } from "./components/ui/TemplateGallery";
import { generateCFile, generateHFile } from "./services/exportService";
import {
import { useStore } from "./store";
import { useKeyboardShortcuts } from "./store/hooks/useKeyboardShortcuts";
import "./App.css";
  parseProjectDocument,
  serializeProject,
} from "./services/projectService";

const AUTOSAVE_KEY = "cartridge.autosave.v1";
const PROJECT_PATH_KEY = "cartridge.project-file-path";
const PROJECT_FOLDER_KEY = "cartridge.project-folder-path";

function App() {
  const { tilesets, maps, sprites, sounds, redo, undo, view, loadProjectData } =
    useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [projectFilePath, setProjectFilePath] = useState<string | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [confirmExportAction, setConfirmExportAction] = useState<
    null | "download" | "project"
  >(null);
  const [statusMessage, setStatusMessage] = useState("Ready");
  const [statusTone, setStatusTone] = useState<StatusTone>("info");
  const statusTimeoutRef = useRef<number | null>(null);

  const updateStatus = useCallback(
    (message: string, tone: StatusTone = "info", durationMs?: number) => {
      setStatusMessage(message);
      setStatusTone(tone);

      if (statusTimeoutRef.current) {
        window.clearTimeout(statusTimeoutRef.current);
        statusTimeoutRef.current = null;
      }

      if (durationMs) {
        statusTimeoutRef.current = window.setTimeout(() => {
          setStatusMessage("Ready");
          setStatusTone("info");
          statusTimeoutRef.current = null;
        }, durationMs);
      }
    },
    [],
  );

  useKeyboardShortcuts({
    shortcuts: [
      {
        matcher: (event) =>
          (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z",
        handler: (event) => {
          event.preventDefault();
          if (event.shiftKey) redo();
          else undo();
        },
      },
      {
        matcher: (event) =>
          (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y",
        handler: (event) => {
          event.preventDefault();
          redo();
        },
      },
