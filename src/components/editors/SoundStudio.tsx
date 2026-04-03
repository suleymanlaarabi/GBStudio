import React, { useState } from "react";
import { Music } from "lucide-react";
import { useStore } from "../../store";
import type { SoundChannelType } from "../../types";
import { Modal } from "../ui/Modal";
import { SoundEditorPanel } from "./sound-studio/SoundEditorPanel";
import { SoundSidebar } from "./sound-studio/SoundSidebar";
import { SoundStudioStyles } from "./sound-studio/SoundStudioStyles";
import { getSelectedSound } from "./sound-studio/shared";

export const SoundStudio: React.FC = () => {
  const {
    sounds,
    selectedSoundId,
    addSound,
    updateSound,
    removeSound,
    setSelectedSoundId,
  } = useStore();
  const selectedSound = getSelectedSound(sounds, selectedSoundId);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [soundToDelete, setSoundToDelete] = useState<string | null>(null);

  const handleAddSound = (type: SoundChannelType) => {
    const name = `SFX ${sounds.length + 1}`;
    addSound(name, type);
  };

  const handleRequestDelete = (soundId: string) => {
    setSoundToDelete(soundId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (soundToDelete) {
      removeSound(soundToDelete);
      setSoundToDelete(null);
    }
    setDeleteModalOpen(false);
  };

  return (
