import type { ProjectData, ProjectDocument } from "../types";

const PROJECT_FORMAT = "cartridge-project";
const PROJECT_VERSION = 1 as const;

export const createProjectDocument = (
  name: string,
  data: ProjectData,
): ProjectDocument => ({
  format: PROJECT_FORMAT,
  version: PROJECT_VERSION,
  appVersion: "0.1.0",
  savedAt: new Date().toISOString(),
  name,
  data,
});

export const serializeProject = (name: string, data: ProjectData) =>
  JSON.stringify(createProjectDocument(name, data), null, 2);

export const parseProjectDocument = (raw: string): ProjectDocument => {
  const parsed = JSON.parse(raw) as Partial<ProjectDocument>;

  if (parsed.format !== PROJECT_FORMAT || parsed.version !== PROJECT_VERSION || !parsed.data) {
    throw new Error("Invalid project file format");
  }

  if (!Array.isArray(parsed.data.tilesets) || !Array.isArray(parsed.data.maps) || !Array.isArray(parsed.data.sprites)) {
    throw new Error("Invalid project payload");
  }

  // Ensure sounds array exists
  if (!parsed.data.sounds) {
    parsed.data.sounds = [];
  }

  return parsed as ProjectDocument;
};
