import React, { useEffect, useRef, useState } from "react";
import { Edit3, Map as MapIcon, Plus, Trash2, Package } from "lucide-react";
import { GB_COLORS } from "../../constants/colors";
import { useStore } from "../../store";
import type { TileMap, Tileset, TileSize } from "../../types";
import { CHUNK_SIZE } from "../../types/map";
import { Modal } from "../ui/Modal";
import { ExportTemplateModal } from "../ui/ExportTemplateModal";

const validatePositiveNumber = (max: number) => (val: any) => {
  const num = parseInt(val, 10);
  if (isNaN(num) || num <= 0) return "Must be a positive number";
  if (num > max) return `Must be ${max} or less`;
  return null;
};

const MapPreview: React.FC<{ map: TileMap; tilesets: Tileset[] }> = ({
  map,
  tilesets,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tileSize = map.tileSize || 8;
    const cellW = canvas.width / map.width;
    const cellH = canvas.height / map.height;
    const pW = cellW / tileSize;
    const pH = cellH / tileSize;

    ctx.fillStyle = GB_COLORS[0];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
            tile.data.forEach((tRow, ty) =>
              tRow.forEach((color, tx) => {
                if (color === null || color === undefined) return;
                ctx.fillStyle = GB_COLORS[color];
                ctx.fillRect(
                  globalX * cellW + tx * pW,
                  globalY * cellH + ty * pH,
                  pW,
                  pH
                );
              })
            );
          });
        });
      });
    }
  }, [map, tilesets]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={180}
      style={{ width: "100%", height: "100%", background: "#000" }}
    />
  );
};

export const MapGallery: React.FC = () => {
  const { maps, tilesets, sprites, setActiveMap, addMap, removeMap } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportTemplateOpen, setIsExportTemplateOpen] = useState(false);

  return (
    <>
      <div className="card">
        <div className="section-title" style={{ marginBottom: "2rem" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <MapIcon size={24} color="var(--accent)" />
            Map Collection
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setIsExportTemplateOpen(true)}
              disabled={maps.length === 0}
              title="Exporter des maps comme template"
            >
              <Package size={16} /> Export Template
            </button>
            <button className="btn" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> New Map
            </button>
          </div>
        </div>

        <div className="map-gallery-grid">
          {maps.map((map, index) => (
            <div
              key={map.id}
              className="map-card"
              onClick={() => setActiveMap(index)}
            >
              <div className="map-preview">
                <MapPreview map={map} tilesets={tilesets} />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "1rem" }}>
                    {map.name}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>
                    {map.width}x{map.height} • {map.tileSize}x{map.tileSize} mode
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: "6px" }}
                    onClick={() => setActiveMap(index)}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: "6px", color: "#ff4444" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMap(index);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ExportTemplateModal
        isOpen={isExportTemplateOpen}
        onClose={() => setIsExportTemplateOpen(false)}
        maps={maps}
        tilesets={tilesets}
        sprites={sprites}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="multi"
        title="Create New Map"
        onConfirm={(values: Record<string, string>) => {
          addMap(
            values.name,
            parseInt(values.width, 10),
            parseInt(values.height, 10),
            parseInt(values.tileSize, 10) as TileSize
          );
          setIsModalOpen(false);
        }}
        fields={[
          {
            name: "name",
            label: "Map Name",
            type: "text",
            defaultValue: `Map ${maps.length + 1}`,
            required: true,
          },
          {
            name: "tileSize",
            label: "Tile Size",
            type: "select",
            defaultValue: "8",
            options: [
              { label: "8x8 pixels", value: "8" },
              { label: "16x16 pixels", value: "16" },
            ],
          },
          {
            name: "width",
            label: "Width (tiles)",
            type: "number",
            defaultValue: 20,
            required: true,
            validate: validatePositiveNumber(100),
          },
          {
            name: "height",
            label: "Height (tiles)",
            type: "number",
            defaultValue: 18,
            required: true,
            validate: validatePositiveNumber(100),
          },
        ]}
      />
    </>
  );
};
