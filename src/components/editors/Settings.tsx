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
