import React, { useRef } from "react";
import { Play } from "lucide-react";
import type {
import { CustomSelect } from "../../ui/CustomSelect";
import { playSoundPreview } from "./soundPreview";
  NoiseChannel,
  Pulse1Channel,
  Pulse2Channel,
  SoundAsset,
  WaveChannel,
} from "../../../types";

interface SoundEditorPanelProps {
  sound: SoundAsset;
  onUpdate: (updates: Partial<SoundAsset>) => void;
}

type PulseChannel = Pulse1Channel | Pulse2Channel;

// ── Helpers ──────────────────────────────────────────────────────────────────

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const regToNoteName = (reg: number): string => {
  if (reg <= 0 || reg >= 2048) return "";
  const hz = 131072 / (2048 - reg);
  const midi = Math.round(12 * Math.log2(hz / 440)) + 69;
  const note = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
};

// ── Primitive controls ────────────────────────────────────────────────────────

const SliderControl = ({
  label,
  hint,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) => (
  <div className="sound-control-group">
    <label>{label}</label>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
    />
    <span style={{ minWidth: "2.5rem", textAlign: "right" }}>
      {value}
      {hint && <span style={{ opacity: 0.5, marginLeft: "0.3rem", fontSize: "0.75rem" }}>{hint}</span>}
    </span>
  </div>
);

const FrequencyControl = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => {
  const note = regToNoteName(value);
  return (
    <div className="sound-control-group">
      <label>Frequency</label>
      <input
        type="range"
        min={0}
        max={2047}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      />
      <span style={{ minWidth: "4rem", textAlign: "right" }}>
        {value}
        {note && (
          <span style={{ opacity: 0.5, marginLeft: "0.3rem", fontSize: "0.75rem" }}>
            {note}
          </span>
        )}
      </span>
    </div>
  );
};

const SelectControl = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: Array<{ label: string; value: string | number }>;
}) => (
  <div className="sound-control-group">
    <label>{label}</label>
    <div style={{ flex: 2 }}>
      <CustomSelect value={value} onChange={onChange} options={options} />
    </div>
  </div>
);

const ToggleControl = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) => (
  <div className="sound-control-group">
    <label>{label}</label>
    <input
      type="checkbox"
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
      style={{ width: "auto", cursor: "pointer" }}
    />
  </div>
);

// ── Channel editors ───────────────────────────────────────────────────────────

const PulseEditor = ({
  sound,
  onUpdate,
}: {
  sound: SoundAsset;
  onUpdate: (updates: Partial<SoundAsset>) => void;
}) => {
  const pulse = (sound.type === "PULSE1" ? sound.pulse1 : sound.pulse2) as
    | PulseChannel
    | undefined;
  if (!pulse) return null;

  const updatePulse = (updates: Partial<PulseChannel>) => {
    if (sound.type === "PULSE1") {
      onUpdate({ pulse1: { ...sound.pulse1!, ...updates } });
    } else {
      onUpdate({ pulse2: { ...sound.pulse2!, ...updates } });
    }
  };

  return (
    <>
      {sound.type === "PULSE1" && sound.pulse1 && (
        <section className="sound-editor-section">
          <h4>Sweep (Pulse 1 only)</h4>
          <SliderControl
            label="Time (0–7)"
            min={0}
            max={7}
