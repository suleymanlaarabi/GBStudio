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
      {
        matcher: (event) => event.key === "?",
        handler: (event) => {
          event.preventDefault();
          setIsShortcutsOpen(true);
        },
      },
    ],
  });

  useEffect(() => {
    const savedFilePath = localStorage.getItem(PROJECT_PATH_KEY);
    if (savedFilePath) setProjectFilePath(savedFilePath);

    const savedFolderPath = localStorage.getItem(PROJECT_FOLDER_KEY);
    if (savedFolderPath) setProjectPath(savedFolderPath);

    const autosave = localStorage.getItem(AUTOSAVE_KEY);
    if (!autosave) return;

    try {
      const project = parseProjectDocument(autosave);
      loadProjectData(project.data);
      updateStatus("Session autosave restored", "success", 3000);
    } catch (error) {
      console.error("Failed to restore autosave", error);
      updateStatus("Autosave restore failed", "error", 4000);
    }
  }, [loadProjectData, updateStatus]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const snapshot = serializeProject("Autosave", {
          tilesets,
          maps,
          sprites,
          sounds,
        });
        localStorage.setItem(AUTOSAVE_KEY, snapshot);
      } catch (error) {
        console.error("Autosave failed", error);
        updateStatus("Autosave failed", "error", 4000);
      }
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [maps, sprites, sounds, tilesets, updateStatus]);

  useEffect(
    () => () => {
      if (statusTimeoutRef.current) {
        window.clearTimeout(statusTimeoutRef.current);
      }
    },
    [],
  );

  const exportLocal = () => {
    setConfirmExportAction("download");
    setIsPreviewOpen(true);
  };

  const chooseProjectFolder = async () => {
