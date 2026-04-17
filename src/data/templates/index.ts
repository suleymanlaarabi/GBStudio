import { DUNGEON_TEMPLATE } from "./dungeon";
import { OVERWORLD_TEMPLATE } from "./overworld";
import { PLATFORMER_TEMPLATE } from "./platformer";
import { SPACE_TEMPLATE } from "./space";
import { VILLAGE_TEMPLATE } from "./village";
import type { Template } from "../../types/template";

export const BUILTIN_TEMPLATES: Template[] = [
  DUNGEON_TEMPLATE,
  OVERWORLD_TEMPLATE,
  PLATFORMER_TEMPLATE,
  SPACE_TEMPLATE,
  VILLAGE_TEMPLATE,
];
