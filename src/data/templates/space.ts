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
