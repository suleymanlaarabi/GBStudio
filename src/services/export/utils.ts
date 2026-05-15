export const sanitizeName = (name: string): string => {
  const normalized = name.replace(/[^a-z0-9]/gi, "_");
  return /^[0-9]/.test(normalized) ? `asset_${normalized}` : normalized || "asset";
};
