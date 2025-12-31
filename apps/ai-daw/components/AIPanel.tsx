
import React, { useState } from 'react';
import { Wand2, Music, Sparkles, Loader2, CheckCircle2, Zap } from 'lucide-react';
import { useStore } from '../store';
import { GoogleGenAI } from '@google/genai';

const AIPanel: React.FC = () => {
  const { addToAIQueue, aiQueue, updateAIStatus, addClip, project } = useStore();
  const [prompt, setPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleEnhance = async () => {
    if (!prompt) return;
    setIsEnhancing(true);
    try {
      const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
      if (!apiKey) {
        throw new Error("Gemini API Key (VITE_GEMINI_API_KEY) not found. Please check your .env.local file.");
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Act as a professional music producer. Enhance this musical prompt to be more descriptive for an AI audio generator. Keep it under 50 words. Prompt: "${prompt}"`,
      });
      const enhancedText = response.text || '';
      setPrompt(enhancedText.trim());
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);

    const genId = Math.random().toString(36).substr(2, 9);
    const newGen = { id: genId, prompt, type: 'audio' as const, status: 'processing' as const, progress: 0 };
    addToAIQueue(newGen);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      updateAIStatus(genId, { progress });
      if (progress >= 100) {
        clearInterval(interval);
        updateAIStatus(genId, { status: 'complete', progress: 100 });
        setIsGenerating(false);

        const aiTrack = project.tracks.find(t => t.type === 'ai') || project.tracks[2] || project.tracks[1];
        addClip(aiTrack.id, {
          id: Math.random().toString(),
          name: `AI: ${prompt.slice(0, 15)}...`,
          startTime: 0,
          duration: 10,
          color: '#22d3ee'
        });
      }
    }, 200);
  };

  return (
    <div className="flex flex-col gap-6 bg-white dark:bg-space-950 transition-colors duration-300">
      <div className="space-y-4">
        <label className="text-[10px] font-bold uppercase text-space-500 tracking-widest flex items-center gap-2">
          <Music size={12} className="text-aurora-600 dark:text-aurora-500" /> AI Audio Prompt
        </label>
        <div className="relative group">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A lo-fi hip hop beat with melancholic piano and dusty vinyl crackle..."
            className="w-full h-32 bg-space-50 dark:bg-space-900 border border-space-200 dark:border-space-800 rounded-lg p-4 text-xs text-space-900 dark:text-space-200 focus:outline-none focus:ring-2 focus:ring-aurora-500/20 focus:border-aurora-600 dark:focus:border-aurora-500/50 transition resize-none custom-scrollbar"
          />
          <button
            onClick={handleEnhance}
            disabled={isEnhancing || !prompt}
            className="absolute bottom-3 right-3 p-2 bg-white dark:bg-space-800 border border-space-200 dark:border-space-700 rounded-md text-aurora-600 dark:text-aurora-400 hover:bg-space-100 dark:hover:bg-space-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            title="Enhance with AI"
          >
            {isEnhancing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          </button>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="w-full bg-gradient-to-r from-aurora-600 to-nebula-600 hover:from-aurora-500 hover:to-nebula-500 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-white shadow-xl shadow-aurora-900/10 dark:shadow-aurora-900/20 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
          {isGenerating ? 'Synthesizing...' : 'Generate Audio'}
        </button>
      </div>

      {aiQueue.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-space-100 dark:border-space-800">
          <span className="text-[10px] font-bold uppercase text-space-400 dark:text-space-500 tracking-widest">Generation Queue</span>
          <div className="flex flex-col gap-3">
            {aiQueue.map(gen => (
              <div key={gen.id} className="bg-space-50 dark:bg-space-900/50 border border-space-100 dark:border-space-800 rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-space-700 dark:text-space-300 font-medium truncate w-40 italic">"{gen.prompt}"</span>
                  {gen.status === 'complete' ? (
                    <CheckCircle2 size={14} className="text-aurora-500" />
                  ) : (
                    <span className="text-[10px] text-aurora-600 dark:text-aurora-400 animate-pulse">{gen.progress}%</span>
                  )}
                </div>
                <div className="h-1 bg-space-200 dark:bg-space-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-aurora-600 dark:bg-aurora-500 transition-all duration-300"
                    style={{ width: `${gen.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPanel;
