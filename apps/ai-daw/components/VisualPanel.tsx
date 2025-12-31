
import React, { useState, useRef, useEffect } from 'react';
import {
  Image, Film, Activity, Sparkles, Loader2, Play, Download,
  Share2, Wand2, Type, AlertCircle, BarChart3, Search,
  ExternalLink, Youtube, Instagram, Music, Calendar, Clock, ArrowUpRight, Filter
} from 'lucide-react';
import { useStore } from '../store';
import { GoogleGenAI } from '@google/genai';
import { SocialPlatform } from '../types';

const VisualPanel: React.FC = () => {
  const {
    addToAIQueue, aiQueue, updateAIStatus, addVisualAsset,
    visualAssets, isPlaying, publishingHistory
  } = useStore();
  const [tab, setTab] = useState<'image' | 'video' | 'viz' | 'history'>('image');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Filters for History
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | 'all'>('all');

  // Video/Image settings
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [quality, setQuality] = useState<'speed' | 'quality'>('speed');

  // Procedural Visualizer
  useEffect(() => {
    if (tab !== 'viz' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.002;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      if (isPlaying) {
        for (let i = 0; i < 60; i++) {
          const angle = (i / 60) * Math.PI * 2 + time;
          const radius = 60 + Math.sin(time * 3 + i) * 35;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${(time * 60 + i * 6) % 360}, 80%, 65%)`;
          ctx.fill();
        }
      } else {
        ctx.fillStyle = '#666';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('AUDIO INACTIVE', centerX, centerY);
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [tab, isPlaying]);

  const handleGenerate = async () => {
    if (!prompt) return;
    setError(null);

    if (tab === 'video') {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
    }

    setIsGenerating(true);
    const genId = Math.random().toString(36).substr(2, 9);

    addToAIQueue({
      id: genId,
      prompt,
      type: tab as any,
      status: 'processing',
      progress: 0
    });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      if (tab === 'image') {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: prompt }] },
          config: {
            imageConfig: { aspectRatio: aspectRatio === '16:9' ? '16:9' : aspectRatio === '9:16' ? '9:16' : '1:1' }
          }
        });

        let base64Data = '';
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Data = part.inlineData.data;
            break;
          }
        }

        if (base64Data) {
          const imageUrl = `data:image/png;base64,${base64Data}`;
          updateAIStatus(genId, { status: 'complete', progress: 100 });
          addVisualAsset({ id: Math.random().toString(), type: 'image', url: imageUrl, prompt });
        } else {
          throw new Error('No image data returned from model');
        }

      } else if (tab === 'video') {
        const modelName = quality === 'quality' ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';

        let operation = await ai.models.generateVideos({
          model: modelName,
          prompt,
          config: {
            numberOfVideos: 1,
            resolution: resolution as any,
            aspectRatio: aspectRatio === '1:1' ? '16:9' : aspectRatio as any
          }
        });

        while (!operation.done) {
          updateAIStatus(genId, { progress: Math.min(98, (aiQueue.find(q => q.id === genId)?.progress || 0) + 2) });
          await new Promise(resolve => setTimeout(resolve, 10000));

          try {
            operation = await ai.operations.getVideosOperation({ operation });
          } catch (e: any) {
            if (e.message?.includes('Requested entity was not found')) {
              await (window as any).aistudio.openSelectKey();
              throw new Error("API Key session expired. Please re-select your key.");
            }
            throw e;
          }
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
          const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
          const blob = await videoResponse.blob();
          const videoUrl = URL.createObjectURL(blob);

          updateAIStatus(genId, { status: 'complete', progress: 100 });
          addVisualAsset({ id: Math.random().toString(), type: 'video', url: videoUrl, prompt });
        } else {
          throw new Error('Video generation failed to return a result');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed');
      updateAIStatus(genId, { status: 'failed', progress: 0 });
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredHistory = publishingHistory.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || item.stats.some(s => s.platform === platformFilter);
    return matchesSearch && matchesPlatform;
  });

  const totalViews = publishingHistory.reduce((acc, item) =>
    acc + item.stats.reduce((sAcc, s) => sAcc + s.views, 0), 0
  );

  return (
    <div className="flex flex-col h-full gap-4 bg-white dark:bg-space-950 transition-colors duration-300">
      <div className="flex bg-space-100 dark:bg-space-900 p-1 rounded-lg border border-space-200 dark:border-space-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setTab('image')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-[10px] font-bold uppercase tracking-wider transition whitespace-nowrap ${tab === 'image' ? 'bg-white dark:bg-space-800 text-aurora-600 dark:text-aurora-400 shadow-sm' : 'text-space-500 hover:text-space-300'}`}
        >
          <Image size={14} /> Image
        </button>
        <button
          onClick={() => setTab('video')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-[10px] font-bold uppercase tracking-wider transition whitespace-nowrap ${tab === 'video' ? 'bg-white dark:bg-space-800 text-nebula-600 dark:text-nebula-400 shadow-sm' : 'text-space-500 hover:text-space-300'}`}
        >
          <Film size={14} /> Video
        </button>
        <button
          onClick={() => setTab('viz')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-[10px] font-bold uppercase tracking-wider transition whitespace-nowrap ${tab === 'viz' ? 'bg-white dark:bg-space-800 text-aurora-600 dark:text-aurora-400 shadow-sm' : 'text-space-500 hover:text-space-300'}`}
        >
          <Activity size={14} /> Viz
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-[10px] font-bold uppercase tracking-wider transition whitespace-nowrap ${tab === 'history' ? 'bg-white dark:bg-space-800 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-space-500 hover:text-space-300'}`}
        >
          <BarChart3 size={14} /> History
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
        {tab === 'history' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-gradient-to-br from-aurora-500/10 to-transparent border border-aurora-500/20 rounded-[1.5rem]">
                <div className="text-[10px] font-black text-aurora-600 dark:text-aurora-400 uppercase tracking-widest mb-1">Lifetime Views</div>
                <div className="text-2xl font-black text-space-900 dark:text-space-100 mono tracking-tighter">{totalViews.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-nebula-500/10 to-transparent border border-nebula-500/20 rounded-[1.5rem]">
                <div className="text-[10px] font-black text-nebula-600 dark:text-nebula-400 uppercase tracking-widest mb-1">Posts</div>
                <div className="text-2xl font-black text-space-900 dark:text-space-100 mono tracking-tighter">{publishingHistory.length}</div>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-space-500" />
                <input
                  type="text"
                  placeholder="Search your posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-space-50 dark:bg-space-900 border border-space-200 dark:border-space-800 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-aurora-500 transition-all"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {(['all', 'youtube', 'tiktok', 'instagram', 'spotify'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPlatformFilter(p)}
                    className={`px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${platformFilter === p ? 'bg-space-900 dark:bg-space-100 text-white dark:text-space-900 border-space-900' : 'bg-white dark:bg-space-950 text-space-500 border-space-200 dark:border-space-800 hover:border-space-300'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* History List */}
            <div className="space-y-4 pb-4">
              {filteredHistory.length > 0 ? filteredHistory.map(item => (
                <div key={item.id} className="group relative bg-white dark:bg-space-950 border border-space-100 dark:border-space-800 rounded-[1.5rem] p-4 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-aurora-500/5 transition-all">
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                      <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      {item.status === 'scheduled' && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                          <Clock size={16} className="text-amber-400 mb-1" />
                          <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Sch.</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-xs font-bold text-space-900 dark:text-space-100 truncate mb-1">{item.title}</h4>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1 text-[9px] text-space-500 font-medium">
                          <Calendar size={10} />
                          {new Date(item.publishDate).toLocaleDateString()}
                        </div>
                        <div className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${item.status === 'published' ? 'bg-aurora-500/10 text-aurora-600' : 'bg-amber-500/10 text-amber-600'}`}>
                          {item.status}
                        </div>
                      </div>

                      {/* Platform Micro Stats */}
                      <div className="flex flex-wrap gap-2">
                        {item.stats.map((stat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-space-50 dark:bg-space-900/50 px-2 py-1 rounded-lg border border-space-100 dark:border-space-800/50">
                            {stat.platform === 'youtube' && <Youtube size={10} className="text-red-500" />}
                            {stat.platform === 'tiktok' && <Music size={10} className="text-aurora-500" />}
                            {stat.platform === 'instagram' && <Instagram size={10} className="text-pink-500" />}
                            <span className="text-[9px] font-bold text-space-700 dark:text-space-300 mono">
                              {stat.views > 1000 ? `${(stat.views / 1000).toFixed(1)}k` : stat.views}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button className="p-2 bg-white dark:bg-space-800 border border-space-200 dark:border-space-700 rounded-lg text-space-500 hover:text-aurora-500 transition">
                      <ExternalLink size={14} />
                    </button>
                    <button className="p-2 bg-white dark:bg-space-800 border border-space-200 dark:border-space-700 rounded-lg text-space-500 hover:text-aurora-500 transition">
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-20 flex flex-col items-center justify-center opacity-40">
                  <Filter size={32} className="text-zinc-500 mb-4" />
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-center">No Matches Found</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-[10px] text-red-500">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {tab !== 'viz' ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-space-500 tracking-widest flex items-center gap-2">
                    <Wand2 size={12} className="text-aurora-500" /> {tab === 'image' ? 'Style Prompt' : 'Scene Prompt'}
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={tab === 'image' ? "Ethereal forest with floating geometric shapes, synthwave aesthetic..." : "Slow zoom into a futuristic recording studio, glowing purple lights..."}
                    className="w-full h-24 bg-space-50 dark:bg-space-900 border border-space-200 dark:border-space-800 rounded-lg p-3 text-xs text-space-900 dark:text-space-200 focus:outline-none focus:ring-2 focus:ring-aurora-500/20 transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase text-zinc-500 font-bold tracking-tighter">Aspect Ratio</span>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value as any)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-1 text-[10px] text-zinc-700 dark:text-zinc-300"
                    >
                      <option value="16:9">16:9 Landscape</option>
                      <option value="9:16">9:16 Portrait</option>
                      <option value="1:1">1:1 Square</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase text-zinc-500 font-bold tracking-tighter">Model Profile</span>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value as any)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-1 text-[10px] text-zinc-700 dark:text-zinc-300"
                    >
                      <option value="speed">Fast Generation</option>
                      <option value="quality">High Fidelity</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt}
                  className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-white shadow-lg disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isGenerating ? 'Rendering...' : `Create ${tab === 'image' ? 'Image' : 'Video'}`}
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner">
                  <canvas ref={canvasRef} width={400} height={225} className="w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-3 left-3 flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-100 tracking-widest uppercase">Live Visualizer</span>
                    <span className="text-[8px] text-emerald-400 mono">Synced to Beat</span>
                  </div>
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-md transition"><Play size={12} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Geometric', 'Particle Cloud', 'Frequency Bars', 'Neural Web'].map(style => (
                    <button key={style} className="p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[10px] font-bold text-zinc-500 dark:text-zinc-400 hover:border-emerald-500/50 hover:text-emerald-500 transition-all">{style}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Assets Gallery */}
            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-widest">Your Assets</span>
              <div className="grid grid-cols-2 gap-3">
                {visualAssets.map(asset => (
                  <div key={asset.id} className="relative aspect-square rounded-xl overflow-hidden group border border-space-200 dark:border-space-800 bg-space-950 shadow-sm">
                    {asset.type === 'video' ? (
                      <video
                        src={asset.url}
                        className="w-full h-full object-cover"
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                        muted
                        loop
                      />
                    ) : (
                      <img src={asset.url} alt="" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <a href={asset.url} download={`orbit-export-${asset.id}`} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white backdrop-blur-sm"><Download size={16} /></a>
                      <button className="p-2 bg-aurora-600 hover:bg-aurora-500 rounded-xl text-white shadow-lg"><Share2 size={16} /></button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase text-white tracking-widest backdrop-blur-md">
                      {asset.type}
                    </div>
                  </div>
                ))}
                {visualAssets.length === 0 && !isGenerating && (
                  <div className="col-span-2 py-12 flex flex-col items-center justify-center text-space-400 dark:text-space-600 opacity-60">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-space-300 dark:border-space-800 flex items-center justify-center mb-3">
                      <Image size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-center">Empty Canvas</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VisualPanel;
