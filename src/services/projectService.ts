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
