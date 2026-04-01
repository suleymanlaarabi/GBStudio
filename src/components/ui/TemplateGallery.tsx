import React, { useEffect, useRef, useState } from "react";
import { Download, Upload, X, Layers, Sparkles } from "lucide-react";
import { Modal } from "./Modal";
import { GB_COLORS } from "../../constants/colors";
import { getAllTemplates, deleteUserTemplate, parseTemplateFile } from "../../services/templateService";
import { CHUNK_SIZE } from "../../types/map";
import { useStore } from "../../store";
import type { Template, TemplateCategory } from "../../types/template";
import type { Tileset } from "../../types";
    importTemplate(template);
        importTemplate(template);

const CATEGORY_LABELS: Record<TemplateCategory | "all", string> = {
  all: "All",
  dungeon: "Dungeon",
  overworld: "Overworld",
  platformer: "Platformer",
  shooter: "Shooter",
  assets: "Assets",
  sounds: "Sounds",
  custom: "Custom",
};

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  dungeon: "#8b5cf6",
  overworld: "#22c55e",
  platformer: "#f59e0b",
  shooter: "#ef4444",
  assets: "#ec4899",
  sounds: "#06b6d4",
  custom: "#64748b",
};

const drawTileToCanvas = (
  ctx: CanvasRenderingContext2D,
  tileData: (number | null)[][],
  originX: number,
  originY: number,
  pixelWidth: number,
  pixelHeight: number,
) => {
  tileData.forEach((row, y) =>
    row.forEach((color, x) => {
      if (color === null || color === undefined) return;
      ctx.fillStyle = GB_COLORS[color];
      ctx.fillRect(
        originX + x * pixelWidth,
        originY + y * pixelHeight,
        Math.ceil(pixelWidth),
        Math.ceil(pixelHeight),
      );
    }),
  );
};

const TemplatePreview: React.FC<{ template: Template }> = ({ template }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = GB_COLORS[0];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const map = template.maps[0];
    if (!map) {
      const spriteFrames = template.sprites
        .flatMap((sprite) => sprite.animations.flatMap((animation) => animation.frames))
        .slice(0, 6);

      if (spriteFrames.length > 0) {
        const columns = Math.min(3, spriteFrames.length);
        const rows = Math.ceil(spriteFrames.length / columns);
        const padding = 10;
        const slotWidth = (canvas.width - padding * 2) / columns;
        const slotHeight = (canvas.height - padding * 2) / rows;

        spriteFrames.forEach((frame, index) => {
          const tileset = template.tilesets.find((candidate) => candidate.id === frame.tilesetId);
          const tile = tileset?.tiles[frame.tileIndex];
          if (!tile) return;

          const column = index % columns;
          const row = Math.floor(index / columns);
          const tileSize = tile.size || tileset?.tileSize || 8;
          const scale = Math.max(
            1,
            Math.floor(Math.min(slotWidth / tileSize, slotHeight / tileSize)),
          );
          const drawWidth = tileSize * scale;
          const drawHeight = tileSize * scale;
          const originX = padding + column * slotWidth + (slotWidth - drawWidth) / 2;
          const originY = padding + row * slotHeight + (slotHeight - drawHeight) / 2;

          ctx.fillStyle = "#111";
          ctx.fillRect(
            padding + column * slotWidth + 2,
            padding + row * slotHeight + 2,
            slotWidth - 4,
            slotHeight - 4,
          );

          drawTileToCanvas(
            ctx,
            tile.data,
            originX,
            originY,
            scale,
            scale,
          );
        });

        return;
      }

      if ((template.sounds?.length ?? 0) > 0) {
        // Sound-only template: draw waveform bars
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const bars = 16;
        const barW = (canvas.width - 20) / bars;
        const amplitudes = [4,7,10,13,15,12,9,6,8,11,14,15,12,8,5,3];
        ctx.fillStyle = "#44cc88";
        amplitudes.forEach((amp, i) => {
          const h = (amp / 15) * (canvas.height - 20);
          ctx.fillRect(10 + i * barW, (canvas.height - h) / 2, barW - 2, h);
        });
        return;
      }
      ctx.fillStyle = "#333";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("No preview", canvas.width / 2, canvas.height / 2);
      return;
    }

    const tilesets: Tileset[] = template.tilesets;
    const tileSize = map.tileSize || 8;
    const cellW = canvas.width / map.width;
    const cellH = canvas.height / map.height;
    const pW = cellW / tileSize;
    const pH = cellH / tileSize;

    for (const layer of map.layers) {
      if (!layer.visible) continue;
      Object.values(layer.chunks).forEach((chunk) => {
        chunk.data.forEach((row, localY) => {
          row.forEach((cell, localX) => {
            if (!cell) return;
            const globalX = chunk.x * CHUNK_SIZE + localX;
            const globalY = chunk.y * CHUNK_SIZE + localY;

            // Only render if within initial viewport bounds for preview
            if (globalX >= map.width || globalY >= map.height || globalX < 0 || globalY < 0) return;

            const ts = tilesets.find((t) => t.id === cell.tilesetId);
            const tile = ts?.tiles[cell.tileIndex];
            if (!tile) return;
            drawTileToCanvas(
              ctx,
              tile.data,
              globalX * cellW,
              globalY * cellH,
              pW,
              pH,
            );
          });
        });
      });
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
          {template.tilesets.length > 0 && (
            <span style={{ fontSize: "0.65rem", color: "#555" }}>
              {template.tilesets.length} tileset{template.tilesets.length > 1 ? "s" : ""}
            </span>
          )}
          {template.maps.length > 0 && (
            <span style={{ fontSize: "0.65rem", color: "#555" }}>
              {template.maps.length} map{template.maps.length > 1 ? "s" : ""}
            </span>
          )}
          {(template.sounds?.length ?? 0) > 0 && (
            <span style={{ fontSize: "0.65rem", color: "#555" }}>
              {template.sounds!.length} sound{template.sounds!.length > 1 ? "s" : ""}
            </span>
          )}
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
  const [templates, setTemplates] = useState(getAllTemplates());
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
        onClose();
      } catch (err) {
        setErrorMessage(`Import failed: ${String(err)}`);
        setErrorModalOpen(true);
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
