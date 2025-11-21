export enum StrokeState {
  Intake = 'INTAKE',
  Compression = 'COMPRESSION',
  Power = 'POWER',
  Exhaust = 'EXHAUST'
}

export interface EngineState {
  angle: number; // In radians, 0 to 4PI (720 degrees)
  isPlaying: boolean;
  speed: number; // Multiplier for animation speed
}

export interface StrokeInfo {
  id: StrokeState;
  title: string;
  description: string;
  color: string;
  startAngle: number; // Degrees
  endAngle: number;   // Degrees
}