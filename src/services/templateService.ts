import { BUILTIN_TEMPLATES } from "../data/templates";
import type { Template, TemplateCategory, TemplateFile } from "../types/template";
import type { TileMap, Tileset, SpriteAsset } from "../types";

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
    author: template.author,
    createdAt: template.createdAt,
    tilesets: template.tilesets,
    maps: template.maps,
    sprites: template.sprites,
  };
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${template.name.replace(/\s+/g, "_").toLowerCase()}.cartridge-template`;
  a.click();
  URL.revokeObjectURL(url);
};

export const parseTemplateFile = (raw: string): Template => {
  const parsed = JSON.parse(raw) as Partial<TemplateFile>;
  if (parsed.format !== "cartridge-template" || parsed.version !== 1) {
    throw new Error("Invalid template format");
  }
  if (!parsed.name || !Array.isArray(parsed.tilesets) || !Array.isArray(parsed.maps) || !Array.isArray(parsed.sprites)) {
    throw new Error("Missing template data");
  }
  return {
    id: parsed.id ?? crypto.randomUUID(),
    name: parsed.name,
    description: parsed.description ?? "",
    category: (parsed.category as TemplateCategory) ?? "custom",
    author: parsed.author,
    createdAt: parsed.createdAt ?? new Date().toISOString(),
    tilesets: parsed.tilesets as Tileset[],
    maps: parsed.maps as TileMap[],
    sprites: parsed.sprites as SpriteAsset[],
    isBuiltin: false,
  };
};

export const buildTemplateFromSelection = (
  name: string,
  description: string,
  category: TemplateCategory,
  selectedMapIds: string[],
  selectedSpriteIds: string[],
  allMaps: TileMap[],
  allTilesets: Tileset[],
  allSprites: SpriteAsset[],
): Template => {
  const maps = allMaps.filter((m) => selectedMapIds.includes(m.id));

  const usedTilesetIds = new Set<string>();
  maps.forEach((map) =>
    map.layers.forEach((layer) =>
      layer.data.forEach((row) =>
        row.forEach((cell) => {
          if (cell) usedTilesetIds.add(cell.tilesetId);
        })
      )
    )
  );

  const sprites = allSprites.filter((s) => selectedSpriteIds.includes(s.id));
  sprites.forEach((sprite) =>
    sprite.animations.forEach((anim) =>
      anim.frames.forEach((frame) => usedTilesetIds.add(frame.tilesetId))
    )
  );

  const tilesets = allTilesets.filter((ts) => usedTilesetIds.has(ts.id));

  return {
    id: crypto.randomUUID(),
    name,
    description,
    category,
    createdAt: new Date().toISOString(),
    tilesets,
    maps,
    sprites,
    isBuiltin: false,
  };
};
