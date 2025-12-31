
import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from './stores/useStore';
import { TimerDisplay } from './components/session/TimerDisplay';
import { Visualizer } from './components/audio/Visualizer';
import { Slider } from './components/ui/Slider';
import { BUILT_IN_PRESETS, BRAINWAVE_STATES } from './constants';
import { audioEngine } from '@orbit/core';
import { GoogleGenAI, Type } from "@google/genai";
import { SessionPreset, BrainwaveState as BrainwaveStateType } from './types';
import { DeltaIcon, ThetaIcon, AlphaIcon, BetaIcon, GammaIcon } from './components/ui/BrainwaveIcons';
import { BrandIcon } from '@orbit/ui';
import { motion, AnimatePresence } from 'framer-motion';

const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "orbit-audio.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "orbit-audio",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "orbit-audio.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};
import {
  Layout,
  ChevronLeft,
  Volume2,
  Download,
  Moon,
  Sparkles,
  Cloud,
  Save,
  Trash2,
  User,
  Zap,
  Info,
  Lock,
  Crown,
  X,
  Radio,
  RotateCw,
  Clock,
  Music4,
  Activity,
  Wind,
  Waves
} from 'lucide-react';

const RenderBrainwaveIcon = ({ state, color, className = "w-6 h-6" }: { state: BrainwaveStateType, color?: string, className?: string }) => {
  switch (state) {
    case 'delta': return <DeltaIcon className={className} color={color} />;
    case 'theta': return <ThetaIcon className={className} color={color} />;
    case 'alpha': return <AlphaIcon className={className} color={color} />;
    case 'beta': return <BetaIcon className={className} color={color} />;
    case 'gamma': return <GammaIcon className={className} color={color} />;
    default: return null;
  }
};

