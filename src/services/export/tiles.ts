import type { GBColor, Tileset } from "../../types";
import type { ExpandedTileset } from "./types";
import { sanitizeName } from "./utils";

export const convertTileDataTo2BPP = (
  data: (GBColor | null)[][],
  size: number,
): string[] => {
  const bytes: number[] = [];

  for (let y = 0; y < size; y += 1) {
    let lowByte = 0;
    let highByte = 0;

    for (let x = 0; x < size; x += 1) {
      const color = (data[y]![x] ?? 0) as GBColor;
      const lowBit = color & 1;
      const highBit = (color >> 1) & 1;
      lowByte |= lowBit << (7 - x);
      highByte |= highBit << (7 - x);
