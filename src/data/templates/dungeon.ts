import type { GBColor } from "../../types";
import type { Template } from "../../types/template";

const TS = "builtin-dungeon-ts";

const d = (rows: (GBColor | null)[][]): (GBColor | null)[][] => rows;

const TILES = {
  floor: { id: "bd-t0", size: 8 as const, data: d([
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 2, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [2, 1, 1, 1, 1, 2, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 2, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ]) },
  wall: { id: "bd-t1", size: 8 as const, data: d([
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 2, 2, 3, 2, 2, 2, 3],
    [3, 2, 2, 3, 2, 2, 2, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 2, 2, 2, 3, 2, 2, 3],
    [3, 2, 2, 2, 3, 2, 2, 3],
    [3, 2, 2, 2, 3, 2, 2, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
  ]) },
  door: { id: "bd-t2", size: 8 as const, data: d([
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 2, 1, 1, 1, 1, 2, 3],
    [3, 2, 1, 0, 0, 1, 2, 3],
    [3, 2, 1, 0, 0, 1, 2, 3],
    [3, 2, 1, 0, 0, 1, 2, 3],
    [3, 2, 1, 0, 0, 1, 2, 3],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [3, 3, 2, 3, 3, 2, 3, 3],
  ]) },
  chest: { id: "bd-t3", size: 8 as const, data: d([
    [null, null, null, null, null, null, null, null],
    [null, 3, 3, 3, 3, 3, null, null],
    [null, 3, 2, 2, 2, 3, null, null],
    [null, 3, 3, 3, 3, 3, null, null],
    [null, 3, 1, 1, 1, 3, null, null],
    [null, 3, 1, 0, 1, 3, null, null],
    [null, 3, 3, 3, 3, 3, null, null],
    [null, null, null, null, null, null, null, null],
  ]) },
  torch: { id: "bd-t4", size: 8 as const, data: d([
    [null, null, 1, 1, null, null, null, null],
    [null, 1, 0, 1, 1, null, null, null],
    [null, null, 2, 2, null, null, null, null],
    [null, null, 3, 3, null, null, null, null],
    [null, null, 2, 3, null, null, null, null],
    [null, null, 3, 3, null, null, null, null],
    [null, null, 3, 3, null, null, null, null],
    [null, 3, 3, 3, 3, null, null, null],
  ]) },
  stairs: { id: "bd-t5", size: 8 as const, data: d([
    [1, 1, 1, 1, 1, 1, 1, 1],
    [2, 1, 1, 1, 1, 1, 1, 2],
    [2, 2, 1, 1, 1, 1, 2, 2],
    [2, 2, 2, 1, 1, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [3, 2, 2, 2, 2, 2, 2, 3],
    [3, 3, 2, 2, 2, 2, 3, 3],
    [3, 3, 3, 2, 2, 3, 3, 3],
  ]) },
  hero_d1: { id: "bd-c0", size: 8 as const, data: d([
    [null, null, 3, 3, 3, 3, null, null],
    [null, 3, 2, 2, 2, 2, 3, null],
    [3, 2, 3, 2, 2, 3, 2, 3],
    [3, 2, 2, 2, 2, 2, 2, 3],
    [null, 3, 1, 1, 1, 1, 3, null],
    [null, 3, 1, 1, 1, 1, 3, null],
    [null, 3, 3, 3, 3, 3, 3, null],
    [null, 3, null, 3, 3, null, 3, null],
  ]) },
  hero_d2: { id: "bd-c1", size: 8 as const, data: d([
    [null, null, 3, 3, 3, 3, null, null],
    [null, 3, 2, 2, 2, 2, 3, null],
    [3, 2, 3, 2, 2, 3, 2, 3],
    [3, 2, 2, 2, 2, 2, 2, 3],
    [null, 3, 1, 1, 1, 1, 3, null],
    [null, 3, 1, 1, 1, 1, 3, null],
    [null, 3, 3, 3, 3, 3, 3, null],
    [null, null, 3, 3, null, 3, 3, null],
  ]) },
  slime1: { id: "bd-c2", size: 8 as const, data: d([
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, 2, 2, 2, 2, null, null],
    [null, 2, 1, 1, 1, 1, 2, null],
    [2, 1, 3, 1, 1, 3, 1, 2],
    [2, 1, 1, 1, 1, 1, 1, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [null, null, null, null, null, null, null, null],
  ]) },
  slime2: { id: "bd-c3", size: 8 as const, data: d([
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, 2, 2, 2, 2, 2, 2, null],
    [2, 1, 1, 1, 1, 1, 1, 2],
    [2, 1, 3, 1, 1, 3, 1, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [null, null, null, null, null, null, null, null],
  ]) },
};

const W = { tilesetId: TS, tileIndex: 1 };
const F = { tilesetId: TS, tileIndex: 0 };
const D = { tilesetId: TS, tileIndex: 2 };
const C = { tilesetId: TS, tileIndex: 3 };
const T = { tilesetId: TS, tileIndex: 4 };
const S = { tilesetId: TS, tileIndex: 5 };
const n = null;

const CTS = "builtin-dungeon-chars";

export const DUNGEON_TEMPLATE: Template = {
  id: "builtin-dungeon",
  name: "Dungeon",
  description: "A complete dungeon environment with a hero, monsters, and animated objects.",
  category: "dungeon",
  isBuiltin: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  tilesets: [
    {
      id: TS,
      name: "Dungeon Environment",
      tileSize: 8,
      tiles: [TILES.floor, TILES.wall, TILES.door, TILES.chest, TILES.torch, TILES.stairs],
      layout: {
        columns: 3,
        positions: {
          "bd-t0": { x: 0, y: 0 },
          "bd-t1": { x: 1, y: 0 },
          "bd-t2": { x: 2, y: 0 },
          "bd-t3": { x: 0, y: 1 },
          "bd-t4": { x: 1, y: 1 },
          "bd-t5": { x: 2, y: 1 },
        },
      },
    },
    {
      id: CTS,
      name: "Dungeon Characters",
      tileSize: 8,
      tiles: [TILES.hero_d1, TILES.hero_d2, TILES.slime1, TILES.slime2],
      layout: {
        columns: 2,
        positions: {
          "bd-c0": { x: 0, y: 0 },
          "bd-c1": { x: 1, y: 0 },
          "bd-c2": { x: 0, y: 1 },
          "bd-c3": { x: 1, y: 1 },
        },
      },
    },
  ],
  maps: [{
    id: "builtin-dungeon-map",
    name: "Dungeon Room",
    width: 12,
    height: 10,
    tileSize: 8,
    layers: [
      {
        id: "builtin-dungeon-layer1",
        name: "Architecture",
        visible: true,
        data: [
          [W, W, W, W, W, W, W, W, W, W, W, W],
          [W, F, F, F, F, F, F, F, F, F, F, W],
          [W, F, F, F, F, F, F, F, F, F, F, W],
          [W, F, F, F, F, F, F, F, F, F, F, W],
          [W, F, F, F, F, F, F, F, F, F, F, W],
          [W, F, F, F, F, F, F, F, F, F, F, W],
          [W, F, F, F, F, F, F, F, F, F, F, W],
          [W, F, F, F, F, S, F, F, F, F, F, W],
          [W, F, F, F, F, F, F, F, F, F, F, W],
          [W, W, W, W, W, D, W, W, W, W, W, W],
        ],
      },
      {
        id: "builtin-dungeon-layer2",
        name: "Props",
        visible: true,
        data: [
          [n, n, n, n, n, n, n, n, n, n, n, n],
          [n, n, n, n, n, n, n, n, n, n, n, n],
          [n, n, T, n, n, n, n, n, n, T, n, n],
          [n, n, n, n, n, n, n, n, n, n, n, n],
          [n, n, n, n, n, n, n, n, n, n, n, n],
          [n, n, n, C, n, n, n, n, C, n, n, n],
          [n, n, n, n, n, n, n, n, n, n, n, n],
          [n, n, n, n, n, n, n, n, n, n, n, n],
          [n, n, n, n, n, n, n, n, n, n, n, n],
          [n, n, n, n, n, n, n, n, n, n, n, n],
        ],
      },
    ],
  }],
  sprites: [
    {
      id: "hero-sprite",
      name: "Hero",
      animations: [
        {
          id: "hero-walk",
          name: "Walk Down",
          loop: true,
          frames: [
            { tilesetId: CTS, tileIndex: 0, duration: 200 },
            { tilesetId: CTS, tileIndex: 1, duration: 200 },
          ],
        },
      ],
    },
    {
      id: "slime-sprite",
      name: "Slime",
      animations: [
        {
          id: "slime-idle",
          name: "Idle",
          loop: true,
          frames: [
            { tilesetId: CTS, tileIndex: 2, duration: 400 },
            { tilesetId: CTS, tileIndex: 3, duration: 400 },
          ],
        },
      ],
    },
  ],
};

