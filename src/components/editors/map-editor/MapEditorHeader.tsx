import React from "react";
import { ChevronLeft, ZoomIn, ZoomOut } from "lucide-react";
import type { TileMap, View } from "../../../types";

interface MapEditorHeaderProps {
  map: TileMap;
  zoom: number;
  setZoom: (zoom: number) => void;
  setView: (view: View) => void;
}

export const MapEditorHeader: React.FC<MapEditorHeaderProps> = ({
  map,
  zoom,
  setZoom,
  setView,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          className="btn btn-secondary"
          onClick={() => setView("gallery")}
          title="Back to map gallery"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="section-title" style={{ margin: 0 }}>
          {map.name}{" "}
          <span style={{ opacity: 0.5, fontSize: "0.8rem", marginLeft: 8 }}>
            ({map.width}x{map.height} tiles • {map.tileSize}x{map.tileSize})
          </span>
        </h2>
      </div>
      <div
        className="card"
        style={{ display: "flex", gap: "0.5rem", padding: "0.4rem" }}
      >
        <button
          className="btn btn-secondary"
          style={{ padding: "4px" }}
          onClick={() => setZoom(zoom - 1)}
          title="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <span
          style={{
            fontSize: "0.7rem",
            alignSelf: "center",
            minWidth: "35px",
            textAlign: "center",
          }}
        >
          {Math.round(zoom * 100)}%
        </span>
        <button
          className="btn btn-secondary"
          style={{ padding: "4px" }}
          onClick={() => setZoom(zoom + 1)}
          title="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
      </div>
    </div>
  );
};
