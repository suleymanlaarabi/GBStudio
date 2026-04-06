import type { GBColor } from "../../types";
import type { Template } from "../../types/template";
import { migrateFlatDataToChunks } from "../../services/mapService";

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
