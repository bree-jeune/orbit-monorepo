import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NoiseType, OrbitItem } from '@orbit/core';
import { AppView, BrainwaveState, SessionPreset } from '../types';
import { getAuthService, AuthConfig } from '@orbit/auth';

interface UserPreset extends SessionPreset {
  isCloudSynced?: boolean;
  createdAt: number;
}

interface AppState {
  // UI State
  view: AppView;
  setView: (view: AppView) => void;
  isAiGenerating: boolean;
  setIsAiGenerating: (val: boolean) => void;
  isPro: boolean;
  setIsPro: (val: boolean) => void;

  // Audio State
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  noiseEnabled: boolean;
  setNoiseEnabled: (enabled: boolean) => void;
  noiseType: NoiseType;
  setNoiseType: (type: NoiseType) => void;
  noiseVolume: number;
  setNoiseVolume: (vol: number) => void;

  toneEnabled: boolean;
  setToneEnabled: (enabled: boolean) => void;
  toneType: 'isochronic' | 'binaural';
  setToneType: (type: 'isochronic' | 'binaural') => void;
  brainwaveState: BrainwaveState;
  setBrainwaveState: (state: BrainwaveState) => void;
  toneFrequency: number;
  setToneFrequency: (freq: number) => void;
  toneVolume: number;
  setToneVolume: (vol: number) => void;

  // New Effects State
  is8DActive: boolean;
  setIs8DActive: (val: boolean) => void;
  lofiActive: boolean;
  setLofiActive: (val: boolean) => void;
  lofiCrackleVolume: number;
  setLofiCrackleVolume: (vol: number) => void;
  lofiPopIntensity: number;
  setLofiPopIntensity: (val: number) => void;
  echoVolume: number;
  setEchoVolume: (val: number) => void;
  reverbVolume: number;
  setReverbVolume: (val: number) => void;
  distortionAmount: number;
  setDistortionAmount: (val: number) => void;

