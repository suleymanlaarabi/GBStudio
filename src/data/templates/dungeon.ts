import type { GBColor } from "../../types";
import type { Template } from "../../types/template";
import { migrateFlatDataToChunks } from "../../services/mapService";

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
