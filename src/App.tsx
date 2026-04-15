import React, { useState, useEffect } from "react";
import { useStore } from "./store/useStore";
import { TilePixelEditor } from "./components/TilePixelEditor";
import { TilesetPanel } from "./components/TilesetPanel";
import { MapEditor } from "./components/MapEditor";
import { MapGallery } from "./components/MapGallery";
import { SpriteStudio } from "./components/SpriteStudio";
import { Palette, Toolbox } from "./components/Toolbar";
import { generateCFile, generateHFile } from "./utils/exportUtils";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import {
  Download,
  Gamepad2,
  Map as MapIcon,
  Image as ImageIcon,
  Send,
  Undo2,
  Redo2,
  MonitorPlay,
  Grid3X3,
} from "lucide-react";
import "./App.css";

function App() {
  const {
    tilesets,
    maps,
    sprites,
    undo,
    redo,
    historyIndex,
    history,
    view,
    setView,
  } = useStore();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const exportLocal = () => {
    const name = "MyGameSet";
    const cContent = generateCFile(name, tilesets, maps, sprites);
    const hContent = generateHFile(name, tilesets, maps, sprites);
    const download = (filename: string, content: string) => {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    };
    download(`${name}.c`, cContent);
    download(`${name}.h`, hContent);
  };

  const saveToProject = async () => {
    setIsSaving(true);
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Export Directory",
      });

      if (!selected) {
        setIsSaving(false);
        return;
      }

      const path = selected as string;
      const name = "MyGameSet";
      const cContent = generateCFile(name, tilesets, maps, sprites);
      const hContent = generateHFile(name, tilesets, maps, sprites);

      await invoke("save_file", { path, filename: `${name}.c`, content: cContent });
      await invoke("save_file", { path, filename: `${name}.h`, content: hContent });

      alert(`Success: Exported to ${path}`);
    } catch (e) {
      console.error(e);
      alert(`Error saving files: ${e}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
          }}
        >
          <Gamepad2 size={36} color="var(--accent)" />
          <h1
            style={{ fontSize: "1.4rem", margin: 0, letterSpacing: "-0.5px" }}
          >
            GB Studio
          </h1>
        </div>

        <nav
          style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
        >
          <button
            className={`btn ${view === "tiles" ? "" : "btn-secondary"}`}
            onClick={() => setView("tiles")}
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
            style={{
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
            }}
          >
            <MonitorPlay size={20} />
            Sprite Studio
          </button>
        </nav>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1, padding: "10px" }}
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            <Undo2 size={18} />
          </button>
          <button
            className="btn btn-secondary"
            style={{ flex: 1, padding: "10px" }}
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo2 size={18} />
          </button>
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
          }}
        >
          <button
            className="btn"
            style={{
              background: "#22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
            onClick={saveToProject}
            disabled={isSaving}
          >
            <Send size={18} />
            {isSaving ? "Exporting..." : "Export to GBDK"}
          </button>
          <button
            className="btn btn-secondary"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
            onClick={exportLocal}
          >
            <Download size={18} />
            Download ZIP
          </button>
        </div>
      </aside>

      <main className="main-content">
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
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <TilePixelEditor />
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <Palette />
                  <Toolbox />
                </div>
              </div>
            </div>
            <TilesetPanel />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
