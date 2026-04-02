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
