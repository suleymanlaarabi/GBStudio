import type { GBColor } from "../../types";
import type { Template } from "../../types/template";
import { migrateFlatDataToChunks } from "../../services/mapService";

const TS = "builtin-village-ts";
const CTS = "builtin-village-chars";

const d = (rows: (GBColor | null)[][]): (GBColor | null)[][] => rows;

const TILES = {
  grass: {
    id: "bv-t0",
    size: 8 as const,
    data: d([
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 2, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 2, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 1, 1, 1, 1, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 2, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ]),
  },
  path: {
    id: "bv-t1",
    size: 8 as const,
    data: d([
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 1, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 1, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 2, 2, 2, 2, 1, 2],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 1, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2],
    ]),
  },
  fence: {
    id: "bv-t2",
    size: 8 as const,
    data: d([
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [3, 3, 3, 3, 3, 3, 3, 3],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [3, 3, 3, 3, 3, 3, 3, 3],
      [3, 2, 3, 3, 3, 3, 2, 3],
      [3, 2, 3, 3, 3, 3, 2, 3],
      [3, 2, 3, 3, 3, 3, 2, 3],
    ]),
  },
  flower: {
    id: "bv-t3",
    size: 8 as const,
    data: d([
      [null, null, null, null, null, null, null, null],
      [null, null, 1, 1, null, null, null, null],
      [null, 1, 0, 0, 1, null, null, null],
      [null, 1, 0, 0, 1, null, null, null],
      [null, null, 1, 1, null, null, null, null],
      [null, null, 3, null, null, null, null, null],
      [null, 3, 3, 3, null, null, null, null],
      [null, null, 3, null, null, null, null, null],
    ]),
  },
  wall: {
    id: "bv-t4",
    size: 8 as const,
    data: d([
      [3, 2, 2, 2, 2, 2, 2, 3],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [3, 3, 3, 3, 3, 3, 3, 3],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [3, 3, 3, 3, 3, 3, 3, 3],
    ]),
  },
  roof: {
    id: "bv-t5",
    size: 8 as const,
    data: d([
      [null, null, null, 3, 3, null, null, null],
      [null, null, 3, 2, 2, 3, null, null],
      [null, 3, 2, 2, 2, 2, 3, null],
      [3, 2, 2, 2, 2, 2, 2, 3],
      [3, 3, 3, 3, 3, 3, 3, 3],
      [3, 2, 2, 2, 2, 2, 2, 3],
      [3, 2, 2, 2, 2, 2, 2, 3],
      [3, 3, 3, 3, 3, 3, 3, 3],
    ]),
  },
  window: {
    id: "bv-t6",
    size: 8 as const,
    data: d([
      [3, 3, 3, 3, 3, 3, 3, 3],
      [3, 1, 1, 3, 1, 1, 3, 3],
      [3, 1, 0, 3, 0, 1, 3, 3],
      [3, 3, 3, 3, 3, 3, 3, 3],
      [3, 1, 0, 3, 0, 1, 3, 3],
      [3, 1, 1, 3, 1, 1, 3, 3],
      [3, 3, 3, 3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3, 3, 3, 3],
    ]),
  },
  door: {
    id: "bv-t7",
    size: 8 as const,
    data: d([
      [3, 3, 3, 3, 3, 3, 3, 3],
      [3, 2, 2, 2, 2, 2, 2, 3],
      [3, 2, 1, 1, 1, 1, 2, 3],
      [3, 2, 1, 1, 1, 1, 2, 3],
      [3, 2, 1, 0, 1, 1, 2, 3],
      [3, 2, 1, 1, 1, 1, 2, 3],
      [3, 2, 1, 1, 1, 1, 2, 3],
      [3, 2, 2, 2, 2, 2, 2, 3],
    ]),
  },
  villager1: {
    id: "bv-c0",
    size: 8 as const,
    data: d([
      [null, null, 3, 3, 3, 3, null, null],
      [null, 3, 2, 2, 2, 2, 3, null],
      [3, 2, 3, 2, 2, 3, 2, 3],
      [3, 2, 2, 2, 2, 2, 2, 3],
      [null, 3, 1, 1, 1, 1, 3, null],
      [null, 3, 1, 1, 1, 1, 3, null],
      [null, 3, 2, 2, 2, 2, 3, null],
      [null, 3, null, 3, 3, null, 3, null],
    ]),
  },
  villager2: {
    id: "bv-c1",
    size: 8 as const,
    data: d([
      [null, null, 3, 3, 3, 3, null, null],
      [null, 3, 2, 2, 2, 2, 3, null],
      [3, 2, 3, 2, 2, 3, 2, 3],
      [3, 2, 2, 2, 2, 2, 2, 3],
      [null, 3, 1, 1, 1, 1, 3, null],
      [null, 3, 1, 1, 1, 1, 3, null],
      [null, 3, 2, 2, 2, 2, 3, null],
      [null, null, 3, 3, null, 3, 3, null],
    ]),
  },
};

