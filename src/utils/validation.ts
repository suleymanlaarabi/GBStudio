import type { ProjectDocument } from "../types";

/**
 * Validates a parsed project document structure
 * Checks for required fields, correct types, and data integrity
 */
export const isValidProjectDocument = (obj: unknown): obj is ProjectDocument => {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const doc = obj as Partial<ProjectDocument>;

  // Check required top-level fields
  if (
    typeof doc.format !== "string" ||
    typeof doc.version !== "number" ||
    typeof doc.appVersion !== "string" ||
    typeof doc.savedAt !== "string" ||
    typeof doc.name !== "string" ||
    !doc.data ||
    typeof doc.data !== "object"
  ) {
    return false;
  }

  // Validate format
  if (doc.format !== "cartridge-project") {
    return false;
  }

  // Validate version
  if (doc.version !== 1) {
    return false;
  }

  // Validate data structure
  const data = doc.data as Partial<ProjectDocument["data"]>;

  if (!Array.isArray(data.tilesets) || !Array.isArray(data.maps) || !Array.isArray(data.sprites)) {
    return false;
  }

  // Validate that arrays don't contain undefined/null in a basic way
  if (data.tilesets.some((item) => !item || typeof item !== "object")) {
    return false;
  }
  if (data.maps.some((item) => !item || typeof item !== "object")) {
    return false;
  }
  if (data.sprites.some((item) => !item || typeof item !== "object")) {
    return false;
  }

  return true;
};

/**
 * Attempts to parse and validate a project document from a JSON string
 * Returns the parsed document if valid, null if invalid or corrupted
 */
export const safeParseProjectDocument = (jsonString: string): ProjectDocument | null => {
  try {
    const parsed = JSON.parse(jsonString);
    if (isValidProjectDocument(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    // JSON parsing failed - data is corrupted
    return null;
  }
};

/**
 * Attempts to parse autosave data from localStorage with robust error handling
 * Returns validated project data or null if invalid
 */
export const loadAutosaveData = (storageKey: string): ProjectDocument | null => {
  try {
    const autosaveData = localStorage.getItem(storageKey);
    if (!autosaveData) {
      return null;
    }

    return safeParseProjectDocument(autosaveData);
  } catch (error) {
    console.error("Failed to load autosave data:", error);
    return null;
  }
};
