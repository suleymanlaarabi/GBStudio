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

    if (sound.type === "PULSE1" && sound.pulse1 && sound.pulse1.sweepTime > 0) {
      const sweepDuration = (sound.pulse1.sweepTime * 7.8) / 1000;
      const factor = 1 / Math.pow(2, sound.pulse1.sweepShift);
      const endHz =
        sound.pulse1.sweepDirection === "UP"
          ? startHz * (1 + factor)
          : startHz * (1 - factor);

      osc.frequency.setValueAtTime(startHz, now);
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, endHz),
        now + sweepDuration,
      );
    } else {
      osc.frequency.setValueAtTime(startHz, now);
    }

    const initialVol = pulse.initialVolume / 15;
    gain.gain.setValueAtTime(initialVol, now);
    if (pulse.envelopeSweep > 0) {
      const envDuration = (pulse.envelopeSweep * 64) / 1000;
      const endVol = pulse.envelopeDirection === "UP" ? Math.min(1, initialVol + 0.5) : 0;
      gain.gain.linearRampToValueAtTime(endVol, now + envDuration + 0.1);
    } else {
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.5);
    return;
  }

  if (sound.type === "NOISE" && sound.noise) {
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(sound.noise.initialVolume / 15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    noise.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
    return;
  }

  if (sound.type === "WAVE" && sound.wave) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const real = new Float32Array(17);
    const imag = new Float32Array(17);

    for (let i = 0; i < 16; i += 1) {
      real[i] = (sound.wave.waveData[i] - 7.5) / 7.5;
    }

    const wave = ctx.createPeriodicWave(real, imag);
    osc.setPeriodicWave(wave);
    osc.frequency.setValueAtTime(131072 / (2048 - sound.wave.frequency), now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.3);
  }
};
