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
