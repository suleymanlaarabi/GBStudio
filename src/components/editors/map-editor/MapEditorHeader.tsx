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
