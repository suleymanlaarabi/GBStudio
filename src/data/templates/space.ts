import type { GBColor } from "../../types";
import type { Template } from "../../types/template";
import { migrateFlatDataToChunks } from "../../services/mapService";

const TS = "builtin-space-ts";
const CTS = "builtin-space-chars";

const d = (rows: (GBColor | null)[][]): (GBColor | null)[][] => rows;

const TILES = {
  star1: {
    id: "bs-t0",
    size: 8 as const,
    data: d([
      [null, null, null, null, null, null, null, null],
      [null, null, null, 1, null, null, null, null],
      [null, null, 1, 2, 1, null, null, null],
      [null, 1, 2, 3, 2, 1, null, null],
      [null, null, 1, 2, 1, null, null, null],
      [null, null, null, 1, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ]),
  },
  star2: {
    id: "bs-t1",
    size: 8 as const,
    data: d([
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, 1, null, null, null, null],
      [null, null, 1, 2, 1, null, null, null],
      [null, null, null, 1, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ]),
  },
  nebula: {
    id: "bs-t2",
    size: 8 as const,
    data: d([
      [0, 0, 1, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 0, 0, 0],
      [1, 1, 2, 2, 1, 1, 0, 0],
      [1, 2, 2, 2, 2, 1, 0, 0],
      [0, 1, 2, 2, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ]),
  },
  ship_player: {
    id: "bs-c0",
    size: 8 as const,
    data: d([
      [null, null, null, 3, null, null, null, null],
      [null, null, 3, 2, 3, null, null, null],
      [null, null, 3, 2, 3, null, null, null],
      [null, 3, 2, 1, 2, 3, null, null],
      [null, 3, 1, 1, 1, 3, null, null],
      [3, 2, 1, 1, 1, 2, 3, null],
      [3, 3, 3, 3, 3, 3, 3, null],
      [null, 3, 2, null, 2, 3, null, null],
    ]),
  },
  ship_enemy1: {
    id: "bs-c1",
    size: 8 as const,
    data: d([
      [null, 3, 2, null, 2, 3, null, null],
      [3, 2, 1, 1, 1, 2, 3, null],
      [null, 3, 1, 1, 1, 3, null, null],
      [null, 3, 2, 1, 2, 3, null, null],
      [null, null, 3, 2, 3, null, null, null],
      [null, null, 3, 2, 3, null, null, null],
      [null, null, null, 3, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ]),
  },
  explosion1: {
    id: "bs-c2",
    size: 8 as const,
    data: d([
      [null, null, null, 1, null, null, null, null],
      [null, 1, null, 2, null, 1, null, null],
      [null, null, 2, 3, 2, null, null, null],
      [1, 2, 3, 0, 3, 2, 1, null],
      [null, null, 2, 3, 2, null, null, null],
      [null, 1, null, 2, null, 1, null, null],
      [null, null, null, 1, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ]),
  },
  explosion2: {
    id: "bs-c3",
    size: 8 as const,
    data: d([
      [1, null, 1, null, 1, null, 1, null],
      [null, 2, null, 2, null, 2, null, null],
      [1, null, null, null, null, null, 1, null],
      [null, 2, null, null, null, 2, null, null],
      [1, null, null, null, null, null, 1, null],
      [null, 2, null, 2, null, 2, null, null],
      [1, null, 1, null, 1, null, 1, null],
      [null, null, null, null, null, null, null, null],
    ]),
  },
};

const S1 = { tilesetId: TS, tileIndex: 0 };
const S2 = { tilesetId: TS, tileIndex: 1 };
const n = null;

export const SPACE_TEMPLATE: Template = {
  id: "builtin-space",
  name: "Space Shooter",
  description:
    "Futuristic space setting with starfields, nebulae, and animated spaceships.",
  category: "shooter",
  isBuiltin: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  tilesets: [
    {
      id: TS,
      name: "Space Background",
      tileSize: 8,
      tiles: [TILES.star1, TILES.star2, TILES.nebula],
      layout: {
        columns: 3,
        positions: {
          "bs-t0": { x: 0, y: 0 },
          "bs-t1": { x: 1, y: 0 },
          "bs-t2": { x: 2, y: 0 },
        },
      },
    },
    {
      id: CTS,
      name: "Spacecraft",
      tileSize: 8,
      tiles: [
        TILES.ship_player,
        TILES.ship_enemy1,
        TILES.explosion1,
        TILES.explosion2,
      ],
      layout: {
        columns: 2,
        positions: {
          "bs-c0": { x: 0, y: 0 },
          "bs-c1": { x: 1, y: 0 },
          "bs-c2": { x: 0, y: 1 },
          "bs-c3": { x: 1, y: 1 },
        },
      },
    },
  ],
  maps: [
