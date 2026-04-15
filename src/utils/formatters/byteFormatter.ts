export const formatByte = (value: number) =>
  `0x${value.toString(16).padStart(2, "0")}`;

export const formatFlatByteArray = (bytes: number[], rowSize = 16) => {
  if (bytes.length === 0) return "    0x00\n";

  const lines: string[] = [];
  for (let index = 0; index < bytes.length; index += rowSize) {
    const chunk = bytes.slice(index, index + rowSize);
    const suffix = index + rowSize >= bytes.length ? "" : ",";
    lines.push(`    ${chunk.map(formatByte).join(",")}${suffix}`);
  }

  return `${lines.join("\n")}\n`;
};

export const formatMapRows = (data: number[], rowWidth: number) => {
  if (data.length === 0 || rowWidth <= 0) return "    0x00\n";

  const lines: string[] = [];
  for (let index = 0; index < data.length; index += rowWidth) {
    const chunk = data.slice(index, index + rowWidth);
    const suffix = index + rowWidth >= data.length ? "" : ",";
    lines.push(`    ${chunk.map(formatByte).join(",")}${suffix}`);
  }

  return `${lines.join("\n")}\n`;
};
