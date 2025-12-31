import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandIcon } from '@orbit/ui';
import { Activity, Wind, Zap, Coffee, Brain } from 'lucide-react';
import { getAuthService } from '@orbit/auth';

const FIREBASE_CONFIG = {
    apiKey: "dummy-key",
    authDomain: "orbit-audio.firebaseapp.com",
    projectId: "orbit-audio",
    storageBucket: "orbit-audio.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

const MODES = [
    {
        id: 'deep-work',
        name: 'Deep Work',
        icon: Brain,
        color: 'text-aurora-500',
        bg: 'bg-aurora-500/10',
        description: 'High-gravity focus. Minimizes novelty.'
    },
    {
        id: 'reset',
        name: 'Walking Reset',
        icon: Wind,
        color: 'text-nebula-500',
        bg: 'bg-nebula-500/10',
        description: 'Grounding rhythm. Re-anchors equilibrium.'
    },
    {
        id: 'focus',
        name: 'ADHD Focus',
        icon: Zap,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        description: 'Steady engagement. Shields against drift.'
    },
    {
        id: 'low-energy',
        name: 'Spoon Saver',
        icon: Coffee,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        description: 'Soft persistence. Reduces cognitive load.'
    }
];

export default function App() {
    const [activeMode, setActiveMode] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const auth = getAuthService(FIREBASE_CONFIG);
        if (auth) {
            auth.onUserChange((user) => {
                console.log('Context User State:', user?.uid);
            });
        }
    }, []);

    const handleModeSelection = async (modeId: string) => {
        setActiveMode(modeId);
        setIsSyncing(true);

        const auth = getAuthService();
        if (auth) {
            await auth.syncState({
                modeId,
                lastActive: Date.now(),
                platform: 'mobile',
                type: 'attention_anchor'
            }, { collection: 'neural_states' });
        }

        setIsSyncing(false);
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 font-sans">
            <header className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                    <BrandIcon className="w-8 h-8 text-white" />
                    <h1 className="text-xl font-black uppercase tracking-tighter">Orbit Context</h1>
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                    <Activity size={20} className="text-zinc-400" />
                </div>
            </header>

            <main>
                <div className="mb-8">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Cognitive Gravity</h2>
                    <p className="text-2xl font-bold">Where is your attention anchored?</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {MODES.map((mode) => (
                        <motion.button
                            key={mode.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleModeSelection(mode.id)}
                            className={`relative overflow-hidden p-6 rounded-3xl border transition-all flex items-center justify-between ${activeMode === mode.id
                                    ? `border-white ${mode.bg}`
                                    : 'border-zinc-800 bg-zinc-900/50'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${activeMode === mode.id ? 'bg-white text-black' : 'bg-black text-white border border-zinc-800'}`}>
                                    <mode.icon size={24} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-lg">{mode.name}</div>
                                    <div className="text-[10px] uppercase font-black tracking-widest text-zinc-500">{mode.description}</div>
                                </div>
                            </div>
                            {activeMode === mode.id && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
                                >
                                    <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                                </motion.div>
                            )}
                        </motion.button>
                    ))}
                </div>
            </main>

            <AnimatePresence>
                {activeMode && (
                    <motion.footer
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-0 left-0 right-0 p-6 bg-zinc-900 border-t border-zinc-800"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[10px] uppercase font-black text-zinc-500 mb-1">Attention Anchor</div>
                                <div className="text-lg font-bold flex items-center gap-2">
                                    {isSyncing ? 'Anchoring...' : 'State Persistent'}
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveMode(null)}
                                className="px-6 py-3 bg-white text-black rounded-full font-black uppercase text-[10px] tracking-widest"
                            >
                                Release Anchor
                            </button>
                        </div>
                    </motion.footer>
                )}
            </AnimatePresence>
        </div>
    );
}