export default function App() {
  const {
    view, setView, masterVolume, setMasterVolume, noiseType, noiseVolume, toneFrequency,
    toneVolume, toneType, setToneType, duration, setTimeRemaining, setDuration, setIsRunning,
    setNoiseEnabled, setNoiseType, setNoiseVolume, setToneEnabled, setBrainwaveState,
    setToneFrequency, setToneVolume, setFadeInDuration, setFadeOutDuration,
    userPresets, savePreset, deletePreset, isAiGenerating, setIsAiGenerating,
    isPro, setIsPro,
    is8DActive, setIs8DActive,
    lofiActive, setLofiActive,
    lofiCrackleVolume, setLofiCrackleVolume,
    lofiPopIntensity, setLofiPopIntensity,
    echoVolume, setEchoVolume,
    reverbVolume, setReverbVolume,
    distortionAmount, setDistortionAmount,
    isMuted, setIsMuted,
    isPlaying, noiseEnabled, toneEnabled,
    initializeAuth,
    activeSpace, getSuggestedPresetId
  } = useStore();

  useEffect(() => {
    initializeAuth(FIREBASE_CONFIG);
  }, [initializeAuth]);

  const [aiPrompt, setAiPrompt] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    audioEngine.setMasterVolume(masterVolume, isMuted);
  }, [masterVolume, isMuted]);



  useEffect(() => {
    if (!isPlaying) return;
    if (noiseEnabled) {
      audioEngine.startNoise(noiseType, noiseVolume);
    } else {
      audioEngine.stopNoise();
    }
  }, [isPlaying, noiseEnabled, noiseType, noiseVolume]);

  useEffect(() => {
    if (!isPlaying) return;
    if (toneEnabled) {
      audioEngine.startTone(toneFrequency, toneVolume, toneType);
    } else {
      audioEngine.stopTone();
    }
  }, [isPlaying, toneEnabled, toneFrequency, toneVolume, toneType]);

  useEffect(() => {
    audioEngine.set8DActive(is8DActive);
  }, [is8DActive]);

  useEffect(() => {
    audioEngine.setLofiActive(lofiActive, lofiCrackleVolume);
    audioEngine.setLofiPopIntensity(lofiPopIntensity);
  }, [lofiActive, lofiCrackleVolume, lofiPopIntensity]);

  useEffect(() => {
    audioEngine.setEchoVolume(echoVolume);
  }, [echoVolume]);

  useEffect(() => {
    audioEngine.setReverbVolume(reverbVolume);
  }, [reverbVolume]);

  useEffect(() => {
    audioEngine.setDistortionAmount(distortionAmount);
  }, [distortionAmount]);

  const handleExport = async () => {
    const exportDur = isPro ? 3600 : 60;
    const blob = await audioEngine.exportAsWav(noiseType, noiseVolume, toneFrequency, toneVolume, exportDur, toneType);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbitaudio-${isPro ? 'pro' : 'free'}-export.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Fixed type from any to SessionPreset | undefined to support safe application of presets
  const applyPreset = (preset: SessionPreset | undefined) => {
    if (!preset) return;
    if (preset.isPremium && !isPro) {
      setShowPaywall(true);
      return;
    }
    setNoiseEnabled(preset.settings.noise.enabled);
    setNoiseType(preset.settings.noise.type);
    setNoiseVolume(preset.settings.noise.volume);

    setToneEnabled(preset.settings.tone.enabled);
    setBrainwaveState(preset.settings.tone.brainwaveState);
    setToneFrequency(preset.settings.tone.frequency);
    setToneVolume(preset.settings.tone.volume);
    setToneType(preset.settings.tone.type || 'isochronic');

    setIs8DActive(preset.settings.effects?.eightD || false);
    setLofiActive(preset.settings.effects?.lofi || false);
    setLofiCrackleVolume(preset.settings.effects?.crackles || 0.2);
    setLofiPopIntensity(preset.settings.effects?.pops || 0.3);
    setEchoVolume(preset.settings.effects?.echo || 0);
    setReverbVolume(preset.settings.effects?.reverb || 0);
    setDistortionAmount(preset.settings.effects?.distortion || 0);

    setDuration(preset.settings.duration);
    setTimeRemaining(preset.settings.duration);
    setFadeInDuration(preset.settings.fadeIn);
    setFadeOutDuration(preset.settings.fadeOut);
    setIsRunning(false);
    setView('player');
    setProfileOpen(false);
  };

  const handleSavePreset = () => {
    const name = prompt('Name your custom soundscape:');
    if (!name) return;
    const success = savePreset(name);
    if (!success) setShowPaywall(true);
  };

  const handleGenerateAiSoundscape = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
      const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
      if (!apiKey) {
        throw new Error("Gemini API Key (VITE_GEMINI_API_KEY) not found. Please check your .env.local file.");
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Create an audio configuration for OrbitAudio Focus based on this prompt: "${aiPrompt}". 
        Be creative and map the atmospheric description into technical parameters.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              noiseType: { type: Type.STRING, enum: ['white', 'pink', 'brown'] },
              noiseVolume: { type: Type.NUMBER },
              brainwaveState: { type: Type.STRING, enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
              toneFrequency: { type: Type.NUMBER },
              toneVolume: { type: Type.NUMBER },
              eightD: { type: Type.BOOLEAN },
              lofi: { type: Type.BOOLEAN },
              echo: { type: Type.NUMBER },
              reverb: { type: Type.NUMBER },
              distortion: { type: Type.NUMBER },
              crackles: { type: Type.NUMBER },
              pops: { type: Type.NUMBER }
            },
            required: ['noiseType', 'noiseVolume', 'brainwaveState', 'toneFrequency', 'toneVolume']
          }
        }
      });
      const config = JSON.parse(response.text);
      setNoiseType(config.noiseType);
      setNoiseVolume(config.noiseVolume);
      setBrainwaveState(config.brainwaveState);
      setToneFrequency(config.toneFrequency);
      setToneVolume(config.toneVolume);
      setIs8DActive(config.eightD || false);
      setLofiActive(config.lofi || false);
      setEchoVolume(config.echo || 0);
      setReverbVolume(config.reverb || 0);
      setDistortionAmount(config.distortion || 0);
      setLofiCrackleVolume(config.crackles || 0.2);
      setLofiPopIntensity(config.pops || 0.3);
      setNoiseEnabled(true);
      setToneEnabled(true);
      setIsRunning(false);
      setView('player');
      setAiPrompt('');
    } catch (e) { console.error(e); } finally { setIsAiGenerating(false); }
  };

  return (
    <div className="min-h-screen bg-space-950 text-text-primary flex flex-col font-body selection:bg-nebula-500/30 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-nebula-600/10 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-aurora-600/10 blur-[100px]" />
      </div>

      {/* Header - Refined Navigation */}
      <header className="p-4 md:p-6 flex items-center justify-between z-50 glass sticky top-0 border-b border-white/5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => setView('player')}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-nebula-500/20 to-aurora-500/20 border border-white/10 flex items-center justify-center relative shadow-xl group-hover:scale-105 transition-all">
            {isPro && <Crown size={12} className="absolute -top-2 -right-2 text-amber-400 fill-amber-400 drop-shadow-glow" />}
            <BrandIcon className="w-8 h-8 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight leading-none">ORBITAUDIO</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] text-text-tertiary uppercase tracking-[0.3em] font-bold">Focus & Flow Engine</p>
              <div className="h-2 w-px bg-white/10" />
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-aurora-500/10 border border-aurora-500/20 rounded-full">
                <div className="w-1 h-1 rounded-full bg-aurora-500 animate-pulse" />
                <span className="text-[9px] font-black text-aurora-500 uppercase tracking-tighter">{activeSpace}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <nav className="flex items-center gap-2 md:gap-4">
          <AnimatePresence>
            {!isPro && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setShowPaywall(true)}
                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-[10px] font-bold hover:bg-amber-500/20 transition-all uppercase tracking-widest"
              >
                <Crown size={12} /> Pro Upgrade
              </motion.button>
            )}
          </AnimatePresence>
          <div className="h-8 w-px bg-white/5 mx-2 hidden md:block" />
          <NavButton active={view === 'modes'} onClick={() => setView('modes')} icon={<Radio size={20} />} label="Modes" />
          <NavButton active={view === 'presets'} onClick={() => setView('presets')} icon={<Layout size={20} />} label="Library" />
          <NavButton active={false} onClick={() => setView('zen')} icon={<Moon size={20} />} label="Zen" />
          <NavButton active={profileOpen} onClick={() => setProfileOpen(!profileOpen)} icon={<User size={20} />} label="Profile" />
        </nav>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 pb-32 overflow-y-auto pt-8 z-10 scrollbar-hide">
        <AnimatePresence mode="wait">
          {view === 'player' && (
            <motion.div
              key="player"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
            >
              {/* Left Column - Main Timer & High Level Controls */}
              <div className="lg:col-span-5 flex flex-col gap-10">
                <section className="glass rounded-[3rem] p-10 flex flex-col items-center nebula-glow relative overflow-hidden group">
                  <div className="absolute inset-0 bg-nebula-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <TimerDisplay />
                </section>

                <section className="glass rounded-3xl p-8 space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em]">
                      <span>Master Amplitude</span>
                      <span className="text-text-primary font-mono">{Math.round(masterVolume * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-2 rounded-lg transition-colors ${isMuted ? 'bg-red-500/10 text-red-500' : 'text-text-tertiary hover:text-white'}`}
                      >
                        <Volume2 size={18} />
                      </button>
                      <Slider value={masterVolume} onChange={setMasterVolume} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <ActionButton onClick={handleExport} icon={<Download size={16} />} label={isPro ? "Export HQ" : "Export Clip"} />
                    <ActionButton onClick={handleSavePreset} icon={<Save size={16} />} label="Sync Settings" variant="accent" />
                  </div>
                </section>

                <motion.section
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-nebula-900/40 via-space-800 to-space-800 rounded-3xl p-8 border border-nebula-500/20 cursor-pointer group"
                  onClick={() => setView('presets')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-nebula-500/20 text-nebula-400 rounded-lg">
                        <Sparkles size={20} />
                      </div>
                      <span className="text-lg font-bold">Soundscape AI</span>
                    </div>
                    <Zap size={14} className="text-text-tertiary group-hover:text-nebula-400 transition-colors" />
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">Describe an environment and let our neural engine synthesize the perfect frequency mix.</p>
                </motion.section>
              </div>

              {/* Right Column - Deep Controls */}
              <div className="lg:col-span-7 flex flex-col gap-10">
                <NoiseSelector />
                <BrainwaveSelector />

                {/* Visualizer & Effects Section */}
                <section className="glass rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em]">Atmospheric Filters</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ModifierCard
                      active={is8DActive}
                      onClick={() => setIs8DActive(!is8DActive)}
                      icon={<RotateCw size={20} className={is8DActive ? "animate-spin" : ""} style={{ animationDuration: '6s' }} />}
                      label="8D Spatial"
                      desc="Dynamic circular panning"
                    />
                    <ModifierCard
                      active={lofiActive}
                      onClick={() => setLofiActive(!lofiActive)}
                      icon={<Music4 size={20} />}
                      label="Lo-Fi Flavor"
                      desc="Muffled vinyl character"
                    />
                    <ModifierCard
                      active={echoVolume > 0}
                      onClick={() => setEchoVolume(echoVolume > 0 ? 0 : 0.4)}
                      icon={<Activity size={20} />}
                      label="Neural Echo"
                      desc="Feedback delay loop"
                    />
                    <ModifierCard
                      active={reverbVolume > 0}
                      onClick={() => setReverbVolume(reverbVolume > 0 ? 0 : 0.4)}
                      icon={<Wind size={20} />}
                      label="Spatial Void"
                      desc="Deep acoustic resonance"
                    />
                  </div>

                  {(lofiActive || echoVolume > 0 || reverbVolume > 0 || distortionAmount > 0) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-6 border-t border-white/5 space-y-6"
                    >
                      {lofiActive && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                              <span>Dust & Crackle</span>
                              <span className="text-amber-500 font-mono">{Math.round(lofiCrackleVolume * 100)}%</span>
                            </div>
                            <Slider value={lofiCrackleVolume} onChange={setLofiCrackleVolume} color="var(--color-amber-500)" />
                          </div>
                          <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                              <span>Pop Intensity</span>
                              <span className="text-amber-500 font-mono">{Math.round(lofiPopIntensity * 100)}%</span>
                            </div>
                            <Slider value={lofiPopIntensity} onChange={setLofiPopIntensity} color="var(--color-amber-500)" />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {echoVolume > 0 && (
                          <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                              <span>Echo Feedback</span>
                              <span className="text-nebula-400 font-mono">{Math.round(echoVolume * 100)}%</span>
                            </div>
                            <Slider value={echoVolume} onChange={setEchoVolume} color="var(--color-nebula-400)" />
                          </div>
                        )}
                        {reverbVolume > 0 && (
                          <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                              <span>Reverb Depth</span>
                              <span className="text-aurora-400 font-mono">{Math.round(reverbVolume * 100)}%</span>
                            </div>
                            <Slider value={reverbVolume} onChange={setReverbVolume} color="var(--color-aurora-400)" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                          <span>Saturation Grit (Distortion)</span>
                          <span className="text-amber-500 font-mono">{Math.round(distortionAmount * 100)}%</span>
                        </div>
                        <Slider value={distortionAmount} onChange={setDistortionAmount} color="var(--color-amber-500)" />
                      </div>
                    </motion.div>
                  )}
                </section>
              </div>
            </motion.div>
          )}

          {view === 'modes' && (
            <motion.div
              key="modes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex items-center gap-6">
                <button onClick={() => setView('player')} className="p-4 rounded-2xl glass hover:bg-space-800 text-text-secondary transition-colors"><ChevronLeft size={24} /></button>
                <div>
                  <h2 className="text-4xl font-display font-bold tracking-tight">Smart Modes</h2>
                  <p className="text-text-secondary text-sm mt-1">Goal-oriented session presets designed by neuro-engineers.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ModeCard
                  name="Deep Focus"
                  icon={<Zap className="text-amber-400" size={28} />}
                  desc="High-intensity Beta protocol for analytical heavy lifting."
                  presetId="deep-work"
                  color="amber"
                  onApply={applyPreset}
                />
                <ModeCard
                  name="Ethereal Chill"
                  icon={<Music4 className="text-nebula-400" size={28} />}
                  desc="Relaxed Alpha flow with warm Lo-Fi characteristics."
                  presetId="lofi-library"
                  color="nebula"
                  onApply={applyPreset}
                />
                <ModeCard
                  name="Astral Rest"
                  icon={<Clock className="text-aurora-400" size={28} />}
                  desc="Deep Delta synchronization for restorative sleep cycles."
                  presetId="deep-sleep"
                  color="aurora"
                  onApply={applyPreset}
                />
              </div>
            </motion.div>
          )}

          {view === 'presets' && (
            <motion.div
              key="presets"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <button onClick={() => setView('player')} className="p-4 rounded-2xl glass hover:bg-space-800 text-text-secondary"><ChevronLeft size={24} /></button>
                  <h2 className="text-4xl font-display font-bold">Library</h2>
                </div>
              </div>

              {/* AI LAB UI REFINEMENT */}
              <section className="glass rounded-[2.5rem] p-10 border border-nebula-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-nebula-500/5 blur-[80px] -z-10" />
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="text-nebula-400" size={24} />
                  <h3 className="text-2xl font-bold">Synthesize from Prompt</h3>
                </div>
                <div className="relative group">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. 'A rainy late-night drive through a neon Tokyo district'..."
                    className="w-full bg-space-900/50 border border-white/5 rounded-3xl p-8 text-base focus:outline-none focus:border-nebula-500/50 transition-all min-h-[160px] resize-none glass group-hover:bg-space-900/80"
                  />
                  <button
                    onClick={handleGenerateAiSoundscape}
                    disabled={isAiGenerating || !aiPrompt.trim()}
                    className={`absolute bottom-6 right-6 px-10 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all ${isAiGenerating ? 'bg-space-700 text-text-tertiary' : 'bg-nebula-500 text-white shadow-xl shadow-nebula-500/20 hover:scale-105 active:scale-95'}`}
                  >
                    {isAiGenerating ? <><Zap className="animate-spin" size={18} /> Synthesizing...</> : <><Sparkles size={18} /> Generate Mix</>}
                  </button>
                  <button
                    onClick={() => {
                      const id = getSuggestedPresetId();
                      const preset = BUILT_IN_PRESETS.find(p => p.id === id);
                      if (preset) applyPreset(preset);
                    }}
                    className="absolute top-6 right-8 text-[10px] font-black uppercase text-aurora-400 hover:text-aurora-300 tracking-widest flex items-center gap-2 transition-all"
                  >
                    <Zap size={12} fill="currentColor" /> Switch to {activeSpace} preset
                  </button>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {BUILT_IN_PRESETS.map((p) => (
                  <PresetCard key={p.id} preset={p} isPro={isPro} onApply={applyPreset} />
                ))}
              </div>
            </motion.div>
          )}

          {view === 'zen' && (
            <motion.div
              key="zen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-space-950 z-[100] flex flex-col items-center justify-center p-10 text-center"
            >
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-nebula-500/10 blur-[150px] animate-pulse-slow" />
              </div>
              <TimerDisplay />
              <div className="mt-16 flex gap-8 relative z-10">
                <ZenToggle active={is8DActive} onClick={() => setIs8DActive(!is8DActive)} icon={<RotateCw size={28} className={is8DActive ? "animate-spin" : ""} style={{ animationDuration: '6s' }} />} color="nebula" />
                <ZenToggle active={lofiActive} onClick={() => setLofiActive(!lofiActive)} icon={<Music4 size={28} />} color="amber" />
              </div>
              <button
                onClick={() => setView('player')}
                className="mt-20 text-[10px] uppercase tracking-[0.5em] font-bold text-text-tertiary hover:text-white transition-all hover:scale-110 active:scale-95"
              >
                End Session
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Cloud Profile Sidebar */}
      <AnimatePresence>
        {profileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProfileOpen(false)}
              className="fixed inset-0 bg-space-950/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-80 md:w-96 glass z-[110] p-10 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-2xl font-bold flex items-center gap-3"><Cloud className="text-aurora-400" size={24} /> My Orbit</h3>
                <button onClick={() => setProfileOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <div className="mb-10 p-6 glass rounded-3xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-aurora-500" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Storage Capacity</span>
                  <span className="text-xs font-mono font-bold text-text-secondary">{userPresets.length} / {isPro ? '∞' : '3'}</span>
                </div>
                <div className="w-full h-1.5 bg-space-900 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (userPresets.length / (isPro ? 10 : 3)) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-aurora-600 to-aurora-400"
                  />
                </div>
                {!isPro && (
                  <button onClick={() => setShowPaywall(true)} className="w-full mt-8 py-3 bg-amber-500 text-space-950 text-[10px] font-bold rounded-xl hover:bg-amber-400 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-amber-500/10 uppercase tracking-widest">Expand Storage</button>
                )}
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto scrollbar-hide pr-2">
                {userPresets.map(up => (
                  <motion.div
                    layout
                    key={up.id}
                    className="glass rounded-2xl p-5 border border-white/5 group hover:border-aurora-500/30 transition-all cursor-pointer"
                    onClick={() => applyPreset(up)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm group-hover:text-aurora-400 transition-colors">{up.name}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deletePreset(up.id); }}
                        className="text-red-400/50 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-[10px] text-text-tertiary leading-relaxed mb-4">{up.description}</p>
                    <div className="flex items-center gap-2 text-[9px] text-aurora-400 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                      Restore <ChevronLeft className="rotate-180" size={10} />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-8 mt-auto">
                <button
                  onClick={() => setIsPro(!isPro)}
                  className="w-full py-4 glass rounded-2xl text-[9px] font-bold text-text-tertiary uppercase tracking-[0.2em] border border-white/5 hover:text-white hover:border-text-secondary transition-all"
                >
                  Simulation: {isPro ? 'Demote to Free' : 'Grant Pro Privileges'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Paywall Overlay */}
      <AnimatePresence>
        {showPaywall && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaywall(false)}
              className="absolute inset-0 bg-space-950/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass border border-amber-500/20 w-full max-w-lg rounded-[3.5rem] p-12 text-center relative shadow-2xl shadow-amber-500/10 z-[210] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
              <button onClick={() => setShowPaywall(false)} className="absolute top-8 right-8 text-text-tertiary hover:text-white transition-colors"><X size={24} /></button>

              <motion.div
                animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="w-20 h-20 bg-amber-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10"
              >
                <Crown className="text-amber-400" size={40} />
              </motion.div>

              <h3 className="text-3xl font-display font-bold mb-4 tracking-tight">Unlock Infinite Focus</h3>
              <p className="text-base text-text-secondary mb-10 leading-relaxed max-w-sm mx-auto">Access high-fidelity 8D effects, neural sync slots, and expert-tuned soundscape presets.</p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                {[
                  { icon: <Cloud size={16} />, title: 'Unlimited Slots', desc: 'Sync everything' },
                  { icon: <Download size={16} />, title: 'Pro Exports', desc: 'Unlimited WAVs' },
                  { icon: <Sparkles size={16} />, title: 'Neural Labs', desc: 'HQ AI Presets' },
                  { icon: <RotateCw size={16} />, title: '8D Spatial', desc: 'Full Immersion' }
                ].map((feat, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-5 glass rounded-3xl border border-white/5">
                    <span className="text-amber-400 mb-1">{feat.icon}</span>
                    <span className="text-[10px] font-bold text-text-primary uppercase tracking-tighter">{feat.title}</span>
                    <span className="text-[9px] text-text-tertiary uppercase">{feat.desc}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setIsPro(true); setShowPaywall(false); }}
                className="w-full py-5 bg-gradient-to-r from-amber-600 to-amber-400 text-space-950 font-bold rounded-2xl shadow-xl shadow-amber-500/40 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest"
              >
                Start Pro Membership
              </button>
              <p className="mt-5 text-[9px] text-text-tertiary uppercase tracking-[0.3em] font-bold">Standard Billing • Cancel Anytime</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global UI Footer */}
      <footer className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-white/5 z-40 overflow-hidden flex items-center">
        <div className="absolute inset-0 opacity-30">
          <Visualizer />
        </div>
        <div className="container mx-auto px-10 flex justify-between items-center relative z-10 pointer-events-none">
          <div className="hidden md:flex items-center gap-4">
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.4em]">Orbit Engine v1.1 Polished</p>
          </div>
          <div className="hidden lg:flex items-center gap-3 text-[9px] font-bold text-text-tertiary uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-aurora-500 animate-pulse" /> Neural Network Active</span>
            <div className="w-px h-3 bg-white/10" />
            <span>Encrypted Session Sync</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

{/* Styled UI Sub-Components */ }

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`p-3 md:p-4 rounded-2xl transition-all flex items-center gap-3 ${active ? 'bg-nebula-500 text-white shadow-xl shadow-nebula-500/20' : 'bg-space-800 text-text-tertiary hover:bg-space-700 hover:text-white'}`}
      title={label}
    >
      {icon}
      <span className="hidden xl:inline text-xs font-bold uppercase tracking-[0.1em]">{label}</span>
    </button>
  );
}

function ActionButton({ onClick, icon, label, variant = 'default' }: { onClick: () => void, icon: React.ReactNode, label: string, variant?: 'default' | 'accent' }) {
  return (
    <button
      onClick={onClick}
      className={`py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold transition-all shadow-sm active:scale-95 ${variant === 'accent'
        ? 'bg-aurora-500 text-space-950 hover:bg-aurora-400 hover:scale-105'
        : 'bg-space-700 hover:bg-space-600 text-text-primary border border-white/5'
        }`}
    >
      {icon} <span className="uppercase tracking-widest">{label}</span>
    </button>
  );
}

function ModifierCard({ active, onClick, icon, label, desc }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, desc: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-row items-center gap-5 p-6 rounded-3xl border-2 transition-all group text-left ${active
        ? 'border-nebula-500 bg-nebula-500/5 text-nebula-400 shadow-lg shadow-nebula-500/5'
        : 'border-white/5 bg-space-800 text-text-tertiary hover:border-white/10'
        }`}
    >
      <div className={`p-3 rounded-2xl transition-colors shadow-inner ${active ? 'bg-nebula-500 text-white' : 'bg-space-700'}`}>
        {icon}
      </div>
      <div>
        <span className="block text-xs font-bold uppercase tracking-widest">{label}</span>
        <span className="block text-[9px] text-text-tertiary mt-1 font-medium uppercase tracking-tighter">{desc}</span>
      </div>
    </button>
  );
}

function ZenToggle({ active, onClick, icon, color }: { active: boolean, onClick: () => void, icon: React.ReactNode, color: 'nebula' | 'amber' }) {
  const colorMap = {
    nebula: active ? 'bg-nebula-500 border-nebula-400 text-white shadow-nebula-500/50' : 'bg-space-800 border-white/10 text-text-tertiary',
    amber: active ? 'bg-amber-500 border-amber-400 text-space-950 shadow-amber-500/50' : 'bg-space-800 border-white/10 text-text-tertiary',
  };
  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
      className={`p-8 rounded-full border-2 transition-all shadow-2xl ${colorMap[color]}`}
    >
      {icon}
    </motion.button>
  );
}

