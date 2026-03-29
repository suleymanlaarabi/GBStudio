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