  masterVolume: number;
  setMasterVolume: (vol: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  fadeLevel: number;
  setFadeLevel: (level: number) => void;

  // Session State
  duration: number;
  setDuration: (dur: number) => void;
  timeRemaining: number;
  setTimeRemaining: (time: number) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  fadeInDuration: number;
  setFadeInDuration: (dur: number) => void;
  fadeOutDuration: number;
  setFadeOutDuration: (dur: number) => void;

  // User/Cloud Data
  userPresets: UserPreset[];
  savePreset: (name: string) => boolean;
  deletePreset: (id: string) => void;
  initializeAuth: (config: AuthConfig) => void;

  // High-level context sync
  activeSpace: string;
  orbitItems: OrbitItem[];
  getSuggestedPresetId: () => string;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: 'player',
      setView: (view) => set({ view }),
      isAiGenerating: false,
      setIsAiGenerating: (isAiGenerating) => set({ isAiGenerating }),
      isPro: false,
      setIsPro: (isPro) => set({ isPro }),

      isPlaying: false,
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      noiseEnabled: true,
      setNoiseEnabled: (noiseEnabled) => set({ noiseEnabled }),
      noiseType: 'pink',
      setNoiseType: (noiseType) => set({ noiseType }),
      noiseVolume: 0.5,
      setNoiseVolume: (noiseVolume) => set({ noiseVolume }),

      toneEnabled: false,
      setToneEnabled: (toneEnabled) => set({ toneEnabled }),
      toneType: 'isochronic',
      setToneType: (toneType) => set({ toneType }),
      brainwaveState: 'alpha',
      setBrainwaveState: (brainwaveState) => set({ brainwaveState }),
      toneFrequency: 10,
      setToneFrequency: (toneFrequency) => set({ toneFrequency }),
      toneVolume: 0.3,
      setToneVolume: (toneVolume) => set({ toneVolume }),

      is8DActive: false,
      setIs8DActive: (is8DActive) => set({ is8DActive }),
      lofiActive: false,
      setLofiActive: (lofiActive) => set({ lofiActive }),
      lofiCrackleVolume: 0.2,
      setLofiCrackleVolume: (lofiCrackleVolume) => set({ lofiCrackleVolume }),
      lofiPopIntensity: 0.3,
      setLofiPopIntensity: (lofiPopIntensity) => set({ lofiPopIntensity }),
      echoVolume: 0,
      setEchoVolume: (echoVolume) => set({ echoVolume }),
      reverbVolume: 0,
      setReverbVolume: (reverbVolume) => set({ reverbVolume }),
      distortionAmount: 0,
      setDistortionAmount: (distortionAmount) => set({ distortionAmount }),

      masterVolume: 0.8,
      setMasterVolume: (masterVolume) => set({ masterVolume }),
      isMuted: false,
      setIsMuted: (isMuted) => set({ isMuted }),
      fadeLevel: 1,
      setFadeLevel: (fadeLevel) => set({ fadeLevel }),

      duration: 30 * 60,
      setDuration: (duration) => set({ duration }),
      timeRemaining: 30 * 60,
      setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
      isRunning: false,
      setIsRunning: (isRunning) => set({ isRunning }),
      fadeInDuration: 30,
      setFadeInDuration: (fadeInDuration) => set({ fadeInDuration }),
      fadeOutDuration: 60,
      setFadeOutDuration: (fadeOutDuration) => set({ fadeOutDuration }),

      userPresets: [],
      activeSpace: 'home',
      orbitItems: [],

      initializeAuth: (config) => {
        const authService = getAuthService(config);
        if (!authService) return;

        authService.onUserChange((user) => {
          if (user) {
            authService.subscribeToState<UserPreset[]>({ collection: 'presets' }, (presets) => {
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
                  console.log(`[Focus-Timer] Space Shift: ${prevSpace} -> ${newSpace}`);
                }
              }
            });
          } else {
            set({ userPresets: [], orbitItems: [], activeSpace: 'home' });
          }
        });
      },

      savePreset: (name) => {
        const state = get();
        if (!state.isPro && state.userPresets.length >= 3) return false;

        const newPreset: UserPreset = {
          id: `user-${Date.now()}`,
          name,
          description: `Custom ${state.noiseType} soundscape with ${state.toneFrequency}Hz ${state.brainwaveState} tones.`,
          icon: '✨',
          category: 'focus',
          createdAt: Date.now(),
          isCloudSynced: true,
          settings: {
            noise: { enabled: state.noiseEnabled, type: state.noiseType, volume: state.noiseVolume },
            tone: {
              enabled: state.toneEnabled,
              brainwaveState: state.brainwaveState,
              frequency: state.toneFrequency,
              volume: state.toneVolume,
              type: state.toneType
            },
            effects: {
              eightD: state.is8DActive,
              lofi: state.lofiActive,
              crackles: state.lofiCrackleVolume,
              pops: state.lofiPopIntensity,
              echo: state.echoVolume,
              reverb: state.reverbVolume,
              distortion: state.distortionAmount
            },
            duration: state.duration,
            fadeIn: state.fadeInDuration,
            fadeOut: state.fadeOutDuration,
          }
        };
        const updatedPresets = [newPreset, ...state.userPresets];
        set({ userPresets: updatedPresets });

        const authService = getAuthService();
        if (authService) {
          authService.syncState(updatedPresets, { collection: 'presets' });
        }

        return true;
      },
      deletePreset: (id) => set({ userPresets: get().userPresets.filter(p => p.id !== id) }),

      getSuggestedPresetId: () => {
        const space = get().activeSpace;
        if (space === 'work') return 'deep-work';
        if (space === 'home') return 'lofi-library';
        return 'lofi-library'; // Default
      }
    }),
    {
      name: 'orbitaudio-storage-v4',
      partialize: (state) => ({
        isPro: state.isPro,
        noiseType: state.noiseType,
        noiseVolume: state.noiseVolume,
        toneFrequency: state.toneFrequency,
        toneVolume: state.toneVolume,
        masterVolume: state.masterVolume,
        duration: state.duration,
        fadeInDuration: state.fadeInDuration,
        fadeOutDuration: state.fadeOutDuration,
        brainwaveState: state.brainwaveState,
        toneType: state.toneType,
        userPresets: state.userPresets,
        is8DActive: state.is8DActive,
        lofiActive: state.lofiActive,
        lofiCrackleVolume: state.lofiCrackleVolume,
        lofiPopIntensity: state.lofiPopIntensity,
        echoVolume: state.echoVolume,
        reverbVolume: state.reverbVolume,
        distortionAmount: state.distortionAmount,
        isMuted: state.isMuted
      }),
    }
  )
);
