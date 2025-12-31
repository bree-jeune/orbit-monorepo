
import React, { useState, useEffect, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Square, Mic,
  Wand2, Brain, Wind, Settings, User as UserIcon, Search, Plus,
  Layers, Volume2, Maximize2, Zap, Music, Cloud,
  Moon, Sun, X, Timer, Film, Share2, LogOut, CloudCheck, Crown, LayoutGrid
} from 'lucide-react';
import { useStore } from './store';
import { AppMode } from './types';
import Timeline from './components/Timeline';
import Mixer from './components/Mixer';
import AIPanel from './components/AIPanel';
import WellnessPanel from './components/WellnessPanel';
import VisualPanel from './components/VisualPanel';
import ExportModal from './components/ExportModal';
import AuthModal from './components/AuthModal';
import ProModal from './components/ProModal';
import { BrandIcon } from '@orbit/ui';
import { audioEngine } from '@orbit/core';

const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "orbit-audio.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "orbit-audio",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "orbit-audio.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

const App: React.FC = () => {
  const {
    mode, setMode, theme, toggleTheme, isPlaying,
    togglePlayback, currentTime, setCurrentTime,
    project, focusTimeRemaining, setFocusTime,
    user, setUser, isSyncing, initializeAuth
  } = useStore();

  useEffect(() => {
    initializeAuth(FIREBASE_CONFIG);
  }, [initializeAuth]);

  const [activeTab, setActiveTab] = useState<'ai' | 'wellness' | 'mixer' | 'visual'>('ai');
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showPro, setShowPro] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      audioEngine.resume();
      interval = setInterval(() => {
        setCurrentTime(currentTime + 0.1);
        if (mode === AppMode.FOCUS && focusTimeRemaining > 0) {
          setFocusTime(Math.max(0, focusTimeRemaining - 0.1));
        }
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, setCurrentTime, mode, focusTimeRemaining, setFocusTime]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
    if (e.code === 'Space') { e.preventDefault(); togglePlayback(); }
    if (e.code === 'KeyM') { mode === AppMode.STUDIO ? setMode(AppMode.FOCUS) : setMode(AppMode.STUDIO); }
    if (e.code === 'KeyE' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setShowExport(true); }
  }, [togglePlayback, mode, setMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const sidebarTabs = [
    { id: 'ai', icon: <Wand2 size={16} />, label: 'AI Synthesis', color: 'text-cyan-500', bg: 'bg-cyan-500' },
    { id: 'visual', icon: <Film size={16} />, label: 'Visual Engine', color: 'text-purple-500', bg: 'bg-purple-500' },
    { id: 'wellness', icon: <Brain size={16} />, label: 'Wellness', color: 'text-indigo-500', bg: 'bg-indigo-500' },
    { id: 'mixer', icon: <Volume2 size={16} />, label: 'Master Mixer', color: 'text-emerald-500', bg: 'bg-emerald-500' }
  ];

  return (
    <div className={`flex flex-col h-screen select-none overflow-hidden ${theme}`}>
      {mode !== AppMode.ZEN && (
        <header className="h-14 border-b border-space-200/60 dark:border-space-800/60 flex items-center px-6 justify-between bg-white/80 dark:bg-space-950/80 glass z-50 transition-all">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setMode(AppMode.STUDIO)}>
              <div className="w-10 h-10 bg-gradient-to-br from-aurora-500/10 to-nebula-600/10 border border-aurora-500/20 rounded-[1.25rem] flex items-center justify-center shadow-2xl group-hover:scale-105 transition-all">
                <BrandIcon className="w-7 h-7 filter drop-shadow-[0_0_8px_rgba(20,184,166,0.4)]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-space-900 dark:text-space-50 uppercase text-sm">OrbitAudio AI</span>
                <span className="text-[9px] font-bold text-space-400 dark:text-space-500 uppercase tracking-[0.2em] leading-none">Creative Suite</span>
              </div>
            </div>

            {user?.isPro && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full animate-pulse-subtle">
                <Crown size={12} className="text-amber-500" />
                <span className="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Orbit Pro</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex bg-space-100 dark:bg-space-900/50 rounded-xl p-1 border border-space-200/50 dark:border-space-800/50 glass">
              {['Studio', 'Focus', 'Zen'].map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m.toUpperCase() as AppMode)}
                  className={`px-6 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all duration-300 ${mode === m.toUpperCase() ? 'bg-white dark:bg-space-800 text-aurora-600 dark:text-aurora-400 shadow-xl' : 'text-space-500 hover:text-space-800 dark:hover:text-space-200'}`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 border-l border-space-200 dark:border-space-800 pl-6">
              {!user?.isPro && user && (
                <button
                  onClick={() => setShowPro(true)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition shadow-lg shadow-amber-500/20"
                >
                  Upgrade
                </button>
              )}
              <button onClick={toggleTheme} className="w-9 h-9 rounded-full bg-space-100 dark:bg-space-900 border border-space-200 dark:border-space-800 flex items-center justify-center text-space-500 hover:text-space-900 dark:hover:text-space-100 transition-colors">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button onClick={() => !user ? setShowAuth(true) : setShowSettings(true)} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${user ? 'bg-gradient-to-tr from-aurora-500 to-nebula-500 text-white shadow-lg' : 'bg-space-100 dark:bg-space-900 text-space-600 dark:text-space-400 border border-space-200 dark:border-space-800'}`}>
                {user ? <span className="text-xs font-black uppercase">{user.displayName.substring(0, 1)}</span> : <UserIcon size={16} />}
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 relative overflow-hidden bg-white dark:bg-[#080808] transition-colors duration-500">
        {/* Studio Mode Layout */}
        {mode === AppMode.STUDIO ? (
          <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex-1 overflow-hidden relative">
              <Timeline />
            </div>

            <div className="h-80 border-t border-space-200/60 dark:border-space-800/60 flex bg-white dark:bg-space-950/40 glass">
              <div className="w-80 border-r border-space-200/60 dark:border-space-800/60 flex flex-col shrink-0">
                <div className="flex p-2 gap-1 border-b border-space-200/60 dark:border-space-800/60">
                  {sidebarTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center py-2.5 rounded-lg transition-all ${activeTab === tab.id ? `${tab.bg} text-white shadow-lg` : 'text-space-500 hover:bg-space-100 dark:hover:bg-space-900'}`}
                      title={tab.label}
                    >
                      {tab.icon}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-space-50/30 dark:bg-transparent">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-black text-space-400 dark:text-space-500 uppercase tracking-widest">{sidebarTabs.find(t => t.id === activeTab)?.label}</span>
                  </div>
                  {activeTab === 'ai' && <AIPanel />}
                  {activeTab === 'visual' && <VisualPanel />}
                  {activeTab === 'wellness' && <WellnessPanel />}
                  {activeTab === 'mixer' && <Mixer mini />}
                </div>
              </div>
              <div className="flex-1 flex flex-col bg-space-50/50 dark:bg-transparent overflow-hidden">
                <Mixer />
              </div>
            </div>
          </div>
        ) : mode === AppMode.FOCUS ? (
          <div className="h-full flex items-center justify-center p-12 bg-space-50 dark:bg-[#020202] animate-in fade-in zoom-in-95 duration-700">
            <div className="max-w-5xl w-full flex flex-col items-center">
              <div className="mb-12 text-center">
                <h2 className="text-space-400 dark:text-space-600 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Focus Horizon</h2>
                <div className="mono text-7xl font-extralight tracking-tighter text-space-900 dark:text-space-100">
                  {Math.floor(focusTimeRemaining / 60).toString().padStart(2, '0')}<span className="opacity-20 mx-1">:</span>{Math.floor(focusTimeRemaining % 60).toString().padStart(2, '0')}
                </div>
              </div>
              <div className="w-full bg-white dark:bg-space-900/40 p-10 rounded-[3rem] border border-space-200/50 dark:border-space-800/50 shadow-2xl glass">
                <WellnessPanel large />
              </div>
              <div className="mt-12 flex gap-4">
                <button
                  onClick={() => setFocusTime(25 * 60)}
                  className="px-8 py-3 rounded-2xl border border-space-200 dark:border-space-800 text-[10px] font-bold text-space-500 uppercase tracking-widest hover:bg-space-100 dark:hover:bg-space-800 transition"
                >
                  Reset Session
                </button>
                <button
                  onClick={() => setMode(AppMode.STUDIO)}
                  className="px-8 py-3 rounded-2xl bg-space-900 dark:bg-space-100 text-white dark:text-space-900 text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition"
                >
                  Exit Focus
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full bg-black flex items-center justify-center cursor-none animate-in fade-in duration-1000" onClick={() => setMode(AppMode.STUDIO)}>
            <div className="text-center group">
              <div className="w-1 h-1 bg-white/40 rounded-full mx-auto mb-12 animate-pulse transition-all duration-1000 group-hover:scale-[50]"></div>
              <h1 className="text-space-800 font-extralight text-sm uppercase tracking-[2em]">ZEN SPACE</h1>
              <p className="text-space-900 text-[9px] mt-4 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Click to return</p>
            </div>
          </div>
        )}
      </main>

      {mode !== AppMode.ZEN && (
        <footer className="h-16 border-t border-space-200/60 dark:border-space-800/60 bg-white/90 dark:bg-space-950/90 glass flex items-center px-8 justify-between z-50 transition-all">
          <div className="flex items-center gap-8 w-1/3">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase text-space-400 dark:text-space-500 font-black tracking-widest mb-1">Timeline</span>
              <span className="mono text-aurora-600 dark:text-aurora-400 font-bold text-xl tracking-tight leading-none">
                {Math.floor(currentTime / 60).toString().padStart(2, '0')}<span className="opacity-30 mx-0.5">:</span>{(currentTime % 60).toFixed(3).padStart(6, '0')}
              </span>
            </div>
            <div className="flex flex-col border-l border-space-200 dark:border-space-800/60 pl-8">
              <span className="text-[9px] uppercase text-space-400 dark:text-space-500 font-black tracking-widest mb-1">Tempo</span>
              <span className="mono text-space-900 dark:text-space-200 font-bold text-xl leading-none">{project.bpm} <span className="text-[10px] font-medium opacity-50">BPM</span></span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-space-400 dark:text-space-500 hover:text-space-900 dark:hover:text-space-100 transition-colors"><SkipBack size={22} /></button>
            <button
              onClick={togglePlayback}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-2xl ${isPlaying ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-red-500/5' : 'bg-space-900 dark:bg-white text-white dark:text-space-900 hover:scale-105 active:scale-95'}`}
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>
            <button className="p-2.5 text-space-400 dark:text-space-500 hover:text-space-900 dark:hover:text-space-100 transition-colors"><SkipForward size={22} /></button>
            <div className="w-px h-8 bg-space-200 dark:bg-space-800 mx-4"></div>
            <button
              onClick={() => setShowExport(true)}
              className="px-8 py-3 bg-gradient-to-r from-aurora-600 to-nebula-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:shadow-aurora-500/20 shadow-lg transition-all"
            >
              <Share2 size={16} /> Broadcast
            </button>
          </div>

          <div className="flex items-center justify-end gap-8 w-1/3">
            <div className="hidden lg:flex items-center gap-4 text-space-400 dark:text-space-500">
              <Volume2 size={18} />
              <div className="w-28 h-1.5 bg-space-200 dark:bg-space-800 rounded-full relative overflow-hidden group cursor-pointer">
                <div className="absolute top-0 left-0 h-full bg-aurora-500 w-[80%] shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
              </div>
            </div>
            <button
              onClick={() => {
                if (document.fullscreenElement) document.exitFullscreen();
                else document.documentElement.requestFullscreen();
              }}
              className="p-2.5 text-space-400 dark:text-space-500 hover:text-space-900 dark:hover:text-space-100 transition-colors"
            >
              <Maximize2 size={18} />
            </button>
          </div>
        </footer>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => setShowSettings(false)}>
          <div className="bg-white dark:bg-space-900 border border-space-200 dark:border-space-800 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-space-100 dark:border-space-800 flex items-center justify-between">
              <h2 className="text-xl font-black text-space-900 dark:text-space-100 flex items-center gap-3 uppercase tracking-tight">
                <Settings size={20} className="text-space-400" /> Account
              </h2>
              <button onClick={() => setShowSettings(false)} className="text-space-400 hover:text-space-900 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-8">
              {user && (
                <div className="flex items-center justify-between p-5 bg-space-50 dark:bg-space-950 rounded-3xl border border-space-100 dark:border-space-800">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-aurora-500 to-nebula-500 flex items-center justify-center text-white font-black text-xl uppercase shadow-lg">
                      {user.displayName.substring(0, 1)}
                    </div>
                    <div>
                      <div className="text-base font-black text-space-900 dark:text-space-100">{user.displayName}</div>
                      <div className="text-[10px] text-space-500 uppercase font-black tracking-widest mt-1">{user.tier} Membership</div>
                    </div>
                  </div>
                  <button onClick={() => setUser(null)} className="p-3 text-space-400 hover:text-red-500 bg-white dark:bg-space-900 rounded-xl transition-all shadow-sm">
                    <LogOut size={20} />
                  </button>
                </div>
              )}
              <button onClick={() => setShowPro(true)} className="w-full bg-space-900 dark:bg-space-100 text-white dark:text-space-900 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-102 transition-all">Manage Subscription</button>
            </div>
          </div>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      {showPro && <ProModal onClose={() => setShowPro(false)} />}
    </div>
  );
};

export default App;