// Added optional key to PresetCardProps to satisfy strict TypeScript checking when using the component in a .map() loop in App.tsx
interface PresetCardProps {
  preset: SessionPreset;
  isPro: boolean;
  onApply: (preset: SessionPreset) => void;
  key?: string | number;
}

function PresetCard({ preset, isPro, onApply }: PresetCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={() => onApply(preset)}
      className="glass border border-white/5 rounded-[2.5rem] p-8 cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden group h-full flex flex-col"
    >
      {preset.isPremium && !isPro && (
        <div className="absolute inset-0 bg-space-950/70 backdrop-blur-[6px] z-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-8">
          <div className="p-4 bg-amber-500 rounded-full mb-4 shadow-xl shadow-amber-500/20">
            <Lock className="text-space-950" size={24} />
          </div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.3em]">Premium Scene</span>
        </div>
      )}
      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 rounded-3xl bg-space-700 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
          {preset.icon}
        </div>
        <div className="flex items-center gap-3">
          {preset.isPremium && <span className="text-[9px] px-2 py-0.5 bg-amber-500 text-space-950 rounded font-bold uppercase tracking-tighter">Pro</span>}
          <span className="text-[10px] uppercase tracking-widest font-bold text-text-tertiary">{preset.category}</span>
        </div>
      </div>
      <h4 className="font-bold text-xl mb-3 group-hover:text-nebula-400 transition-colors tracking-tight">{preset.name}</h4>
      <p className="text-sm text-text-secondary leading-relaxed mb-8">{preset.description}</p>

      <div className="mt-auto flex items-center gap-2 text-[10px] font-bold text-nebula-400 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
        Initialize Orbit <ChevronLeft className="rotate-180" size={14} />
      </div>
    </motion.div>
  );
}

