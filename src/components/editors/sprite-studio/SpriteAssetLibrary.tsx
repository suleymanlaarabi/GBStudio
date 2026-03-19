import React from "react";
import { Database } from "lucide-react";
import { GB_COLORS } from "../../../constants/colors";
import type { Tileset, Tile } from "../../../types";
import { CustomSelect } from "../../ui/CustomSelect";

interface SpriteAssetLibraryProps {
  tilesets: Tileset[];
  activeTilesetIndex: number;
  tiles: Tile[];
  activeTileIndex: number;
  onSelectTileset: (index: number) => void;
  onSelectTile: (index: number) => void;
}

const TileThumbnail: React.FC<{
  tile: Tile;
  isActive: boolean;
  onClick: () => void;
}> = ({ tile, isActive, onClick }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
