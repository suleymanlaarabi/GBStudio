import type { GBColor } from "../types";
import { drawCircle, drawRectangle, floodFillData } from "../utils";

export const applyPencil = (
  data: GBColor[][],
  x: number,
  y: number,
  color: GBColor,
) =>
  data.map((row, rowIndex) =>
    rowIndex === y ? row.map((pixel, pixelIndex) => (pixelIndex === x ? color : pixel)) : row,
  );

export const applyBucket = (
  data: GBColor[][],
  x: number,
  y: number,
  color: GBColor,
) => floodFillData(data, x, y, color);

export const applyRectangle = drawRectangle;
export const applyCircle = drawCircle;