// Fixed ModeCard props type for consistency and type safety
interface ModeCardProps {
  name: string;
  icon: React.ReactNode;
  desc: string;
  presetId: string;
  color: 'amber' | 'nebula' | 'aurora';
  onApply: (p: SessionPreset | undefined) => void;
}

function ModeCard({ name, icon, desc, presetId, color, onApply }: ModeCardProps) {
  const colorMap = {
    amber: 'from-amber-500/20 to-transparent border-amber-500/20 text-amber-400 group-hover:border-amber-400/40',
    nebula: 'from-nebula-500/20 to-transparent border-nebula-500/20 text-nebula-400 group-hover:border-nebula-400/40',
    aurora: 'from-aurora-500/20 to-transparent border-aurora-500/20 text-aurora-400 group-hover:border-aurora-400/40',
  };
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      onClick={() => onApply(BUILT_IN_PRESETS.find(p => p.id === presetId))}
      className={`bg-gradient-to-b ${colorMap[color]} border-2 p-10 rounded-[3.5rem] cursor-pointer transition-all group h-full flex flex-col relative overflow-hidden`}
    >
      <div className="w-16 h-16 glass rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform shadow-2xl">
        {icon}
      </div>
      <h3 className="text-2xl font-display font-bold mb-4 tracking-tight">{name}</h3>
      <p className="text-sm text-text-secondary leading-relaxed mb-10 flex-1">{desc}</p>
      <div className="text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3">
        Launch Mode <ChevronLeft className="rotate-180" size={16} />
      </div>
    </motion.div>
  );
}

