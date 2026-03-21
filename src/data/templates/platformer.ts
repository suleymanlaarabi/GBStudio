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
