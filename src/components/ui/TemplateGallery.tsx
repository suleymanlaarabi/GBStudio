import React, { useEffect, useRef, useState } from "react";
import { Download, Upload, X, Layers, Sparkles } from "lucide-react";
import { GB_COLORS } from "../../constants/colors";
import { getAllTemplates, deleteUserTemplate, parseTemplateFile } from "../../services/templateService";
import { useStore } from "../../store";
import type { Template, TemplateCategory } from "../../types/template";
import type { Tileset } from "../../types";

const CATEGORY_LABELS: Record<TemplateCategory | "all", string> = {
  all: "All",
  dungeon: "Dungeon",
  overworld: "Overworld",
  platformer: "Platformer",
  custom: "Imported",
};

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  dungeon: "#8b5cf6",
  overworld: "#22c55e",
  platformer: "#f59e0b",
  custom: "#06b6d4",
};

const TemplatePreview: React.FC<{ template: Template }> = ({ template }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const map = template.maps[0];
    if (!map) {
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#333";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("No map", canvas.width / 2, canvas.height / 2);
      return;
    }

    const tilesets: Tileset[] = template.tilesets;
    const tileSize = map.tileSize || 8;
    const cellW = canvas.width / map.width;
    const cellH = canvas.height / map.height;
    const pW = cellW / tileSize;
    const pH = cellH / tileSize;

    ctx.fillStyle = GB_COLORS[0];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const layer of map.layers) {
      if (!layer.visible) continue;
      layer.data.forEach((row, my) =>
        row.forEach((cell, mx) => {
          if (!cell) return;
          const ts = tilesets.find((t) => t.id === cell.tilesetId);
          const tile = ts?.tiles[cell.tileIndex];
          if (!tile) return;
          tile.data.forEach((tRow, ty) =>
            tRow.forEach((color, tx) => {
              if (color === null || color === undefined) return;
              ctx.fillStyle = GB_COLORS[color];
              ctx.fillRect(
                mx * cellW + tx * pW,
                my * cellH + ty * pH,
                Math.ceil(pW),
                Math.ceil(pH)
              );
            })
          );
        })
      );
    }
  }, [template]);

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={120}
      style={{ width: "100%", height: "100%", display: "block", imageRendering: "pixelated" }}
    />
  );
};

