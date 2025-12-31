import { ReactNode } from 'react';

export type NoiseType = 'white' | 'pink' | 'brown';

export type BrainwaveState = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';

export type AppView = 'player' | 'presets' | 'zen' | 'settings' | 'modes';

export interface ToneConfig {
  frequency: number;
  carrierFrequency: number;
  waveform: OscillatorType;
  volume: number;
}

export interface SessionPreset {
  id: string;
  name: string;
  description: string;
  icon: string | ReactNode;
  category: 'focus' | 'sleep' | 'relax' | 'energy';
  isPremium?: boolean;
  settings: {
    noise: {
      enabled: boolean;
      type: NoiseType;
      volume: number;
    };
    tone: {
      enabled: boolean;
      brainwaveState: BrainwaveState;
      frequency: number;
      volume: number;
      type: 'isochronic' | 'binaural';
    };
    effects: {
      eightD: boolean;
      lofi: boolean;
      crackles: number;
      pops: number;
      echo: number;
      reverb: number;
      distortion: number;
    };
    duration: number;
    fadeIn: number;
    fadeOut: number;
  };
}
