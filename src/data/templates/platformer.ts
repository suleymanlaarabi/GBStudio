import type { GBColor } from "../../types";
import type { Template } from "../../types/template";
import { migrateFlatDataToChunks } from "../../services/mapService";

const TS = "builtin-platformer-ts";

const d = (rows: (GBColor | null)[][]): (GBColor | null)[][] => rows;

const TILES = {
  ground: { id: "bp-t0", size: 8 as const, data: d([
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 2, 2, 2, 2, 2, 2, 3],
    [3, 2, 1, 1, 1, 1, 2, 3],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
  ]) },
  brick: { id: "bp-t1", size: 8 as const, data: d([
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 2, 2, 2, 3, 2, 2, 3],
    [3, 2, 2, 2, 3, 2, 2, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 2, 3, 2, 2, 2, 2, 3],
    [3, 2, 3, 2, 2, 2, 2, 3],
    [3, 2, 3, 2, 2, 2, 2, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
  ]) },
  coin: { id: "bp-t2", size: 8 as const, data: d([
    [null, null, 2, 2, 2, null, null, null],
    [null, 2, 1, 1, 1, 2, null, null],
    [2, 1, 1, 0, 1, 1, 2, null],
    [2, 1, 0, 0, 0, 1, 2, null],
    [2, 1, 0, 0, 1, 1, 2, null],
    [2, 1, 1, 1, 1, 1, 2, null],
    [null, 2, 1, 1, 1, 2, null, null],
    [null, null, 2, 2, 2, null, null, null],
  ]) },
  spike: { id: "bp-t3", size: 8 as const, data: d([
    [null, 1, null, null, null, 1, null, null],
    [null, 1, null, null, null, 1, null, null],
    [1, 1, null, 1, null, 1, null, null],
    [1, 1, 1, 1, 1, 1, null, null],
    [1, 1, 1, 1, 1, 1, 1, null],
    [1, 1, 1, 1, 1, 1, 1, null],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [3, 3, 3, 3, 3, 3, 3, 3],
  ]) },
  cloud: { id: "bp-t4", size: 8 as const, data: d([
    [null, null, 1, 1, 1, null, null, null],
    [null, 1, 1, 1, 1, 1, null, null],
    [1, 1, 1, 1, 1, 1, 1, null],
    [1, 1, 1, 1, 1, 1, 1, null],
    [null, 1, 1, 1, 1, 1, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
  ]) },
  flag: { id: "bp-t5", size: 8 as const, data: d([
    [null, 3, 3, 3, 3, null, null, null],
    [null, 3, 1, 1, 1, 3, null, null],
    [null, 3, 1, 1, 1, 3, null, null],
    [null, 3, 1, 1, 1, 3, null, null],
    [null, 3, 3, 3, 3, null, null, null],
    [null, 3, null, null, null, null, null, null],
    [null, 3, null, null, null, null, null, null],
    [2, 2, 2, null, null, null, null, null],
  ]) },
  player_idle: { id: "bp-c0", size: 8 as const, data: d([
    [null, null, 3, 3, 3, null, null, null],
    [null, 3, 2, 2, 2, 3, null, null],
    [null, 3, 2, 3, 2, 3, null, null],
    [null, 3, 2, 2, 2, 3, null, null],
    [null, null, 3, 1, 3, null, null, null],
    [null, 3, 1, 1, 1, 3, null, null],
    [null, null, 3, 1, 3, null, null, null],
    [null, null, 3, null, 3, null, null, null],
  ]) },
  player_walk: { id: "bp-c1", size: 8 as const, data: d([
    [null, null, 3, 3, 3, null, null, null],
    [null, 3, 2, 2, 2, 3, null, null],
    [null, 3, 2, 3, 2, 3, null, null],
    [null, 3, 2, 2, 2, 3, null, null],
    [null, null, 3, 1, 3, null, null, null],
    [null, 3, 1, 1, 1, 3, null, null],
    [null, null, 3, 1, 3, null, null, null],
    [null, 3, 3, null, 3, 3, null, null],
  ]) },
  bird1: { id: "bp-c2", size: 8 as const, data: d([
    [null, null, null, null, null, null, null, null],
    [null, 3, null, null, null, 3, null, null],
    [3, 2, 3, null, 3, 2, 3, null],
    [3, 2, 2, 3, 2, 2, 3, null],
    [null, 3, 3, 2, 3, 3, null, null],
    [null, null, 3, 3, 3, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
  ]) },
  bird2: { id: "bp-c3", size: 8 as const, data: d([
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, 3, 3, 3, null, null, null],
    [3, 3, 2, 2, 2, 3, 3, null],
    [3, 2, 2, 2, 2, 2, 3, null],
    [null, 3, 3, 3, 3, 3, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
  ]) },
};

const n = null;
const G = { tilesetId: TS, tileIndex: 0 };
const B = { tilesetId: TS, tileIndex: 1 };
const C = { tilesetId: TS, tileIndex: 2 };
const Sp = { tilesetId: TS, tileIndex: 3 };
const Cl = { tilesetId: TS, tileIndex: 4 };
const F = { tilesetId: TS, tileIndex: 5 };

const CTS = "builtin-platformer-chars";

export const PLATFORMER_TEMPLATE: Template = {
  id: "builtin-platformer",
  name: "Platformer",
  description: "Dynamic platformer level with a player character, animated enemies, and collectibles.",
  category: "platformer",
  isBuiltin: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  tilesets: [
    {
      id: TS,
      name: "Platformer Terrain",
      tileSize: 8,
      tiles: [TILES.ground, TILES.brick, TILES.coin, TILES.spike, TILES.cloud, TILES.flag],
      layout: {
        columns: 3,
        positions: {
          "bp-t0": { x: 0, y: 0 },
          "bp-t1": { x: 1, y: 0 },
          "bp-t2": { x: 2, y: 0 },
          "bp-t3": { x: 0, y: 1 },
          "bp-t4": { x: 1, y: 1 },
          "bp-t5": { x: 2, y: 1 },
        },
      },
    },
    {
      id: CTS,
      name: "Characters & Enemies",
      tileSize: 8,
      tiles: [TILES.player_idle, TILES.player_walk, TILES.bird1, TILES.bird2],
      layout: {
        columns: 2,
        positions: {
          "bp-c0": { x: 0, y: 0 },
          "bp-c1": { x: 1, y: 0 },
          "bp-c2": { x: 0, y: 1 },
          "bp-c3": { x: 1, y: 1 },
        },
      },
    },
  ],
  maps: [{
    id: "builtin-platformer-map",
    name: "Level 1",
    width: 16,
    height: 9,
    tileSize: 8,
    layers: [
      {
        id: "builtin-platformer-layer1",
        name: "Terrain",
        visible: true,
        chunks: migrateFlatDataToChunks([
          [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
          [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
          [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
          [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
          [n, B, B, n, n, B, B, B, B, B, n, n, n, B, B, B],
          [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
          [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
          [G, G, G, G, G, G, G, G, G, n, G, G, G, G, G, G],
          [G, G, G, G, G, G, G, G, G, n, G, G, G, G, G, G],
        ]),
      },
      {
        id: "builtin-platformer-layer2",
        name: "Props",
        visible: true,
        chunks: migrateFlatDataToChunks([
          [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, F],
          [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
          [n, Cl, n, n, Cl, n, n, n, n, n, n, n, Cl, n, n, n],
          [n, n, n, n, n, n, n, C, n, C, n, n, n, n, n, n],
          [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
          [n, n, n, n, C, n, n, n, n, n, C, n, n, n, n, n],
          [n, n, n, n, Sp, n, n, n, n, n, n, Sp, n, n, n, n],
          [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
          [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
        ]),
      },
    ],
  }],
  sprites: [
    {
      id: "player-sprite",
      name: "Player",
      animations: [
        {
          id: "player-walk",
          name: "Walk",
          loop: true,
          frames: [
            { tilesetId: CTS, tileIndex: 0, duration: 200 },
            { tilesetId: CTS, tileIndex: 1, duration: 200 },
          ],
        },
      ],
    },
    {
      id: "bird-sprite",
      name: "Bird Enemy",
      animations: [
        {
          id: "bird-fly",
          name: "Fly",
          loop: true,
          frames: [
            { tilesetId: CTS, tileIndex: 2, duration: 150 },
            { tilesetId: CTS, tileIndex: 3, duration: 150 },
          ],
        },
      ],
    },
  ],
};

