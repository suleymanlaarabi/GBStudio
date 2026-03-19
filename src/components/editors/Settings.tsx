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
