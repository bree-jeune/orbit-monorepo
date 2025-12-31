
export type NoiseType = 'white' | 'pink' | 'brown';

export enum AppMode {
  STUDIO = 'STUDIO',
  FOCUS = 'FOCUS',
  ZEN = 'ZEN'
}

export type TrackType = 'audio' | 'ai' | 'noise' | 'tone';

export interface Clip {
  id: string;
  name: string;
  startTime: number; // in seconds
  duration: number;
  color: string;
  blob?: Blob;
  buffer?: AudioBuffer;
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  color: string;
  muted: boolean;
  soloed: boolean;
  volume: number; // 0-1
  pan: number; // -1 to 1
  clips: Clip[];
}

export interface Project {
  id: string;
  name: string;
  bpm: number;
  tracks: Track[];
}

export interface AIGeneration {
  id: string;
  prompt: string;
  type: 'audio' | 'image' | 'video';
  status: 'pending' | 'processing' | 'complete' | 'failed';
  progress: number;
  resultUrl?: string;
}

export enum BrainwaveState {
  DELTA = 'DELTA',
  THETA = 'THETA',
  ALPHA = 'ALPHA',
  BETA = 'BETA',
  GAMMA = 'GAMMA'
}

export const BRAINWAVE_DATA: Record<BrainwaveState, { range: string; desc: string; freq: number; color: string }> = {
  [BrainwaveState.DELTA]: { range: '0.5-4Hz', desc: 'Deep sleep, healing, and restorative rest', freq: 2, color: '#6366f1' },
  [BrainwaveState.THETA]: { range: '4-8Hz', desc: 'Deep meditation, creativity, and REM sleep', freq: 6, color: '#8b5cf6' },
  [BrainwaveState.ALPHA]: { range: '8-13Hz', desc: 'Relaxed focus and light meditation', freq: 10, color: '#14b8a6' },
  [BrainwaveState.BETA]: { range: '13-30Hz', desc: 'Active thinking, focus, and alertness', freq: 20, color: '#f59e0b' },
  [BrainwaveState.GAMMA]: { range: '30-100Hz', desc: 'Peak performance and problem solving', freq: 40, color: '#ef4444' }
};

export type SocialPlatform = 'youtube' | 'tiktok' | 'instagram' | 'x' | 'facebook' | 'spotify';

export interface VisualAsset {
  id: string;
  type: 'image' | 'video' | 'visualizer';
  url: string;
  prompt?: string;
}

export interface PlatformStat {
  platform: SocialPlatform;
  views: number;
  likes: number;
  url: string;
}

export interface PublishedItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishDate: string;
  status: 'published' | 'scheduled' | 'failed';
  stats: PlatformStat[];
}

export interface PlatformMetadata {
  title: string;
  description: string;
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted';
  scheduledTime?: string;
}

export interface AudioPreset {
  id: string;
  name: string;
  noiseType: 'white' | 'pink' | 'brown' | null;
  brainwaveState: BrainwaveState | null;
  toneType?: 'isochronic' | 'binaural';
  carrierFreq: number;
  timerMinutes: number;
  createdAt: string;
  isPremium?: boolean;
  packName?: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isPro: boolean;
  tier: 'free' | 'pro';
}
