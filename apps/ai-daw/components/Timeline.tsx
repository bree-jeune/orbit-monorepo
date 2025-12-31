
import React, { useRef } from 'react';
import { useStore } from '../store';
import { Layers, Plus, Activity, Zap, Info } from 'lucide-react';

const Timeline: React.FC = () => {
  const { project, currentTime, zoom, selectTrack, selectedTrackId, addTrack } = useStore();
  const timelineRef = useRef<HTMLDivElement>(null);

  const pixelsPerSecond = zoom * 8;
  const tracks = project.tracks.filter(t => t.id !== 'master');

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    // Logic for setting playhead on click could go here
  };

  const createNewTrack = () => {
    addTrack({
      id: `track-${Date.now()}`,
      name: `Audio ${tracks.length + 1}`,
      type: 'audio',
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      muted: false,
      soloed: false,
      volume: 0.8,
      pan: 0,
      clips: []
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-space-950 transition-colors duration-300">
      {/* Time Ruler */}
      <div className="h-10 border-b border-space-200 dark:border-space-800 bg-space-50 dark:bg-space-950 flex sticky top-0 z-10 glass">
        <div className="w-64 border-r border-space-200 dark:border-space-800 flex items-center justify-between px-5">
          <span className="text-[10px] font-black text-space-400 dark:text-space-500 uppercase tracking-widest">Arrangement</span>
          <button
            onClick={createNewTrack}
            className="p-1 hover:bg-space-200 dark:hover:bg-space-800 rounded transition-colors text-space-400"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 relative overflow-hidden mono text-[9px] font-bold text-space-400 dark:text-space-600">
          {Array.from({ length: 200 }).map((_, i) => (
            <div
              key={i}
              className={`absolute top-0 h-full border-l flex items-end pb-2 pl-1.5 ${i % 10 === 0 ? 'border-space-400 dark:border-space-700' : 'border-space-200 dark:border-space-800/50 h-3/4'}`}
              style={{ left: `${i * pixelsPerSecond}px` }}
            >
              {i % 10 === 0 && `${i}s`}
            </div>
          ))}
        </div>
      </div>

      {/* Tracks Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex bg-white dark:bg-space-950">
        {/* Track Headers */}
        <div className="w-64 border-r border-space-200 dark:border-space-800 bg-space-50/30 dark:bg-space-950/20 flex flex-col z-20 sticky left-0">
          {tracks.map(track => (
            <div
              key={track.id}
              onClick={() => selectTrack(track.id)}
              className={`h-28 border-b border-space-200/50 dark:border-space-800/50 p-4 flex flex-col transition-all cursor-pointer ${selectedTrackId === track.id ? 'bg-space-100 dark:bg-space-900/50 ring-inset ring-1 ring-aurora-500/20 border-l-4 border-l-aurora-500 shadow-sm' : 'hover:bg-space-100/50 dark:hover:bg-space-900/30'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: track.color }}></div>
                  <span className="text-xs font-bold text-space-900 dark:text-space-200 truncate uppercase tracking-tight">{track.name}</span>
                </div>
                <Activity size={12} className="text-space-400 dark:text-space-600" />
              </div>

              <div className="flex items-center gap-1.5 mt-auto">
                <button className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${track.muted ? 'bg-red-500 text-white border-red-600' : 'bg-space-200 dark:bg-space-800 text-space-500 dark:text-space-400 border-transparent hover:border-space-400'}`}>M</button>
                <button className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${track.soloed ? 'bg-amber-500 text-white border-amber-600' : 'bg-space-200 dark:bg-space-800 text-space-500 dark:text-space-400 border-transparent hover:border-space-400'}`}>S</button>
                <div className="flex-1 ml-3 space-y-1">
                  <div className="flex justify-between text-[8px] font-bold text-space-400 dark:text-space-600 uppercase">
                    <span>Vol</span>
                    <span>{(track.volume * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1 bg-space-200 dark:bg-space-800 rounded-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-aurora-500 transition-all duration-300" style={{ width: `${track.volume * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={createNewTrack}
            className="p-6 flex flex-col items-center justify-center text-space-400 dark:text-space-600 hover:text-aurora-500 dark:hover:text-aurora-400 border-b border-space-200 dark:border-space-800 border-dashed transition group"
          >
            <Plus size={24} className="group-hover:scale-110 transition-transform mb-2" />
            <span className="text-[10px] font-black uppercase tracking-widest">Add Track</span>
          </button>
        </div>

        {/* Arrangement Area */}
        <div
          className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] dark:opacity-100 opacity-20 bg-fixed overflow-x-auto no-scrollbar"
        >
          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10">
            {Array.from({ length: 400 }).map((_, i) => (
              <div key={i} className={`absolute h-full border-l ${i % 8 === 0 ? 'border-zinc-400 dark:border-white w-[2px]' : 'border-zinc-800 dark:border-zinc-300'}`} style={{ left: `${i * (pixelsPerSecond / 4)}px` }}></div>
            ))}
          </div>

          {/* Tracks arrangement rows */}
          {tracks.map(track => (
            <div key={track.id} className="h-28 border-b border-space-200/50 dark:border-space-800/20 relative">
              {track.clips.map(clip => (
                <div
                  key={clip.id}
                  className="absolute top-3 bottom-3 rounded-xl border border-black/10 dark:border-white/10 shadow-xl overflow-hidden group transition-all hover:scale-[1.01] hover:brightness-110 cursor-move"
                  style={{
                    left: `${clip.startTime * pixelsPerSecond}px`,
                    width: `${clip.duration * pixelsPerSecond}px`,
                    backgroundColor: track.color + '33'
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: track.color }}></div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-100 truncate pr-4 uppercase tracking-tight">{clip.name}</span>
                      <span className="text-[8px] mono text-zinc-500">{clip.duration.toFixed(1)}s</span>
                    </div>
                    <div className="flex items-end gap-[1.5px] h-12 mt-2 opacity-50 overflow-hidden">
                      {Array.from({ length: 60 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-zinc-800 dark:bg-white/80 rounded-full"
                          style={{ height: `${25 + Math.random() * 75}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Selection highlight */}
                  <div className="absolute inset-0 ring-2 ring-aurora-500 opacity-0 group-hover:opacity-30 transition-opacity"></div>
                </div>
              ))}
            </div>
          ))}

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-40 pointer-events-none transition-all duration-100 linear shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            style={{ left: `${currentTime * pixelsPerSecond}px` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-6 bg-red-500 rounded-b-lg shadow-xl flex items-center justify-center">
              <div className="w-[1px] h-3 bg-white/40"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