const G = { tilesetId: TS, tileIndex: 0 };
const P = { tilesetId: TS, tileIndex: 1 };
const Fn = { tilesetId: TS, tileIndex: 2 };
const Fl = { tilesetId: TS, tileIndex: 3 };
const R = { tilesetId: TS, tileIndex: 5 };
const Wi = { tilesetId: TS, tileIndex: 6 };
const D = { tilesetId: TS, tileIndex: 7 };
const n = null;

export const VILLAGE_TEMPLATE: Template = {
  id: "builtin-village",
  name: "RPG Village",
  description:
    "Cozy village with houses, paths, and NPCs. Perfect for starting an RPG.",
  category: "overworld",
  isBuiltin: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  tilesets: [
    {
      id: TS,
      name: "Village Assets",
      tileSize: 8,
      tiles: [
        TILES.grass,
        TILES.path,
        TILES.fence,
        TILES.flower,
        TILES.wall,
        TILES.roof,
        TILES.window,
        TILES.door,
      ],
      layout: {
        columns: 4,
        positions: {
          "bv-t0": { x: 0, y: 0 },
          "bv-t1": { x: 1, y: 0 },
          "bv-t2": { x: 2, y: 0 },
          "bv-t3": { x: 3, y: 0 },
          "bv-t4": { x: 0, y: 1 },
          "bv-t5": { x: 1, y: 1 },
          "bv-t6": { x: 2, y: 1 },
          "bv-t7": { x: 3, y: 1 },
        },
      },
    },
    {
      id: CTS,
      name: "Villagers",
      tileSize: 8,
      tiles: [TILES.villager1, TILES.villager2],
      layout: {
        columns: 2,
        positions: {
          "bv-c0": { x: 0, y: 0 },
          "bv-c1": { x: 1, y: 0 },
        },
      },
    },
  ],
  maps: [
    {
      id: "builtin-village-map",
      name: "Quiet Town",
      width: 20,
      height: 15,
      tileSize: 8,
      layers: [
        {
          id: "bv-layer1",
          name: "Ground",
          visible: true,
          chunks: migrateFlatDataToChunks(
            Array(15)
              .fill(null)
              .map((_, y) =>
                Array(20)
                  .fill(null)
                  .map((_, x) => {
                    if (y > 6 && y < 10) return P;
                    if (x > 8 && x < 12) return P;
                    return G;
                  }),
              ),
          ),
        },
        {
          id: "bv-layer2",
          name: "Buildings & Props",
          visible: true,
          chunks: migrateFlatDataToChunks(
            Array(15)
              .fill(null)
              .map((_, y) =>
                Array(20)
                  .fill(null)
                  .map((_, x) => {
                    // House 1
                    if (y === 2 && x >= 3 && x <= 5) return R;
                    if (y === 3 && x === 3) return Wi;
                    if (y === 3 && x === 4) return D;
                    if (y === 3 && x === 5) return Wi;

                    // House 2
                    if (y === 2 && x >= 14 && x <= 16) return R;
                    if (y === 3 && x === 14) return Wi;
                    if (y === 3 && x === 15) return D;
                    if (y === 3 && x === 16) return Wi;

                    // Fences
                    if (y === 12 && x >= 2 && x <= 17) return Fn;

                    // Flowers
                    if (y === 5 && x === 2) return Fl;
                    if (y === 11 && x === 18) return Fl;
                    if (y === 1 && x === 10) return Fl;

                    return n;
                  }),
              ),
          ),
        },
      ],
    },
  ],
  sprites: [
    {
      id: "villager-sprite",
      name: "Villager",
      animations: [
        {
          id: "villager-walk",
          name: "Idle/Walk",
          loop: true,
          frames: [
            { tilesetId: CTS, tileIndex: 0, duration: 400 },
            { tilesetId: CTS, tileIndex: 1, duration: 400 },
          ],
        },
      ],
    },
  ],
};
