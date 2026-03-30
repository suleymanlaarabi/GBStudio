export type SoundChannelType = "PULSE1" | "PULSE2" | "WAVE" | "NOISE";

export interface Pulse1Channel {
  sweepTime: number; // 0-7
  sweepDirection: "UP" | "DOWN";
  sweepShift: number; // 0-7
  duty: 0 | 1 | 2 | 3; // 12.5%, 25%, 50%, 75%
  length: number; // 0-63
  initialVolume: number; // 0-15
  envelopeDirection: "UP" | "DOWN";
  envelopeSweep: number; // 0-7
  frequency: number; // 0-2047
}

export interface Pulse2Channel {
  duty: 0 | 1 | 2 | 3;
  length: number;
  initialVolume: number;
  envelopeDirection: "UP" | "DOWN";
  envelopeSweep: number;
  frequency: number;
}

export interface WaveChannel {
  dacEnabled: boolean;
  length: number; // 0-255
  volumeCode: 0 | 1 | 2 | 3; // 0%, 100%, 50%, 25%
  frequency: number; // 0-2047
  waveData: number[]; // 32 nibbles (0-15)
}

export interface NoiseChannel {
  length: number; // 0-63
  initialVolume: number; // 0-15
  envelopeDirection: "UP" | "DOWN";
  envelopeSweep: number; // 0-7
  shiftClockFrequency: number; // 0-15
  counterStep: 0 | 1; // 0=15-bit, 1=7-bit
  dividingRatio: number; // 0-7
}

export interface SoundAsset {
  id: string;
  name: string;
  type: SoundChannelType;
  pulse1?: Pulse1Channel;
  pulse2?: Pulse2Channel;
  wave?: WaveChannel;
  noise?: NoiseChannel;
}
