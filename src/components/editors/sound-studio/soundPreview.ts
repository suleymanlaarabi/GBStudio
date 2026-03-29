import type { SoundAsset } from "../../../types";

const getAudioContext = (
  current: AudioContext | null,
  setCurrent: (context: AudioContext) => void,
) => {
  if (current) {
    return current;
  }

  const context = new (
    window.AudioContext ||
    (window as Window & typeof globalThis & { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext
  )();
  setCurrent(context);
  return context;
};

export const playSoundPreview = (
  sound: SoundAsset,
  currentContext: AudioContext | null,
  setCurrentContext: (context: AudioContext) => void,
) => {
  const ctx = getAudioContext(currentContext, setCurrentContext);
  const now = ctx.currentTime;

  if ((sound.type === "PULSE1" || sound.type === "PULSE2") && (sound.pulse1 || sound.pulse2)) {
    const pulse = sound.type === "PULSE1" ? sound.pulse1! : sound.pulse2!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";

    const regToHz = (reg: number) => 131072 / (2048 - reg);
    const startHz = regToHz(pulse.frequency);

