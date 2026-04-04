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
    }

    bytes.push(lowByte, highByte);
  }

  return bytes.map((byte) => `0x${byte.toString(16).padStart(2, "0")}`);
};

export const expandTileData = (data: (GBColor | null)[][], size: number): number[][] => {
  if (size === 16) {
    const result: number[][] = [];

    for (let segment = 0; segment < 4; segment += 1) {
      const offsetX = (segment % 2) * 8;
      const offsetY = Math.floor(segment / 2) * 8;
      const subTile: GBColor[][] = [];

      for (let y = 0; y < 8; y += 1) {
        const row: GBColor[] = [];
        for (let x = 0; x < 8; x += 1) {
          row.push((data[offsetY + y]![offsetX + x] ?? 0) as GBColor);
        }
        subTile.push(row);
      }

      result.push(
        convertTileDataTo2BPP(subTile, 8).map((value) => parseInt(value, 16)),
      );
    }

    return result;
  }

  return [convertTileDataTo2BPP(data, 8).map((value) => parseInt(value, 16))];
