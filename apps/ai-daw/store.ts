import { create } from 'zustand';
import { NoiseType, OrbitItem } from '@orbit/core';
import { AppMode, Project, Track, Clip, AIGeneration, VisualAsset, PublishedItem, User, AudioPreset, BrainwaveState } from './types';
import { getAuthService, AuthConfig } from '@orbit/auth';

export const FREE_PRESET_LIMIT = 3;

interface DAWState {
  mode: AppMode;
  theme: 'dark' | 'light';
  project: Project;
  isPlaying: boolean;
  currentTime: number;
  zoom: number;
  selectedTrackId: string | null;
  aiQueue: AIGeneration[];
  visualAssets: VisualAsset[];
  publishingHistory: PublishedItem[];
  focusTimeRemaining: number;

  // Auth & Cloud State
  user: User | null;
  userPresets: AudioPreset[];
  premiumPacks: AudioPreset[];
  isSyncing: boolean;

  // High-level context sync
  activeSpace: string;
  orbitItems: OrbitItem[];

  setMode: (mode: AppMode) => void;
  toggleTheme: () => void;
  togglePlayback: () => void;
  setCurrentTime: (time: number) => void;
  setZoom: (zoom: number) => void;
  addTrack: (track: Track) => void;
  removeTrack: (id: string) => void;
  updateTrack: (id: string, updates: Partial<Track>) => void;
  addClip: (trackId: string, clip: Clip) => void;
  selectTrack: (id: string | null) => void;
  addToAIQueue: (gen: AIGeneration) => void;
  updateAIStatus: (id: string, updates: Partial<AIGeneration>) => void;
  addVisualAsset: (asset: VisualAsset) => void;
  addPublishedItem: (item: PublishedItem) => void;
  setFocusTime: (time: number) => void;
  getSuggestedPrompt: () => string;

