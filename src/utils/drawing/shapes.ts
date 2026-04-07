import type { GBColor } from "../../types";

type PixelData = (GBColor | null)[][];

export function getCircleFromBounds(
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
): { centerX: number; centerY: number; radiusX: number; radiusY: number } {
  return {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    radiusX: (maxX - minX) / 2,
    radiusY: (maxY - minY) / 2,
  };
}

export function drawCircle(
  data: PixelData,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  color: GBColor,
  filled = true,
): PixelData {
  const newData = data.map((row) => [...row]);
  const size = data.length;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const dx = (px + 0.5 - centerX) / (radiusX + 0.5);
      const dy = (py + 0.5 - centerY) / (radiusY + 0.5);
      const dist = dx * dx + dy * dy;

      if (filled) {
        if (dist <= 1) newData[py]![px] = color;
      } else {
        const dxOuter = (px + 0.5 - centerX) / (radiusX + 0.5);
        const dyOuter = (py + 0.5 - centerY) / (radiusY + 0.5);
        const dxInner = (px + 0.5 - centerX) / (radiusX - 0.5);
        const dyInner = (py + 0.5 - centerY) / (radiusY - 0.5);
        if (dxOuter * dxOuter + dyOuter * dyOuter <= 1 &&
            dxInner * dxInner + dyInner * dyInner > 1) {
          newData[py]![px] = color;
