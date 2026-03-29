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