  // Auth & Preset Actions
  setUser: (user: User | null) => void;
  savePreset: (preset: Omit<AudioPreset, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  deletePreset: (id: string) => Promise<void>;
  syncCloudData: () => Promise<void>;
  upgradeToPro: () => void;
  initializeAuth: (config: AuthConfig) => void;
}

const SPACE_SONIC_MAP: Record<string, string> = {
  'work': 'Deep focus audio with brown noise and atmospheric pads, optimized for coding at 120bpm',
  'home': 'Relaxing chillhop beat with dusty vinyl crackle and ethereal synth textures',
  'unknown': 'Neutral ambient soundscape with white noise and gentle frequency sweeps'
};

export const useStore = create<DAWState>((set, get) => ({
  mode: AppMode.STUDIO,
  theme: 'dark',
  project: {
    id: '1',
    name: 'Untitled Project',
    bpm: 120,
    tracks: [
      { id: 'master', name: 'Master', type: 'audio', color: '#ffcc00', muted: false, soloed: false, volume: 0.8, pan: 0, clips: [] },
      { id: 'track-1', name: 'Audio Track 1', type: 'audio', color: '#3b82f6', muted: false, soloed: false, volume: 0.7, pan: 0, clips: [] },
      { id: 'track-2', name: 'AI Synthesis', type: 'ai', color: '#22d3ee', muted: false, soloed: false, volume: 0.8, pan: 0, clips: [] }
    ],
  },
  isPlaying: false,
  currentTime: 0,
  zoom: 10,
  selectedTrackId: 'track-1',
  aiQueue: [],
  visualAssets: [],
  publishingHistory: [],
  focusTimeRemaining: 25 * 60,

  user: null,
  userPresets: [],
  premiumPacks: [
    { id: 'p1', name: 'Zen Master Meditation', noiseType: 'pink', brainwaveState: BrainwaveState.THETA, carrierFreq: 432, timerMinutes: 45, isPremium: true, packName: 'Nirvana Pack', createdAt: '' },
    { id: 'p2', name: 'Deep Work Flow', noiseType: 'brown', brainwaveState: BrainwaveState.BETA, carrierFreq: 220, timerMinutes: 90, isPremium: true, packName: 'Focus Pro', createdAt: '' },
    { id: 'p3', name: 'Lucid Dream Engine', noiseType: 'white', brainwaveState: BrainwaveState.GAMMA, carrierFreq: 528, timerMinutes: 120, isPremium: true, packName: 'Dreamscape', createdAt: '' }
  ],
  isSyncing: false,
  activeSpace: 'home',
  orbitItems: [],

  setMode: (mode) => set({ mode }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setCurrentTime: (time) => set({ currentTime: time }),
  setZoom: (zoom) => set({ zoom }),
  addTrack: (track) => set((state) => ({
    project: { ...state.project, tracks: [...state.project.tracks, track] }
  })),
  removeTrack: (id) => set((state) => ({
    project: { ...state.project, tracks: state.project.tracks.filter(t => t.id !== id) }
  })),
  updateTrack: (id, updates) => set((state) => ({
    project: {
      ...state.project,
      tracks: state.project.tracks.map(t => t.id === id ? { ...t, ...updates } : t)
    }
  })),
  addClip: (trackId, clip) => set((state) => ({
    project: {
      ...state.project,
      tracks: state.project.tracks.map(t => t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t)
    }
  })),
  selectTrack: (id) => set({ selectedTrackId: id }),
  addToAIQueue: (gen) => set((state) => ({ aiQueue: [...state.aiQueue, gen] })),
  updateAIStatus: (id, updates) => set((state) => ({
    aiQueue: state.aiQueue.map(g => g.id === id ? { ...g, ...updates } : g)
  })),
  addVisualAsset: (asset) => set((state) => ({ visualAssets: [asset, ...state.visualAssets] })),
  addPublishedItem: (item) => set((state) => ({ publishingHistory: [item, ...state.publishingHistory] })),
  setFocusTime: (time) => set({ focusTimeRemaining: time }),

  setUser: (user) => {
    set({ user });
  },

  initializeAuth: (config) => {
    const authService = getAuthService(config);
    if (!authService) return;

    authService.onUserChange((orbitUser) => {
      if (orbitUser) {
        set({ user: { id: orbitUser.uid, name: 'Orbit User', email: '', isPro: orbitUser.isPro, tier: orbitUser.tier } });

        // Subscribe to presets
        authService.subscribeToState<AudioPreset[]>({ collection: 'presets' }, (presets) => {
          set({ userPresets: presets });
        });

        // Subscribe to Orbit Context (Brain sync)
        authService.subscribeToState<{ items: OrbitItem[], activeSpace: string }>({ collection: 'orbits' }, (data) => {
          if (data) {
            const prevSpace = get().activeSpace;
            const newSpace = data.activeSpace || 'home';

            set({
              orbitItems: data.items || [],
              activeSpace: newSpace
            });

            if (prevSpace !== newSpace) {
              console.log(`[AI-DAW] Space Shift: ${prevSpace} -> ${newSpace}`);
              // We could trigger a toast or auto-fill AIPanel here if we pass a callback
            }
          }
        });
      } else {
        set({ user: null, userPresets: [], orbitItems: [], activeSpace: 'home' });
      }
    });

    set({ isSyncing: false });
  },

  getSuggestedPrompt: () => {
    const space = get().activeSpace;
    return SPACE_SONIC_MAP[space] || SPACE_SONIC_MAP['unknown'];
  },

  savePreset: async (presetData) => {
    const { user, userPresets } = get();
    if (!user) return { success: false, error: 'Sign in required' };

    if (user.tier === 'free' && userPresets.length >= FREE_PRESET_LIMIT) {
      return { success: false, error: 'Preset limit reached. Upgrade to Pro for unlimited slots!' };
    }

    set({ isSyncing: true });

    const newPreset: AudioPreset = {
      ...presetData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };

    const updatedPresets = [newPreset, ...userPresets];
    set({ userPresets: updatedPresets });

    const authService = getAuthService();
    if (authService) {
      await authService.syncState(updatedPresets, { collection: 'presets' });
    }

    set({ isSyncing: false });
    return { success: true };
  },

  deletePreset: async (id) => {
    const { user } = get();
    if (!user) return;
    set({ isSyncing: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set((state) => ({
      userPresets: state.userPresets.filter(p => p.id !== id),
      isSyncing: false
    }));
    const cloudKey = `orbit_presets_${user.id}`;
    const existing = JSON.parse(localStorage.getItem(cloudKey) || '[]');
    localStorage.setItem(cloudKey, JSON.stringify(existing.filter((p: any) => p.id !== id)));
  },

  syncCloudData: async () => {
    const { user } = get();
    if (!user) return;
    set({ isSyncing: true });
    await new Promise(resolve => setTimeout(resolve, 1200));
    const cloudKey = `orbit_presets_${user.id}`;
    const data = JSON.parse(localStorage.getItem(cloudKey) || '[]');
    set({ userPresets: data, isSyncing: false });
  },

  upgradeToPro: () => {
    const { user } = get();
    if (!user) return;
    set({ user: { ...user, isPro: true, tier: 'pro' } });
  }
}));
