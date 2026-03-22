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
