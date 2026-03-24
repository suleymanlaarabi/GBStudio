import React, { useState } from "react";
import { X, Download, Package } from "lucide-react";
import {
import type { TileMap, Tileset, SpriteAsset, SoundAsset } from "../../types";
import type { TemplateCategory } from "../../types/template";
  buildTemplateFromSelection,
  exportTemplateAsFile,
  saveUserTemplate,
} from "../../services/templateService";

interface ExportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  maps: TileMap[];
  tilesets: Tileset[];
  sprites: SpriteAsset[];
  sounds?: SoundAsset[];
}

export const ExportTemplateModal: React.FC<ExportTemplateModalProps> = ({
  isOpen,
  onClose,
  maps,
  tilesets,
  sprites,
  sounds = [],
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("custom");
  const [selectedMapIds, setSelectedMapIds] = useState<Set<string>>(new Set());
  const [selectedSpriteIds, setSelectedSpriteIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleMap = (id: string) => {
    setSelectedMapIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSprite = (id: string) => {
    setSelectedSpriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
