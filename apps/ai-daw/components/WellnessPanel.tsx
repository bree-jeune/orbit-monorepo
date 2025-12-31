
import React, { useState, useEffect } from 'react';
import {
  Wind, Brain, Activity, Waves, Timer, Zap, Info, Clock,
  Play, Square, Save, Library, Trash2, Cloud, Loader2, Plus, Lock, Crown, Star,
  RotateCw, Disc, Radio, MoveHorizontal, Download
} from 'lucide-react';
import { DeltaIcon, ThetaIcon, AlphaIcon, BetaIcon, GammaIcon } from './BrainwaveIcons';
import { BRAINWAVE_DATA, BrainwaveState, AudioPreset } from '../types';
import { audioEngine } from '@orbit/core';
import { useStore, FREE_PRESET_LIMIT } from '../store';
import ProModal from './ProModal';

interface WellnessPanelProps {
  large?: boolean;
}

const WellnessPanel: React.FC<WellnessPanelProps> = ({ large = false }) => {
  const {
    togglePlayback, isPlaying, user, userPresets, premiumPacks,
    savePreset, deletePreset, isSyncing
  } = useStore();

  const [activeNoise, setActiveNoise] = useState<'white' | 'pink' | 'brown' | null>(null);
  const [activeBrainwave, setActiveBrainwave] = useState<BrainwaveState | null>(null);
  const [is8D, setIs8D] = useState(false);
  const [isLoFi, setIsLoFi] = useState(false);
  const [spatialSpeed, setSpatialSpeed] = useState(0.15);
  const [carrierFreq, setCarrierFreq] = useState(200);
  const [tab, setTab] = useState<'controls' | 'library' | 'expert'>('controls');
  const [toneType, setToneType] = useState<'isochronic' | 'binaural'>('isochronic');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 8D Visual Feedback Logic
  const [panPos, setPanPos] = useState(0);
  useEffect(() => {
    if (!is8D || !isPlaying) return;
    let start = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      setPanPos(Math.sin(elapsed * spatialSpeed * Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, [is8D, isPlaying, spatialSpeed]);

  const toggleNoise = (type: 'white' | 'pink' | 'brown') => {
    audioEngine.resume();
    if (activeNoise === type) {
      audioEngine.stopNoise();
      setActiveNoise(null);
    } else {
      audioEngine.startNoise(type);
      setActiveNoise(type);
    }
  };

  const toggleBrainwave = (state: BrainwaveState) => {
    audioEngine.resume();
    if (activeBrainwave === state) {
      audioEngine.stopTone();
      setActiveBrainwave(null);
    } else {
      audioEngine.startTone(BRAINWAVE_DATA[state].freq, 0.5, toneType);
      setActiveBrainwave(state);
    }
  };

  const handleExport = async () => {
    if (!activeNoise && !activeBrainwave) return;
    setIsExporting(true);
    try {
      const blob = await audioEngine.exportAsWav(
        activeNoise || 'white',
        activeNoise ? 0.5 : 0,
        activeBrainwave ? BRAINWAVE_DATA[activeBrainwave].freq : 10,
        activeBrainwave ? 0.5 : 0,
        60, // 60 seconds export
        toneType
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orbit-mix-${Date.now()}.wav`;
      a.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handle8DToggle = () => {
    const next = !is8D;
    setIs8D(next);
    audioEngine.toggle8D(next, spatialSpeed);
  };

  const handleLoFiToggle = () => {
    const next = !isLoFi;
    setIsLoFi(next);
    audioEngine.setLoFi(next);
  };

  const applyPreset = (preset: AudioPreset) => {
    if (preset.isPremium && !user?.isPro) {
      setShowProModal(true);
      return;
    }
    audioEngine.resume();
    if (preset.noiseType) {
      audioEngine.startNoise(preset.noiseType);
      setActiveNoise(preset.noiseType);
    }
    if (preset.brainwaveState) {
      const type = preset.toneType || 'isochronic';
      setToneType(type);
      audioEngine.startTone(BRAINWAVE_DATA[preset.brainwaveState].freq, 0.5, type);
      setActiveBrainwave(preset.brainwaveState);
    }
    setCarrierFreq(preset.carrierFreq);
  };

  const handleSaveCurrent = async () => {
    if (!presetName) return;
    const result = await savePreset({
      name: presetName,
      noiseType: activeNoise,
      brainwaveState: activeBrainwave,
      toneType,
      carrierFreq,
      timerMinutes: 25
    });

    if (result.success) {
      setPresetName('');
      setShowSaveDialog(false);
      setErrorMsg(null);
    } else {
      setErrorMsg(result.error || 'Failed to save');
    }
  };

  const BrainwaveIconMap = ({ state, color, className = "w-4 h-4" }: { state: BrainwaveState, color?: string, className?: string }) => {
    switch (state) {
      case BrainwaveState.DELTA: return <DeltaIcon className={className} color={color} />;
      case BrainwaveState.THETA: return <ThetaIcon className={className} color={color} />;
      case BrainwaveState.ALPHA: return <AlphaIcon className={className} color={color} />;
      case BrainwaveState.BETA: return <BetaIcon className={className} color={color} />;
      case BrainwaveState.GAMMA: return <GammaIcon className={className} color={color} />;
      default: return <Zap size={16} />;
    }
  };

  const renderPresetList = (presets: AudioPreset[], title: string, showLimit = false) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400 dark:text-zinc-500">{title}</h3>
        {showLimit && user?.tier === 'free' && (
          <span className="text-[9px] font-black text-amber-500 uppercase">
            {userPresets.length} / {FREE_PRESET_LIMIT} Slots Used
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3">
        {presets.map(preset => (
          <div
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className={`group relative flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl hover:border-cyan-500/50 transition-all cursor-pointer ${preset.isPremium && !user?.isPro ? 'opacity-70 grayscale' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm ${preset.isPremium ? 'text-amber-500' : 'text-cyan-500'}`}>
                {preset.isPremium ? <Crown size={18} /> : <Activity size={18} />}
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  {preset.name}
                  {preset.isPremium && <span className="text-[8px] px-1 bg-amber-500/20 text-amber-600 rounded">PRO</span>}
                </div>
                <div className="text-[9px] text-zinc-500 uppercase font-black tracking-tighter mt-0.5">
                  {preset.noiseType || 'Clean'} • {preset.brainwaveState || 'Mono'}
                </div>
              </div>
            </div>

            {preset.isPremium && !user?.isPro ? (
              <Lock size={14} className="text-zinc-400" />
            ) : (
              !preset.isPremium && (
                <button
                  onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                  className="p-2 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col transition-all duration-300 ${large ? 'gap-12 w-full' : 'gap-6'}`}>
      {!large && (
        <div className="flex bg-space-100 dark:bg-space-900 p-1 rounded-xl border border-space-200 dark:border-space-800 mb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setTab('controls')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition whitespace-nowrap ${tab === 'controls' ? 'bg-white dark:bg-space-800 text-aurora-500 shadow-sm' : 'text-space-500'}`}
          >
            <Activity size={14} /> Mix
          </button>
          <button
            onClick={() => setTab('library')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition whitespace-nowrap ${tab === 'library' ? 'bg-white dark:bg-space-800 text-nebula-500 shadow-sm' : 'text-space-500'}`}
          >
            <Library size={14} /> Saved
          </button>
          <button
            onClick={() => setTab('expert')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition whitespace-nowrap ${tab === 'expert' ? 'bg-white dark:bg-space-800 text-amber-500 shadow-sm' : 'text-space-500'}`}
          >
            <Star size={14} /> Expert
          </button>
        </div>
      )}

      {tab === 'library' && !large ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          {!user ? (
            <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
              <Cloud size={32} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">Sign in to unlock<br />cloud synchronization</p>
            </div>
          ) : userPresets.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
              <Library size={32} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">No saved presets<br />in your orbit</p>
            </div>
          ) : renderPresetList(userPresets, "Your Custom Library", true)}
        </div>
      ) : tab === 'expert' && !large ? (
        <div className="animate-in fade-in duration-300">
          {renderPresetList(premiumPacks, "Masterclass Packs")}
        </div>
      ) : (
        <>
          {/* Spatial & Lo-Fi Effects Suite */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase text-space-400 dark:text-space-500 tracking-widest flex items-center gap-2">
                <RotateCw size={12} className="text-aurora-500 animate-spin-slow" /> Advanced FX Engine
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-space-400 uppercase">8D Mode</span>
                <button
                  onClick={handle8DToggle}
                  className={`w-10 h-5 rounded-full relative transition-colors ${is8D ? 'bg-aurora-500 shadow-lg shadow-aurora-500/20' : 'bg-space-200 dark:bg-space-800'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${is8D ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={`p-4 bg-white dark:bg-space-900 border border-space-200 dark:border-space-800 rounded-2xl flex flex-col gap-3 transition-all ${is8D ? 'border-aurora-500/50 ring-1 ring-aurora-500/20 shadow-xl shadow-aurora-500/5' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MoveHorizontal size={14} className="text-aurora-500" />
                    <span className="text-[10px] font-black uppercase text-space-800 dark:text-space-200">Spatial Width</span>
                  </div>
                  <span className="mono text-[10px] text-aurora-500">{spatialSpeed.toFixed(2)}Hz</span>
                </div>
                <div className="relative h-6 flex items-center justify-center">
                  <div className="absolute w-full h-1 bg-space-100 dark:bg-space-800 rounded-full"></div>
                  <div className="absolute w-2 h-4 bg-aurora-500 rounded-full shadow-lg shadow-aurora-500/50 transition-all duration-75" style={{ left: `calc(50% + ${panPos * 45}%)` }}></div>
                </div>
                <input
                  type="range" min="0.05" max="0.5" step="0.01" value={spatialSpeed}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setSpatialSpeed(v);
                    if (is8D) audioEngine.toggle8D(true, v);
                  }}
                  className="w-full h-1 bg-transparent appearance-none cursor-pointer accent-aurora-500"
                />
              </div>

              <button
                onClick={handleLoFiToggle}
                className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${isLoFi ? 'bg-amber-500/10 border-amber-500/50 shadow-xl shadow-amber-500/5' : 'bg-white dark:bg-space-900 border-space-200 dark:border-space-800'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isLoFi ? 'bg-amber-500 text-white animate-spin-slow shadow-lg shadow-amber-500/20' : 'bg-space-100 dark:bg-space-800 text-space-400'}`}>
                  <Disc size={20} />
                </div>
                <div className="text-left">
                  <div className={`text-[10px] font-black uppercase tracking-widest ${isLoFi ? 'text-amber-600 dark:text-amber-500' : 'text-space-500'}`}>Vintage Lo-Fi</div>
                  <div className="text-[9px] text-space-400 font-bold uppercase tracking-tighter mt-0.5">Vinyl + 2.8kHz Filter</div>
                </div>
              </button>
            </div>
          </section>

          {/* Noise Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase text-space-400 dark:text-space-500 tracking-widest flex items-center gap-2">
                <Waves size={12} className="text-nebula-600 dark:text-nebula-400" /> Noise Masking
              </label>
              {user && (
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-aurora-600 dark:text-aurora-400 hover:scale-105 transition"
                >
                  <Save size={12} /> Capture Mix
                </button>
              )}
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-nebula-600 dark:text-nebula-400 hover:scale-105 transition disabled:opacity-50"
              >
                {isExporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} Export WAV
              </button>
            </div>
            <div className={`grid ${large ? 'grid-cols-3' : 'grid-cols-1'} gap-3`}>
              {([['white', 'Sharp Focus'], ['pink', 'Balanced Flow'], ['brown', 'Deep Rumble']] as const).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => toggleNoise(type)}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition group ${activeNoise === type ? 'bg-nebula-50 dark:bg-nebula-500/20 border-nebula-200 dark:border-nebula-500/50 text-nebula-700 dark:text-nebula-400 shadow-xl shadow-nebula-500/5' : 'bg-white dark:bg-space-900 border-space-200 dark:border-space-800 text-space-500 hover:border-space-300 dark:hover:border-space-700 hover:bg-space-50 dark:hover:bg-space-800'}`}
                >
                  <Wind size={large ? 32 : 18} className={activeNoise === type ? 'text-nebula-600 dark:text-nebula-400' : 'group-hover:text-space-800 dark:group-hover:text-space-300'} />
                  <div className="text-center">
                    <div className="text-xs font-bold uppercase tracking-tight">{type} noise</div>
                    {large && <div className="text-[10px] text-space-500 mt-1 uppercase tracking-widest">{label}</div>}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase text-space-400 dark:text-space-500 tracking-widest flex items-center gap-2">
                <Brain size={12} className="text-aurora-600 dark:text-aurora-400" /> Entrainment
                <div className="group relative">
                  <Info size={12} className="text-space-400 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-white dark:bg-space-950 border border-space-200 dark:border-space-800 rounded-xl text-[10px] leading-relaxed text-space-600 dark:text-text-secondary opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
                    <p className="font-bold text-aurora-600 dark:text-aurora-400 mb-1">Entrainment Protocol</p>
                    Synchronizes brainwave activity using precise audio frequencies to induce specific states like deep sleep or peak focus.
                  </div>
                </div>
              </label>
              <div className="flex bg-space-100 dark:bg-space-900 p-0.5 rounded-lg border border-space-200 dark:border-space-800">
                <div className="group relative">
                  <button
                    onClick={() => {
                      setToneType('isochronic');
                      if (activeBrainwave) audioEngine.startTone(BRAINWAVE_DATA[activeBrainwave].freq, 0.5, 'isochronic');
                    }}
                    className={`px-2 py-1 rounded-md text-[8px] font-black uppercase transition ${toneType === 'isochronic' ? 'bg-white dark:bg-space-800 text-aurora-500 shadow-sm' : 'text-space-500'}`}
                  >Isochronic</button>
                  <div className="absolute right-0 bottom-full mb-2 w-48 p-3 bg-white dark:bg-space-950 border border-space-200 dark:border-space-800 rounded-xl text-[9px] leading-relaxed text-space-600 dark:text-text-secondary opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
                    Single frequency pulses. Highly effective for entrainment without the need for headphones.
                  </div>
                </div>
                <div className="group relative">
                  <button
                    onClick={() => {
                      setToneType('binaural');
                      if (activeBrainwave) audioEngine.startTone(BRAINWAVE_DATA[activeBrainwave].freq, 0.5, 'binaural');
                    }}
                    className={`px-2 py-1 rounded-md text-[8px] font-black uppercase transition ${toneType === 'binaural' ? 'bg-white dark:bg-space-800 text-aurora-500 shadow-sm' : 'text-space-500'}`}
                  >Binaural</button>
                  <div className="absolute right-0 bottom-full mb-2 w-48 p-3 bg-white dark:bg-space-950 border border-space-200 dark:border-space-800 rounded-xl text-[9px] leading-relaxed text-space-600 dark:text-text-secondary opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
                    Dual-frequency beats. The brain hears the difference between left and right. Requires stereo headphones.
                  </div>
                </div>
              </div>
            </div>
            <div className={`grid ${large ? 'grid-cols-5' : 'grid-cols-1'} gap-3`}>
              {(Object.keys(BRAINWAVE_DATA) as BrainwaveState[]).map(state => {
                const data = BRAINWAVE_DATA[state];
                const isActive = activeBrainwave === state;
                return (
                  <button
                    key={state}
                    onClick={() => toggleBrainwave(state)}
                    style={{ borderColor: isActive ? data.color : '' }}
                    className={`p-4 rounded-2xl border flex items-center gap-4 transition text-left ${isActive ? 'bg-space-50 dark:bg-space-800 shadow-lg border-opacity-100' : 'bg-white dark:bg-space-900 border-space-200 dark:border-space-800 text-space-500 hover:border-space-300 dark:hover:border-space-700'}`}
                  >
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                      <BrainwaveIconMap state={state} color={isActive ? data.color : 'currentColor'} className="w-full h-full" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-tight flex items-center gap-2" style={{ color: isActive ? data.color : '' }}>
                        {state}
                        <span className="text-[9px] opacity-60 font-mono">{data.range}</span>
                      </div>
                      <div className="text-[9px] text-space-400 dark:text-space-500 font-medium leading-tight mt-0.5">{data.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {large && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                {renderPresetList(premiumPacks, "Expert-Crafted Masterclass Packs")}
                <section className="p-6 bg-white dark:bg-space-900 border border-space-200 dark:border-space-800 rounded-3xl flex items-center justify-between gap-6 shadow-2xl">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full border-4 border-space-100 dark:border-space-800 border-t-nebula-600 animate-spin-slow flex items-center justify-center">
                      <Activity size={24} className="text-nebula-600 dark:text-nebula-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-space-900 dark:text-space-100">Engine Active</h3>
                      <p className="text-sm text-space-500">Master output synced across devices.</p>
                    </div>
                  </div>
                  <button
                    onClick={togglePlayback}
                    className={`px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition shadow-lg flex items-center justify-center gap-2 ${isPlaying ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-nebula-600 text-white shadow-nebula-500/20'}`}
                  >
                    {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    {isPlaying ? 'Disable' : 'Engage'}
                  </button>
                </section>
              </div>
              <div className="bg-space-50/50 dark:bg-space-950/50 border border-space-100 dark:border-space-800 p-8 rounded-[2.5rem]">
                {renderPresetList(userPresets, "My Library", true)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Save Preset Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowSaveDialog(false)}>
          <div className="bg-white dark:bg-space-950 border border-space-200 dark:border-space-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-space-900 dark:text-space-100 mb-2">Save Entrainment Mix</h3>
            <p className="text-xs text-space-500 mb-6">Store these settings in your cloud library.</p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col items-center text-center gap-2">
                <Lock size={16} className="text-red-500" />
                <div className="text-[10px] font-black text-red-500 uppercase leading-tight">{errorMsg}</div>
                <button onClick={() => { setShowSaveDialog(false); setShowProModal(true); }} className="text-[9px] font-black text-aurora-600 underline">Get Pro</button>
              </div>
            )}

            <input
              autoFocus
              type="text"
              placeholder="Morning Flow, Deep Focus..."
              value={presetName}
              onChange={e => setPresetName(e.target.value)}
              className="w-full bg-space-100 dark:bg-space-900 border border-space-200 dark:border-space-800 rounded-xl px-4 py-4 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-aurora-500/20"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowSaveDialog(false)} className="flex-1 py-4 text-[10px] font-black text-space-400 uppercase tracking-widest">Discard</button>
              <button
                disabled={!presetName || isSyncing}
                onClick={handleSaveCurrent}
                className="flex-1 bg-aurora-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-aurora-500/30 disabled:opacity-50"
              >
                {isSyncing ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showProModal && <ProModal onClose={() => setShowProModal(false)} />}
    </div>
  );
};

export default WellnessPanel;
