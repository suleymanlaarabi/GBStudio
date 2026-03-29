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

