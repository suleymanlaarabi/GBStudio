import { BUILTIN_TEMPLATES } from "../data/templates";
import type { Template, TemplateCategory, TemplateFile } from "../types/template";
import type { TileMap, Tileset, SpriteAsset, SoundAsset } from "../types";

const STORAGE_KEY = "cartridge.templates.v1";

export const getUserTemplates = (): Template[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Template[];
  } catch {
    return [];
  }
};

export const getAllTemplates = (): Template[] => [
  ...BUILTIN_TEMPLATES,
  ...getUserTemplates(),
];

export const saveUserTemplate = (template: Template): void => {
  const existing = getUserTemplates();
  const idx = existing.findIndex((t) => t.id === template.id);
  if (idx >= 0) {
    existing[idx] = template;
  } else {
    existing.push(template);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

export const deleteUserTemplate = (id: string): void => {
  const existing = getUserTemplates().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

export const exportTemplateAsFile = (template: Template): void => {
  const file: TemplateFile = {
    format: "cartridge-template",
    version: 1,
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