function NoiseSelector() {
  const { noiseType, setNoiseType, noiseVolume, setNoiseVolume, noiseEnabled, setNoiseEnabled } = useStore();
  return (
    <section className="glass rounded-[2.5rem] p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em]">Atmospheric Masking</h3>
          <div className="group relative">
            <Info size={14} className="text-text-tertiary cursor-help hover:text-nebula-400 transition-colors" />
            <div className="absolute left-0 bottom-full mb-3 w-64 p-4 bg-space-950 border border-white/10 rounded-2xl text-[10px] leading-relaxed text-text-secondary opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl backdrop-blur-xl">
              <p className="font-bold text-nebula-400 mb-1">What is this?</p>
              Masking uses steady background noise to drown out sudden environmental distractions and maintain neural flow states.
            </div>
          </div>
        </div>
        <button onClick={() => setNoiseEnabled(!noiseEnabled)} className={`px-4 py-1.5 rounded-xl text-[10px] font-bold tracking-widest transition-all ${noiseEnabled ? 'bg-nebula-500/20 text-nebula-400 border border-nebula-500/40 shadow-glow' : 'bg-space-800 text-text-tertiary'}`}>
          {noiseEnabled ? 'ACTIVE' : 'MUTED'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'white', name: 'White', desc: 'Full spectrum energy. Ideal for blocking sharp distractions and intense focus.', color: '#4ab6ff' },
          { id: 'pink', name: 'Pink', desc: 'Balanced distribution. Perfect for flow states, creativity, and steady work.', color: '#ec4899' },
          { id: 'brown', name: 'Brown', desc: 'Deep bass energy. Best for deep relaxation, calming anxiety, and restorative rest.', color: '#8b5cf6' }
        ].map(n => {
          return (
            <button key={n.id} onClick={() => {
              setNoiseType(n.id as any);
              if (useStore.getState().isPlaying) audioEngine.startNoise(n.id as any, noiseVolume);
            }}
              className={`p-6 rounded-[2rem] border-2 text-left transition-all flex items-center gap-5 group ${noiseType === n.id ? 'border-nebula-500 bg-nebula-500/10 shadow-glow scale-[1.02]' : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
            >
              <div className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-2xl transition-colors ${noiseType === n.id ? 'bg-nebula-500/20' : 'bg-white/5'}`}>
                <Waves size={28} className={noiseType === n.id ? 'text-nebula-400' : 'text-text-tertiary opacity-50 group-hover:opacity-100'} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`text-sm font-black uppercase tracking-tight block ${noiseType === n.id ? 'text-nebula-400' : 'text-text-secondary'}`}>{n.name} Noise</span>
                <span className="text-[10px] font-medium text-text-tertiary leading-relaxed mt-1 opacity-80">{n.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-space-900/50 p-6 rounded-3xl border border-white/5">
        <div className="flex justify-between text-[10px] font-bold mb-4 text-text-tertiary uppercase tracking-widest">
          <span>Density</span>
          <span className="text-text-primary font-mono">{Math.round(noiseVolume * 100)}%</span>
        </div>
        <Slider value={noiseVolume} onChange={(v) => { setNoiseVolume(v); audioEngine.setNoiseVolume(v); }} disabled={!noiseEnabled} />
      </div>
    </section>
  );
}

function BrainwaveSelector() {
  const { brainwaveState, setBrainwaveState, toneFrequency, setToneFrequency, toneVolume, setToneVolume, toneEnabled, setToneEnabled, toneType, setToneType } = useStore();
  const current = BRAINWAVE_STATES.find(s => s.id === brainwaveState);

  return (
    <section className="glass rounded-[2.5rem] p-8 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em]">Entrainment Protocol</h3>
            <div className="group relative">
              <Info size={14} className="text-text-tertiary cursor-help hover:text-aurora-400 transition-colors" />
              <div className="absolute left-0 bottom-full mb-3 w-64 p-4 bg-space-950 border border-white/10 rounded-2xl text-[10px] leading-relaxed text-text-secondary opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl backdrop-blur-xl">
                <p className="font-bold text-aurora-400 mb-1">What is this?</p>
                Entrainment uses localized frequencies to synchronize brainwave activity with specific states of consciousness like deep sleep or peak focus.
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {[
              {
                id: 'isochronic',
                label: 'ISOCHRONIC',
                desc: 'Single frequency pulses. Highly effective for entrainment without the need for headphones.'
              },
              {
                id: 'binaural',
                label: 'BINAURAL',
                desc: 'Dual-frequency beats. The brain hears the difference between left and right. Requires stereo headphones.'
              }
            ].map(type => (
              <div key={type.id} className="group relative">
                <button
                  onClick={() => {
                    const next = type.id as 'isochronic' | 'binaural';
                    setToneType(next);
                    if (useStore.getState().isPlaying) audioEngine.startTone(toneFrequency, toneVolume, next);
                  }}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${toneType === type.id ? 'border-aurora-500/30 bg-aurora-500/10 text-aurora-400 shadow-glow' : 'border-white/5 text-text-tertiary uppercase tracking-widest hover:border-white/10'}`}
                >
                  {type.label}
                </button>
                <div className="absolute right-0 bottom-full mb-3 w-48 p-3 bg-space-950 border border-white/10 rounded-xl text-[9px] leading-relaxed text-text-secondary opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl backdrop-blur-xl">
                  {type.desc}
                </div>
              </div>
            ))}
            <button onClick={() => setToneEnabled(!toneEnabled)} className={`px-4 py-1.5 rounded-xl text-[10px] font-bold tracking-widest transition-all ${toneEnabled ? 'bg-aurora-500/10 text-aurora-400 border border-aurora-500/20' : 'bg-space-800 text-text-tertiary'}`}>{toneEnabled ? 'ACTIVE' : 'MUTED'}</button>
          </div>
        </div>
        <p className="text-[10px] text-text-tertiary leading-relaxed max-w-lg">
          Select a brainwave state to shift your cognitive frequency. Best results achieved with stereo headphones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {BRAINWAVE_STATES.map(s => (
          <button
            key={s.id}
            onClick={() => {
              setBrainwaveState(s.id);
              setToneFrequency(s.defaultFreq);
              if (useStore.getState().isPlaying) audioEngine.startTone(s.defaultFreq, toneVolume, toneType);
            }}
            className={`group p-5 rounded-[2rem] border-2 transition-all flex items-center gap-4 text-left ${brainwaveState === s.id
              ? s.activeClass + " shadow-glow border-opacity-100 scale-[1.02]"
              : s.bgClass + " border-white/5 grayscale-[0.8] hover:grayscale-0 hover:bg-white/5 hover:border-white/20"
              }`}
          >
            <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl transition-colors ${brainwaveState === s.id ? 'bg-white/10' : 'bg-white/5'}`}>
              <RenderBrainwaveIcon state={s.id} color={brainwaveState === s.id ? s.color : 'currentColor'} className="w-8 h-8 opacity-90 group-hover:opacity-100" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-xs font-black uppercase tracking-tighter block truncate ${brainwaveState === s.id ? '' : 'text-text-secondary'}`}>{s.name}</span>
              <span className="text-[9px] font-medium text-text-tertiary leading-tight line-clamp-2 mt-0.5 opacity-80">{s.description}</span>
            </div>
          </button>
        ))}
      </div>

      {current && (
        <div className="bg-space-900/50 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Frequency Sweep</span>
              <div className="group relative">
                <Info size={12} className="text-text-tertiary cursor-help" />
                <div className="absolute left-0 bottom-full mb-3 w-56 p-3 bg-space-950 border border-white/10 rounded-xl text-[9px] leading-relaxed text-text-secondary opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl backdrop-blur-xl">
                  Fine-tune the frequency within the selected brainwave range to match your personal neural resonance.
                </div>
              </div>
            </div>
            <span className="text-2xl font-mono font-bold" style={{ color: current.color }}>{toneFrequency.toFixed(1)} <span className="text-sm font-medium">Hz</span></span>
          </div>
          <Slider value={toneFrequency} onChange={(v) => { setToneFrequency(v); audioEngine.setToneFrequency(v, toneType); }} min={current.min} max={current.max} step={0.1} color={current.color} disabled={!toneEnabled} />

          <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Tone Gain</span>
              <div className="group relative">
                <Info size={12} className="text-text-tertiary cursor-help" />
                <div className="absolute left-0 bottom-full mb-3 w-56 p-3 bg-space-950 border border-white/10 rounded-xl text-[9px] leading-relaxed text-text-secondary opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl backdrop-blur-xl">
                  Adjust the intensity of the entrainment tone. Mix it subtlely for prolonged sessions.
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-text-secondary">{Math.round(toneVolume * 100)}%</span>
          </div>
          <Slider value={toneVolume} onChange={(v) => { setToneVolume(v); audioEngine.setToneVolume(v); }} disabled={!toneEnabled} />
        </div>
      )}
    </section>
  );
}
