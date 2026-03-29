import React, { useState } from "react";
import {
import { useStore } from "../../store";
import { CustomSelect } from "../ui/CustomSelect";
  Trash2,
  Palette,
  Info,
  Monitor,
  Database,
  Keyboard,
} from "lucide-react";

export const Settings: React.FC = () => {
  const { loadProjectData, setView } = useStore();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleClearData = () => {
    // Clear localStorage
    localStorage.clear();

    // Reset store with empty project
    loadProjectData({
      tilesets: [],
      maps: [],
      sprites: [],
      sounds: [],
    });

    // Reset view
    setView("tiles");

    // Force reload to be sure everything is clean
    window.location.reload();
  };

  const sectionStyle: React.CSSProperties = {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "1.2rem",
    color: "var(--accent)",
  };

  const itemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.8rem 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        width: "100%",
        paddingBottom: "4rem",
      }}
    >
      <h1
        style={{
          fontSize: "1.5rem",
          marginTop: 0,
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <Monitor size={24} />
        Settings
      </h1>

      {/* Interface Section */}
      <div style={sectionStyle}>
        <div style={headerStyle}>
          <Palette size={20} />
          Interface
        </div>
        <div style={itemStyle}>
          <div>
            <div style={{ fontWeight: "500" }}>Color Theme</div>
            <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
              Customize the editor appearance
            </div>
          </div>
          <div style={{ width: "200px" }}>
            <CustomSelect
              value="dark"
              onChange={() => {}}
              options={[
                { label: "Dark (Default)", value: "dark" },
                { label: "Retro Green", value: "retro" },
                { label: "Light", value: "light", disabled: true },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Shortcuts Section */}
      <div style={sectionStyle}>
        <div style={headerStyle}>
          <Keyboard size={20} />
          Shortcuts
        </div>
        <div style={itemStyle}>
          <div>
            <div style={{ fontWeight: "500" }}>Keyboard Shortcuts</div>
            <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
              Quick access to common actions. Press <b>?</b> anywhere to open.
            </div>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const event = new KeyboardEvent("keydown", { key: "?" });
              window.dispatchEvent(event);
            }}
          >
            View All
          </button>
        </div>
      </div>

      {/* Storage & Data Section */}
      <div style={sectionStyle}>
        <div style={headerStyle}>
          <Database size={20} />
          Data & Storage
        </div>

        <div style={{ ...itemStyle, borderBottom: "none", marginTop: "1rem" }}>
          <div>
            <div style={{ fontWeight: "500", color: "#ff4444" }}>
              Dangerous Area
            </div>
