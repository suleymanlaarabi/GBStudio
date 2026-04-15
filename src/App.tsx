import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { TilePixelEditor } from "./components/editors/TilePixelEditor";
import { MapEditor } from "./components/editors/MapEditor";
import { SpriteStudio } from "./components/editors/SpriteStudio";
import { AppLayout } from "./components/layout/AppLayout";
import type { StatusTone } from "./components/layout/StatusBar";
import { MapGallery } from "./components/panels/MapGallery";
import { Palette, Toolbox } from "./components/panels/Toolbar";
import { TilesetPanel } from "./components/panels/TilesetPanel";
import { ShortcutsModal } from "./components/ui/ShortcutsModal";
import { generateCFile, generateHFile } from "./services/exportService";
import { parseProjectDocument, serializeProject } from "./services/projectService";
import { useStore } from "./store";
import { useKeyboardShortcuts } from "./store/hooks/useKeyboardShortcuts";
import "./App.css";

const AUTOSAVE_KEY = "cartridge.autosave.v1";
const PROJECT_PATH_KEY = "cartridge.project-file-path";

function App() {
  const { tilesets, maps, sprites, redo, undo, view, loadProjectData } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [projectFilePath, setProjectFilePath] = useState<string | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Ready");
  const [statusTone, setStatusTone] = useState<StatusTone>("info");
  const statusTimeoutRef = useRef<number | null>(null);

  const updateStatus = useCallback((message: string, tone: StatusTone = "info", durationMs?: number) => {
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
  }, []);

  useKeyboardShortcuts({
    shortcuts: [
      {
        matcher: (event) => (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z",
        handler: (event) => {
          event.preventDefault();
          if (event.shiftKey) redo();
          else undo();
        },
      },
      {
        matcher: (event) => (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y",
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
    const savedPath = localStorage.getItem(PROJECT_PATH_KEY);
    if (savedPath) setProjectFilePath(savedPath);

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
        const snapshot = serializeProject("Autosave", { tilesets, maps, sprites });
        localStorage.setItem(AUTOSAVE_KEY, snapshot);
      } catch (error) {
        console.error("Autosave failed", error);
        updateStatus("Autosave failed", "error", 4000);
      }
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [maps, sprites, tilesets, updateStatus]);

  useEffect(() => () => {
    if (statusTimeoutRef.current) {
      window.clearTimeout(statusTimeoutRef.current);
    }
  }, []);

  const exportLocal = () => {
    const name = "MyGameSet";
    const cContent = generateCFile(name, tilesets, maps, sprites);
    const hContent = generateHFile(name, tilesets, maps, sprites);

    const downloadFile = (filename: string, content: string) => {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    };

    downloadFile(`${name}.c`, cContent);
    downloadFile(`${name}.h`, hContent);
    updateStatus("C/H export downloaded", "success", 3000);
  };

  const chooseProjectFolder = async () => {
    try {
      updateStatus("Selecting export folder...", "busy");
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Project Folder",
      });

      if (!selected) {
        updateStatus("Folder selection cancelled", "info", 2500);
        return;
      }

      setProjectPath(selected as string);
      updateStatus("Export folder selected", "success", 3000);
    } catch (error) {
      console.error(error);
      updateStatus(`Folder selection failed: ${String(error)}`, "error", 5000);
    }
  };

  const saveProjectToPath = async (path: string) => {
    const projectName = path.split(/[\\/]/).pop()?.replace(/\.cartridge$/i, "") || "project";
    const content = serializeProject(projectName, { tilesets, maps, sprites });

    await invoke("save_text_file", {
      path,
      content,
    });

    setProjectFilePath(path);
    localStorage.setItem(PROJECT_PATH_KEY, path);
  };

  const saveProject = async () => {
    setIsSaving(true);
    try {
      updateStatus("Saving project...", "busy");
      let path = projectFilePath;
      if (!path) {
        const selected = await save({
          title: "Save project",
          defaultPath: "project.cartridge",
          filters: [{ name: "Cartridge Project", extensions: ["cartridge"] }],
        });
        if (!selected) {
          updateStatus("Project save cancelled", "info", 2500);
          return;
        }
        path = selected;
      }

      await saveProjectToPath(path);
      updateStatus(`Project saved: ${path}`, "success", 4000);
    } catch (error) {
      console.error(error);
      updateStatus(`Project save failed: ${String(error)}`, "error", 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const saveProjectAs = async () => {
    setIsSaving(true);
    try {
      updateStatus("Saving project as...", "busy");
      const selected = await save({
        title: "Save project as",
        defaultPath: "project.cartridge",
        filters: [{ name: "Cartridge Project", extensions: ["cartridge"] }],
      });
      if (!selected) {
        updateStatus("Save as cancelled", "info", 2500);
        return;
      }

      await saveProjectToPath(selected);
      updateStatus(`Project saved: ${selected}`, "success", 4000);
    } catch (error) {
      console.error(error);
      updateStatus(`Project save failed: ${String(error)}`, "error", 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const openProject = async () => {
    try {
      updateStatus("Opening project...", "busy");
      const selected = await open({
        multiple: false,
        directory: false,
        title: "Open project",
        filters: [{ name: "Cartridge Project", extensions: ["cartridge", "json"] }],
      });

      if (!selected) {
        updateStatus("Open project cancelled", "info", 2500);
        return;
      }

      const raw = await invoke<string>("read_text_file", { path: selected });
      const project = parseProjectDocument(raw);
      loadProjectData(project.data);
      setProjectFilePath(selected);
      localStorage.setItem(PROJECT_PATH_KEY, selected);
      updateStatus(`Project opened: ${selected}`, "success", 4000);
    } catch (error) {
      console.error(error);
      updateStatus(`Project open failed: ${String(error)}`, "error", 5000);
    }
  };

  const saveToProject = async () => {
    setIsSaving(true);

    try {
      updateStatus("Exporting C/H files...", "busy");
      let path = projectPath;

      if (!path) {
        const selected = await open({
          directory: true,
          multiple: false,
          title: "Select Export Directory (no project folder configured)",
        });

        if (!selected) {
          setIsSaving(false);
          updateStatus("Export cancelled", "info", 2500);
          return;
        }

        path = selected as string;
        setProjectPath(path);
      }

      const name = "MyGameSet";
      const cContent = generateCFile(name, tilesets, maps, sprites);
      const hContent = generateHFile(name, tilesets, maps, sprites);

      await invoke("save_file", {
        path,
        filename: `${name}.c`,
        content: cContent,
      });
      await invoke("save_file", {
        path,
        filename: `${name}.h`,
        content: hContent,
      });

      updateStatus(`C/H exported to ${path}`, "success", 4000);
    } catch (error) {
      console.error(error);
      updateStatus(`Export failed: ${String(error)}`, "error", 5000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout
      isSaving={isSaving}
      onExportToProject={saveToProject}
      onDownload={exportLocal}
      onChooseProjectFolder={chooseProjectFolder}
      onOpenProject={openProject}
      onSaveProject={saveProject}
      onSaveProjectAs={saveProjectAs}
      projectPath={projectPath}
      projectFilePath={projectFilePath}
      statusMessage={statusMessage}
      statusTone={statusTone}
      onOpenShortcuts={() => setIsShortcutsOpen(true)}
    >
      {view === "gallery" ? (
        <MapGallery />
      ) : view === "map_editor" ? (
        <MapEditor />
      ) : view === "studio" ? (
        <SpriteStudio />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 350px",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <Palette />
              <Toolbox />
            </div>
            <TilePixelEditor />
          </div>
          <TilesetPanel />
        </div>
      )}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </AppLayout>
  );
}

export default App;
