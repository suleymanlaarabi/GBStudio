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
