
import React from 'react';
import { useStore } from '../store';
import { Zap, Activity, Sliders, Volume2, MoveHorizontal } from 'lucide-react';

interface MixerProps {
   mini?: boolean;
}

const Mixer: React.FC<MixerProps> = ({ mini = false }) => {
   const { project, updateTrack, selectedTrackId, selectTrack } = useStore();

   const renderChannelStrip = (track: any) => (
      <div
         key={track.id}
         onClick={() => selectTrack(track.id)}
         className={`flex flex-col border-r border-space-200 dark:border-space-800/60 h-full transition-all duration-300 ${selectedTrackId === track.id ? 'bg-space-100 dark:bg-space-900/40 shadow-inner' : 'hover:bg-space-50/50 dark:hover:bg-space-900/20'} ${mini ? 'w-24 shrink-0' : 'w-40 shrink-0'}`}
      >
         {/* Top Section: Inputs & Gains */}
         <div className="p-3 border-b border-space-200 dark:border-space-800/60 bg-space-50/50 dark:bg-space-950/20">
            <div className="flex items-center justify-between mb-2">
               <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: track.color }}></div>
               <span className="text-[9px] font-black text-space-400 dark:text-space-500 uppercase tracking-widest truncate">{track.id.split('-')[0]}</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
               <div className="w-8 h-8 rounded-full border-2 border-space-200 dark:border-space-800 flex items-center justify-center relative bg-space-100 dark:bg-space-900 shadow-sm cursor-ns-resize group">
                  <div className="w-1 h-3 bg-aurora-500 rounded-full transition-transform duration-300" style={{ transform: `rotate(${track.pan * 90}deg)` }}></div>
                  <div className="absolute -top-4 text-[7px] font-bold text-space-500 uppercase tracking-tighter">Pan</div>
               </div>
            </div>
         </div>

         {/* Meter Section */}
         <div className="flex-1 flex px-4 py-8 items-end gap-1.5 bg-gradient-to-b from-transparent to-space-50 dark:to-space-950/20">
            <div className="flex-1 h-full bg-space-200 dark:bg-[#0c0c0e] rounded-sm relative overflow-hidden border border-space-300 dark:border-space-800/50">
               <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-aurora-600 via-aurora-400 to-green-400 transition-all duration-100" style={{ height: `${Math.random() * 70 + 10}%` }}></div>
               <div className="absolute inset-0 flex flex-col justify-between p-1.5 opacity-10 pointer-events-none">
                  {[0, 6, 12, 18, 24, 30, 36, 42, 48].map(v => <div key={v} className="border-t border-space-900 dark:border-white w-full"></div>)}
               </div>
            </div>
            <div className="flex-1 h-full bg-space-200 dark:bg-[#0c0c0e] rounded-sm relative overflow-hidden border border-space-300 dark:border-space-800/50">
               <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-aurora-600 via-aurora-400 to-green-400 transition-all duration-100" style={{ height: `${Math.random() * 65 + 15}%` }}></div>
            </div>
         </div>

         {/* Fader Track */}
         <div className="h-60 px-5 flex flex-col items-center group bg-space-50 dark:bg-transparent">
            <div className="flex-1 w-[2px] bg-space-300 dark:bg-space-800 relative">
               {/* Legend */}
               <div className="absolute -left-4 inset-y-0 flex flex-col justify-between py-2 text-[7px] font-bold text-space-400 dark:text-space-500 mono">
                  <span>+6</span><span>0</span><span>-6</span><span>-12</span><span>-24</span><span>-inf</span>
               </div>

               <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={track.volume}
                  onChange={(e) => updateTrack(track.id, { volume: parseFloat(e.target.value) })}
                  className="absolute -left-[64px] top-[100px] w-32 -rotate-90 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-space-100 dark:[&::-webkit-slider-thumb]:bg-space-200 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-space-800 dark:[&::-webkit-slider-thumb]:border-space-400 [&::-webkit-slider-thumb]:shadow-2xl z-20"
               />
            </div>
            <div className="mono text-[11px] font-black text-aurora-600 dark:text-aurora-400 my-4 bg-white dark:bg-space-900 px-2 py-0.5 rounded border border-space-200 dark:border-space-800 shadow-sm">
               {(track.volume * 10 - 5).toFixed(1)} <span className="text-[8px] opacity-60">dB</span>
            </div>
         </div>

         {/* Bottom Controls */}
         <div className="p-3 border-t border-space-200 dark:border-space-800/80 bg-white dark:bg-space-950/80 glass">
            <div className="flex gap-1.5 mb-3">
               <button
                  onClick={(e) => { e.stopPropagation(); updateTrack(track.id, { muted: !track.muted }); }}
                  className={`flex-1 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all border ${track.muted ? 'bg-red-500 text-white border-red-600 shadow-lg' : 'bg-space-100 dark:bg-space-900 text-space-500 border-space-200 dark:border-space-800 hover:border-space-400'}`}
               >
                  MUTE
               </button>
               <button
                  onClick={(e) => { e.stopPropagation(); updateTrack(track.id, { soloed: !track.soloed }); }}
                  className={`flex-1 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all border ${track.soloed ? 'bg-amber-500 text-white border-amber-600 shadow-lg' : 'bg-space-100 dark:bg-space-900 text-space-500 border-space-200 dark:border-space-800 hover:border-space-400'}`}
               >
                  SOLO
               </button>
            </div>
            <div className="text-[10px] font-black text-space-900 dark:text-space-200 text-center truncate uppercase tracking-tight leading-none mb-1">{track.name}</div>
         </div>
      </div>
   );

   return (
      <div className="flex h-full overflow-x-auto custom-scrollbar bg-white dark:bg-[#080808] transition-colors duration-300">
         {mini ? (
            <div className="flex flex-col gap-3 w-full p-2">
               {project.tracks.map(t => (
                  <div key={t.id} className="bg-white dark:bg-space-900/50 rounded-xl p-3 border border-space-200 dark:border-space-800 shadow-sm">
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black uppercase text-space-500 truncate w-32 tracking-tighter">{t.name}</span>
                        <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.8)]" style={{ backgroundColor: t.color }}></div>
                     </div>
                     <div className="h-1 bg-space-100 dark:bg-space-800 rounded-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-aurora-500" style={{ width: `${t.volume * 100}%` }}></div>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <>
               {project.tracks.map(track => renderChannelStrip(track))}

               {/* Master Out Strip */}
               <div className="w-48 flex flex-col border-l-4 border-l-aurora-600 dark:border-l-aurora-500/30 h-full bg-space-50 dark:bg-space-900/10 border-r border-space-200 dark:border-space-800 relative z-10 shrink-0">
                  <div className="absolute top-0 right-0 p-3 opacity-10"><Sliders size={40} /></div>
                  <div className="flex-1 flex px-6 py-10 items-end gap-2">
                     <div className="flex-1 h-full bg-space-200 dark:bg-space-950 rounded-md relative overflow-hidden border border-space-300 dark:border-space-800">
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-aurora-600 via-aurora-400 to-green-400 shadow-[0_0_20px_rgba(74,222,128,0.4)]" style={{ height: '72%' }}></div>
                     </div>
                     <div className="flex-1 h-full bg-space-200 dark:bg-space-950 rounded-md relative overflow-hidden border border-space-300 dark:border-space-800">
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-aurora-600 via-aurora-400 to-green-400 shadow-[0_0_20px_rgba(74,222,128,0.4)]" style={{ height: '75%' }}></div>
                     </div>
                  </div>
                  <div className="h-60 px-8 flex flex-col items-center justify-center bg-white dark:bg-transparent">
                     <div className="flex-1 w-1 bg-gradient-to-b from-aurora-500/20 to-transparent dark:from-aurora-400/20 relative">
                        <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-12 h-6 bg-white dark:bg-space-200 border-2 border-space-800 shadow-2xl rounded shadow-aurora-500/10 transition-all hover:-translate-y-1 cursor-ns-resize"></div>
                     </div>
                     <div className="mono text-[12px] text-aurora-700 dark:text-aurora-400 mt-6 font-black uppercase tracking-[0.2em] bg-aurora-500/10 px-4 py-1 rounded-full border border-aurora-500/30">Master</div>
                  </div>
                  <div className="p-6 border-t border-space-200 dark:border-space-800 bg-white dark:bg-space-950 glass flex flex-col items-center gap-2">
                     <Zap size={20} className="text-aurora-600 dark:text-aurora-400 animate-pulse-subtle" />
                     <div className="text-[10px] font-black text-space-900 dark:text-space-100 uppercase tracking-[0.3em]">Broadcast Out</div>
                  </div>
               </div>
            </>
         )}
      </div>
   );
};

export default Mixer;
