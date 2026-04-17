import type { GBColor } from "../../types";
import type { Template } from "../../types/template";

const TS = "builtin-overworld-ts";

const d = (rows: (GBColor | null)[][]): (GBColor | null)[][] => rows;

const TILES = {
  grass: { id: "bo-t0", size: 8 as const, data: d([
    [1, 1, 2, 1, 1, 1, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [2, 1, 1, 1, 1, 2, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 1, 1, 2, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 2, 1, 1, 1, 1, 2],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ]) },
  water: { id: "bo-t1", size: 8 as const, data: d([
    [0, 0, 1, 1, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ]) },
  tree: { id: "bo-t2", size: 8 as const, data: d([
    [null, null, 3, 3, 3, null, null, null],
    [null, 3, 3, 3, 3, 3, null, null],
    [3, 3, 3, 3, 3, 3, 3, null],
    [3, 3, 3, 2, 3, 3, 3, null],
    [null, 3, 3, 3, 3, 3, null, null],
    [null, null, 3, 3, 3, null, null, null],
    [null, null, null, 3, null, null, null, null],
    [null, null, null, 3, null, null, null, null],
  ]) },
  path: { id: "bo-t3", size: 8 as const, data: d([
    [2, 2, 1, 2, 2, 2, 1, 2],
    [2, 1, 2, 2, 2, 1, 2, 2],
    [1, 2, 2, 2, 1, 2, 2, 2],
    [2, 2, 1, 2, 2, 2, 2, 1],
    [2, 1, 2, 2, 2, 2, 1, 2],
    [1, 2, 2, 2, 1, 2, 2, 2],
    [2, 2, 2, 1, 2, 2, 2, 1],
    [2, 1, 2, 2, 2, 1, 2, 2],
  ]) },
  mountain: { id: "bo-t4", size: 8 as const, data: d([
    [0, 0, 0, 0, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 3, 0, 0],
    [0, 0, 3, 0, 3, 3, 3, 0],
    [0, 3, 2, 3, 3, 3, 3, 3],
    [3, 2, 2, 2, 3, 3, 3, 3],
    [3, 2, 2, 2, 2, 3, 3, 3],
    [3, 3, 2, 2, 2, 2, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
  ]) },
  town: { id: "bo-t5", size: 8 as const, data: d([
    [null, null, 3, 3, 3, 3, null, null],
    [null, 3, 3, 3, 3, 3, 3, null],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 2, 2, 3, 3, 3],
    [3, 3, 2, 2, 2, 2, 3, 3],
    [3, 2, 0, 2, 2, 0, 2, 3],
    [3, 2, 0, 2, 2, 0, 2, 3],
    [3, 3, 2, 2, 2, 2, 3, 3],
  ]) },
  ship1: { id: "bo-c0", size: 8 as const, data: d([
    [null, null, 1, 1, null, null, null, null],
    [null, 1, 1, 1, 1, null, null, null],
    [1, 1, 1, 1, 1, 1, null, null],
    [null, 3, 3, 3, 3, 3, 3, null],
    [3, 2, 2, 2, 2, 2, 2, 3],
    [3, 2, 2, 2, 2, 2, 2, 3],
    [null, 3, 3, 3, 3, 3, 3, null],
    [null, null, null, null, null, null, null, null],
  ]) },
  ship2: { id: "bo-c1", size: 8 as const, data: d([
    [null, null, 1, 1, null, null, null, null],
    [null, 1, 1, 1, 1, null, null, null],
    [1, 1, 1, 1, 1, 1, null, null],
    [null, 3, 3, 3, 3, 3, 3, null],
    [3, 2, 2, 2, 2, 2, 2, 3],
    [3, 2, 2, 2, 2, 2, 2, 3],
    [null, 3, 3, 3, 3, 3, 3, null],
    [null, null, 0, 0, 0, 0, null, null],
  ]) },
};

const G = { tilesetId: TS, tileIndex: 0 };
const W = { tilesetId: TS, tileIndex: 1 };
const Tr = { tilesetId: TS, tileIndex: 2 };
const P = { tilesetId: TS, tileIndex: 3 };
const M = { tilesetId: TS, tileIndex: 4 };
const H = { tilesetId: TS, tileIndex: 5 };
const n = null;

const CTS = "builtin-overworld-chars";

export const OVERWORLD_TEMPLATE: Template = {
  id: "builtin-overworld",
  name: "Overworld",
  description: "Classic world map with terrain, towns, and a navigable ship.",
  category: "overworld",
  isBuiltin: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  tilesets: [
    {
      id: TS,
      name: "World Terrain",
      tileSize: 8,
      tiles: [TILES.grass, TILES.water, TILES.tree, TILES.path, TILES.mountain, TILES.town],
      layout: {
        columns: 3,
        positions: {
          "bo-t0": { x: 0, y: 0 },
          "bo-t1": { x: 1, y: 0 },
          "bo-t2": { x: 2, y: 0 },
          "bo-t3": { x: 0, y: 1 },
          "bo-t4": { x: 1, y: 1 },
          "bo-t5": { x: 2, y: 1 },
        },
      },
    },
    {
      id: CTS,
      name: "Vehicles",
      tileSize: 8,
      tiles: [TILES.ship1, TILES.ship2],
      layout: {
        columns: 2,
        positions: {
          "bo-c0": { x: 0, y: 0 },
          "bo-c1": { x: 1, y: 0 },
        },
      },
    },
  ],
  maps: [{
    id: "builtin-overworld-map",
    name: "World Map",
    width: 14,
    height: 10,
    tileSize: 8,
    layers: [
      {
        id: "builtin-overworld-layer1",
        name: "Terrain",
        visible: true,
        data: [
          [M, M, M, G, G, G, G, G, G, G, G, G, G, G],
          [M, M, G, G, G, G, G, G, G, G, W, W, G, G],
          [M, G, G, G, G, G, P, G, G, W, W, W, G, G],
          [G, G, G, G, G, P, P, P, G, W, W, G, G, G],
          [G, G, G, G, P, P, G, P, P, G, G, G, G, G],
          [G, G, G, P, P, G, G, G, P, P, G, G, G, G],
          [G, G, P, P, G, G, G, G, G, P, P, G, G, G],
          [G, G, P, G, G, G, G, G, G, G, P, P, G, G],
          [G, G, G, G, G, G, G, G, G, G, G, P, P, G],
          [G, G, G, G, G, G, G, G, G, G, G, G, P, G],
        ],
      },
      {
        id: "builtin-overworld-layer2",
        name: "Scenery",
        visible: true,
        data: [
          [n, n, n, Tr, n, n, n, n, n, n, n, n, n, n],
          [n, n, Tr, n, n, n, n, n, n, n, n, n, n, n],
          [n, Tr, n, n, n, n, n, n, n, n, n, n, n, n],
          [Tr, n, n, n, n, n, n, n, n, n, n, n, n, n],
          [n, n, n, n, n, n, n, n, n, n, n, n, n, n],
          [n, n, n, n, n, n, H, n, n, n, n, n, n, n],
          [n, n, n, n, n, Tr, n, Tr, n, n, n, n, n, n],
          [n, n, n, n, Tr, n, n, n, Tr, n, n, n, n, n],
          [n, n, n, n, n, n, n, n, n, n, n, n, n, n],
          [n, n, n, n, n, n, n, n, n, n, n, n, n, n],
        ],
      },
    ],
  }],
  sprites: [
    {
      id: "ship-sprite",
      name: "Ship",
      animations: [
        {
          id: "ship-sailing",
          name: "Sailing",
          loop: true,
          frames: [
            { tilesetId: CTS, tileIndex: 0, duration: 300 },
            { tilesetId: CTS, tileIndex: 1, duration: 300 },
          ],
        },
      ],
    },
  ],
};

