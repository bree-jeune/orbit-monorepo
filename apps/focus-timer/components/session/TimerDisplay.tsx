
import React, { useEffect, useCallback } from 'react';
import { useStore } from '../../stores/useStore';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { audioEngine } from '@orbit/core';
import { motion } from 'framer-motion';

export function TimerDisplay() {
  const {
    duration,
    timeRemaining,
    isRunning,
    setTimeRemaining,
    setIsRunning,
    setIsPlaying,
    noiseEnabled,
    noiseType,
    noiseVolume,
    toneEnabled,
    toneFrequency,
    toneVolume,
    fadeInDuration,
    fadeOutDuration,
    setFadeLevel
  } = useStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stopAllAudio = useCallback(() => {
    audioEngine.stopAll();
    setIsPlaying(false);
  }, [setIsPlaying]);

  const startAllAudio = useCallback(() => {
    audioEngine.getContext().resume();
    if (noiseEnabled) audioEngine.startNoise(noiseType, noiseVolume);
    if (toneEnabled) audioEngine.startTone(toneFrequency, toneVolume);
    setIsPlaying(true);
  }, [noiseEnabled, noiseType, noiseVolume, toneEnabled, toneFrequency, toneVolume, setIsPlaying]);

  useEffect(() => {
    if (!isRunning) return;
    if (timeRemaining <= 0) {
      setIsRunning(false);
      stopAllAudio();
      return;
    }

    const interval = setInterval(() => {
      const nextTime = timeRemaining - 1;
      setTimeRemaining(nextTime);

      const elapsed = duration - nextTime;
      if (fadeInDuration > 0 && elapsed <= fadeInDuration) {
        setFadeLevel(elapsed / fadeInDuration);
      } else if (fadeOutDuration > 0 && nextTime <= fadeOutDuration) {
        setFadeLevel(nextTime / fadeOutDuration);
      } else {
        setFadeLevel(1);
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, duration, fadeInDuration, fadeOutDuration, setTimeRemaining, setIsRunning, stopAllAudio, setFadeLevel]);

  const handleToggle = () => {
    if (isRunning) {
      setIsRunning(false);
      stopAllAudio();
    } else {
      setIsRunning(true);
      startAllAudio();
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(duration);
    stopAllAudio();
    setFadeLevel(1);
  };

  const progress = (duration - timeRemaining) / duration;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-72 h-72 flex items-center justify-center">
        {/* Progress Circle SVG */}
        <svg className="absolute w-full h-full -rotate-90">
          <circle
            cx="144"
            cy="144"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="10"
          />
          <motion.circle
            cx="144"
            cy="144"
            r={radius}
            fill="none"
            stroke="url(#timerGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: isRunning ? 1 : 0.5, ease: isRunning ? "linear" : "easeOut" }}
          />
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Time Text */}
        <div className="text-center z-10 select-none">
          <motion.div
            key={timeRemaining}
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-mono font-bold tracking-tighter mb-2"
          >
            {formatTime(timeRemaining)}
          </motion.div>
          <div className="text-[10px] text-text-tertiary uppercase tracking-[0.4em] font-bold">
            {isRunning ? 'Session Active' : 'Ready'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-10 mt-8">
        <motion.button
          whileHover={{ scale: 1.1, rotate: -30 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleReset}
          className="p-4 rounded-full bg-space-800 text-text-secondary hover:bg-space-700 hover:text-text-primary transition-all border border-white/5"
        >
          <RotateCcw size={22} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggle}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl relative group ${isRunning
            ? 'bg-amber-500 text-white shadow-amber-500/30'
            : 'bg-gradient-to-br from-nebula-500 to-aurora-500 text-white shadow-nebula-500/30'
            }`}
        >
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
          {isRunning ? <Pause size={36} fill="white" /> : <Play size={36} fill="white" className="ml-1.5" />}
        </motion.button>

        <div className="w-14 h-14" /> {/* Spacer for balance */}
      </div>
    </div>
  );
}
