import React from "react";
import { Circle, Crop, Eraser, PaintBucket, Pencil, Square } from "lucide-react";
import { useStore } from "../../store";
import type { GBColor } from "../../types";

export const Palette: React.FC = () => {
  const { selectedColor, setSelectedColor } = useStore();
  const colors: GBColor[] = [0, 1, 2, 3];

  return (
    <div className="card">
      <h3 className="section-title">Palette</h3>
      <div className="palette">
        {colors.map((color) => (
          <div key={color} className={`palette-color color-${color} ${selectedColor === color ? "selected" : ""}`} onClick={() => setSelectedColor(color)} />
        ))}
      </div>
    </div>
  );
};

export const Toolbox: React.FC = () => {
  const { tool, setTool } = useStore();

  return (
    <div className="card">
      <h3 className="section-title">Tools</h3>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button className={`btn ${tool === "pencil" ? "" : "btn-secondary"}`} onClick={() => setTool("pencil")} title="Pencil"><Pencil size={18} /></button>
        <button className={`btn ${tool === "eraser" ? "" : "btn-secondary"}`} onClick={() => setTool("eraser")} title="Eraser"><Eraser size={18} /></button>
        <button className={`btn ${tool === "bucket" ? "" : "btn-secondary"}`} onClick={() => setTool("bucket")} title="Fill bucket"><PaintBucket size={18} /></button>
        <button className={`btn ${tool === "square" ? "" : "btn-secondary"}`} onClick={() => setTool("square")} title="Rectangle"><Square size={18} /></button>
        <button className={`btn ${tool === "circle" ? "" : "btn-secondary"}`} onClick={() => setTool("circle")} title="Circle"><Circle size={18} /></button>
        <button className={`btn ${tool === "select" ? "" : "btn-secondary"}`} onClick={() => setTool("select")} title="Selection"><Crop size={18} /></button>
      </div>
    </div>
  );
};
