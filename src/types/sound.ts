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
