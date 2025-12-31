
import React from 'react';
import { X, Check, Zap, Sparkles, Star, Crown, ShieldCheck, Cpu } from 'lucide-react';
import { useStore } from '../store';

interface ProModalProps {
  onClose: () => void;
}

const ProModal: React.FC<ProModalProps> = ({ onClose }) => {
  const { upgradeToPro } = useStore();

  const handleUpgrade = () => {
    upgradeToPro();
    onClose();
    alert('Welcome to OrbitAudio Pro! All features unlocked.');
  };

  const features = [
    { title: "Unlimited Preset Slots", desc: "No more 3-preset limit. Save your entire soundscape library.", icon: <Star className="text-amber-500" /> },
    { title: "Remove Branding", desc: "Export clean videos for YouTube and clients without watermarks.", icon: <ShieldCheck className="text-emerald-500" /> },
    { title: "Exclusive Soundscapes", desc: "Access the Nirvana, Focus Pro, and Dreamscape premium packs.", icon: <Crown className="text-purple-500" /> },
    { title: "Extended 4K Export", desc: "Unlock higher resolutions and 2+ hour session exports.", icon: <Sparkles className="text-cyan-500" /> },
    { title: "Developer API", desc: "Connect OrbitAudio to your external apps and smart home.", icon: <Cpu className="text-indigo-500" /> }
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[3rem] w-full max-w-2xl shadow-[0_0_100px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-full md:w-5/12 bg-gradient-to-br from-cyan-600 to-indigo-900 p-12 text-white flex flex-col justify-between">
           <div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
                 <Zap size={24} className="fill-white" />
              </div>
              <h2 className="text-4xl font-black tracking-tighter leading-none mb-4">ORBIT PRO</h2>
              <p className="text-cyan-100/70 text-sm font-medium leading-relaxed">The ultimate toolkit for professional producers and wellness experts.</p>
           </div>
           
           <div className="mt-12 space-y-4">
              <div className="text-5xl font-black tracking-tighter">$9<span className="text-xl font-bold opacity-50">.99</span></div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Per Month • Cancel Anytime</div>
           </div>
        </div>

        <div className="w-full md:w-7/12 p-12 relative">
           <button onClick={onClose} className="absolute top-8 right-8 text-zinc-400 hover:text-zinc-100 transition"><X size={24} /></button>
           
           <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600 mb-8">Unleashed Power</h3>
           
           <div className="space-y-6 mb-12">
              {features.map((f, i) => (
                <div key={i} className="flex gap-4 group">
                   <div className="mt-1">{f.icon}</div>
                   <div>
                      <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100 group-hover:text-cyan-500 transition-colors">{f.title}</h4>
                      <p className="text-xs text-zinc-500 font-medium">{f.desc}</p>
                   </div>
                </div>
              ))}
           </div>

           <button 
            onClick={handleUpgrade}
            className="w-full bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
           >
             Upgrade to Pro Now
           </button>
        </div>
      </div>
    </div>
  );
};

export default ProModal;
