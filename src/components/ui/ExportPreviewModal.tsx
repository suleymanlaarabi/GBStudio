import React from "react";
import { X, Check } from "lucide-react";
import { generateCFile, generateHFile } from "../../services/exportService";
import type { Tileset, TileMap, SpriteAsset } from "../../types";
import { validateGameBoyHardwareLimits } from "../../utils";

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
  tilesets: Tileset[];
  maps: TileMap[];
  sprites: SpriteAsset[];
}

export const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  projectName,
  tilesets,
  maps,
  sprites,
}) => {
  const [selectedTab, setSelectedTab] = React.useState<"c" | "h">("h");
  const hardwareValidation = React.useMemo(
    () => validateGameBoyHardwareLimits(tilesets, sprites),
    [tilesets, sprites],
  );

  if (!isOpen) return null;

  const renderFilePreview = () => {
    try {
      const content =
        selectedTab === "c"
          ? generateCFile(projectName, tilesets, maps, sprites)
          : generateHFile(projectName, tilesets, maps, sprites);

      const lines = content.split("\n");
      const previewLines = lines.slice(0, 100);
      const hasMore = lines.length > 100;

      return (
        <div
          style={{
            flex: 1,
            overflow: "auto",
            backgroundColor: "#0d1117",
            padding: "0.75rem",
          }}
        >
          <pre
            style={{
              margin: 0,
              color: "#c9d1d9",
              fontFamily: "monospace",
              fontSize: "0.75rem",
              lineHeight: "1.4",
            }}
          >
            {previewLines.map((line, index) => (
              <div key={`line-${index}`} style={{ display: "flex" }}>
                <span
                  style={{
                    color: "#6e7681",
                    userSelect: "none",
                    paddingRight: "1rem",
                    minWidth: "2.5rem",
                    textAlign: "right",
                  }}
                >
                  {index + 1}
                </span>
                <span>{line || " "}</span>
              </div>
            ))}
            {hasMore && (
              <div
                style={{
                  color: "#6e7681",
                  fontStyle: "italic",
                  marginTop: "0.5rem",
                }}
              >
                ... and {lines.length - 100} more lines
              </div>
            )}
          </pre>
        </div>
      );
    } catch (error) {
      return (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ff7a7a",
          }}
        >
          Error generating preview:{" "}
          {error instanceof Error ? error.message : String(error)}
        </div>
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content card"
        style={{
          width: "90vw",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="section-title">
          Export Preview: {projectName}.{selectedTab}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: "4px" }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            padding: "0.6rem",
            borderBottom: "1px solid #30363d",
          }}
        >
          <button
            type="button"
            className={`btn ${selectedTab === "h" ? "btn-primary" : "btn-secondary"}`}
            style={{
              fontSize: "0.875rem",
