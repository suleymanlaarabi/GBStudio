import React, { useState } from "react";
import { Music } from "lucide-react";
import { useStore } from "../../store";
import type { SoundChannelType } from "../../types";
import { Modal } from "../ui/Modal";
import { SoundEditorPanel } from "./sound-studio/SoundEditorPanel";
import { SoundSidebar } from "./sound-studio/SoundSidebar";
import { SoundStudioStyles } from "./sound-studio/SoundStudioStyles";
import { getSelectedSound } from "./sound-studio/shared";
