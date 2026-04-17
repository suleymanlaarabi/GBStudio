import { DUNGEON_TEMPLATE } from "./dungeon";
import { OVERWORLD_TEMPLATE } from "./overworld";
import { PLATFORMER_TEMPLATE } from "./platformer";
import { PLATFORMER_PRO_TEMPLATE } from "./platformer-pro";
import { SPRITE_PACK_TEMPLATE } from "./sprite-pack";
import { SPACE_TEMPLATE } from "./space";
import { VILLAGE_TEMPLATE } from "./village";
import { SOUNDS_TEMPLATE } from "./sounds";
import type { Template } from "../../types/template";
import { SUPER_MARIO_LAND_TEMPLATE } from "./mario";

export const BUILTIN_TEMPLATES: Template[] = [
  DUNGEON_TEMPLATE,
  VILLAGE_TEMPLATE,
  PLATFORMER_TEMPLATE,
  PLATFORMER_PRO_TEMPLATE,
  SUPER_MARIO_LAND_TEMPLATE,
  SOUNDS_TEMPLATE,
  SPACE_TEMPLATE,
  SPRITE_PACK_TEMPLATE,
  OVERWORLD_TEMPLATE,
];
