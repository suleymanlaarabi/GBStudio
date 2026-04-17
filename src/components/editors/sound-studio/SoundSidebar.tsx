import React from "react";
import { Trash2 } from "lucide-react";
import type { SoundAsset, SoundChannelType } from "../../../types";
import {
  getSoundButtonContent,
  getSoundIcon,
  SOUND_TYPE_BUTTONS,
} from "./shared";

interface SoundSidebarProps {
  sounds: SoundAsset[];
  selectedSoundId: string | null;
  onSelectSound: (soundId: string) => void;
  onAddSound: (type: SoundChannelType) => void;
  onRequestDelete: (soundId: string) => void;
}

export const SoundSidebar: React.FC<SoundSidebarProps> = ({
  sounds,
  selectedSoundId,
  onSelectSound,
  onAddSound,
  onRequestDelete,
}) => (
  <div
    className="panel"
    style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h3 style={{ margin: 0 }}>Sound</h3>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {SOUND_TYPE_BUTTONS.map((button) => {
          const content = getSoundButtonContent(button.type);

          return (
            <button
              key={button.type}
              className="btn btn-secondary btn-sm"
              onClick={() => onAddSound(button.type)}
              title={button.title}
            >
              {content.kind === "label" ? (
                <span style={{ fontSize: "0.7rem", fontWeight: "bold" }}>
                  {content.value}
                </span>
              ) : (
                <content.value size={14} />
              )}
            </button>
          );
        })}
      </div>
    </div>

    <div
      className="scroll-area"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      {sounds.map((sound) => {
        const Icon = getSoundIcon(sound.type);

        return (
          <div
            key={sound.id}
            className={`asset-card ${selectedSoundId === sound.id ? "active" : ""}`}
            onClick={() => onSelectSound(sound.id)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.8rem",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Icon size={16} />
              <span>{sound.name}</span>
            </div>
            <button
              className="btn btn-ghost btn-sm text-danger"
              onClick={(event) => {
                event.stopPropagation();
                onRequestDelete(sound.id);
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}

      {sounds.length === 0 && (
        <div style={{ padding: "2rem", textAlign: "center", opacity: 0.5 }}>
          No sounds yet. Click + to add one.
        </div>
      )}
    </div>
  </div>
);