interface TemplateCardProps {
  template: Template;
  onUse: (t: Template) => void;
  onDelete?: (id: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onUse, onDelete }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#111",
        border: `1px solid ${hovered ? "var(--accent)" : "#222"}`,
        borderRadius: "10px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.15s, transform 0.15s",
        transform: hovered ? "translateY(-2px)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "4/3",
          background: "#000",
          overflow: "hidden",
        }}
        onClick={() => onUse(template)}
      >
        <TemplatePreview template={template} />
        {hovered && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              className="btn"
              style={{ padding: "8px 18px", fontSize: "0.85rem" }}
              onClick={(e) => { e.stopPropagation(); onUse(template); }}
            >
              Use
            </button>
          </div>
        )}
        {template.isBuiltin && (
          <div
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              background: "var(--accent)",
              borderRadius: "4px",
              padding: "2px 6px",
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "#000",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Sparkles size={9} /> OFFICIAL
          </div>
        )}
      </div>

      <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#fff" }}>
            {template.name}
          </span>
          {!template.isBuiltin && onDelete && (
            <button
              className="btn btn-secondary"
              style={{ padding: "2px 6px", color: "#ff4444" }}
              onClick={(e) => { e.stopPropagation(); onDelete(template.id); }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        <p style={{ fontSize: "0.75rem", color: "#888", margin: 0, lineHeight: 1.4 }}>
          {template.description}
        </p>

        <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "0.65rem",
              padding: "2px 7px",
              borderRadius: "4px",
              background: CATEGORY_COLORS[template.category] + "22",
              color: CATEGORY_COLORS[template.category],
              border: `1px solid ${CATEGORY_COLORS[template.category]}44`,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {CATEGORY_LABELS[template.category]}
          </span>
          <span style={{ fontSize: "0.65rem", color: "#555" }}>
            {template.tilesets.length} tileset{template.tilesets.length > 1 ? "s" : ""}
          </span>
          <span style={{ fontSize: "0.65rem", color: "#555" }}>
            {template.maps.length} map{template.maps.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ isOpen, onClose }) => {
  const { importTemplate } = useStore();
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const [templates, setTemplates] = useState<Template[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) setTemplates(getAllTemplates());
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = category === "all"
    ? templates
    : templates.filter((t) => t.category === category);

  const counts: Record<string, number> = { all: templates.length };
  for (const t of templates) {
    counts[t.category] = (counts[t.category] ?? 0) + 1;
  }

  const handleUse = (template: Template) => {
    importTemplate(template);
    onClose();
  };

  const handleDelete = (id: string) => {
    deleteUserTemplate(id);
    setTemplates(getAllTemplates());
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const template = parseTemplateFile(ev.target?.result as string);
        importTemplate(template);
        onClose();
      } catch (err) {
        alert(`Import failed: ${String(err)}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ alignItems: "stretch", padding: 0 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          width: "min(1100px, 96vw)",
          height: "min(750px, 90vh)",
          margin: "auto",
          background: "#0a0a0a",
          border: "1px solid #222",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        {/* Left sidebar */}
        <div
          style={{
            width: 200,
            flexShrink: 0,
            background: "#0d0d0d",
            borderRight: "1px solid #1a1a1a",
            display: "flex",
            flexDirection: "column",
            padding: "1.25rem 0.75rem",
            gap: "0.4rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--accent)",
              fontWeight: 700,
              fontSize: "0.8rem",
              marginBottom: "0.75rem",
              paddingLeft: "0.5rem",
            }}
          >
            <Layers size={14} />
            CATEGORIES
          </div>

          {(["all", "dungeon", "overworld", "platformer", "custom"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                background: category === cat ? "#1a1a1a" : "transparent",
                border: category === cat ? "1px solid #333" : "1px solid transparent",
                borderRadius: "7px",
                padding: "8px 10px",
                textAlign: "left",
                cursor: "pointer",
                color: category === cat ? "#fff" : "#888",
                fontSize: "0.82rem",
                fontWeight: category === cat ? 600 : 400,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "all 0.1s",
              }}
            >
              <span>{CATEGORY_LABELS[cat]}</span>
              <span
                style={{
                  fontSize: "0.7rem",
                  background: "#222",
                  borderRadius: "4px",
                  padding: "1px 6px",
                  color: "#555",
                }}
              >
                {counts[cat] ?? 0}
              </span>
            </button>
          ))}

          <div style={{ flex: 1 }} />

          <input
            ref={fileInputRef}
            type="file"
            accept=".cartridge-template,.json"
            style={{ display: "none" }}
            onChange={handleImportFile}
          />
          <button
            className="btn btn-secondary"
            style={{ fontSize: "0.78rem", padding: "8px 10px", gap: "0.4rem" }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={13} />
            Import
          </button>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1.1rem 1.4rem",
              borderBottom: "1px solid #1a1a1a",
              flexShrink: 0,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
                Templates
              </h2>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#666", marginTop: 2 }}>
                Choose a template to add it to your project
              </p>
            </div>
            <button
              className="btn btn-secondary"
              style={{ padding: "6px 10px" }}
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>

          {/* Grid */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1.25rem 1.4rem",
            }}
          >
            {filtered.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#444",
                  gap: "0.75rem",
                }}
              >
                <Download size={32} />
                <span style={{ fontSize: "0.9rem" }}>
                  No templates in this category
                </span>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: "0.78rem" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={13} /> Import template
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "1rem",
                }}
              >
                {filtered.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    onUse={handleUse}
                    onDelete={!t.isBuiltin ? handleDelete : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
