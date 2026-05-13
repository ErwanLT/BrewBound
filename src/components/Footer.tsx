import React from 'react';
import { Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="h-12 border-t border-slate-200 bg-white flex items-center px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] shrink-0 z-50">
      <div className="flex gap-10">
        <span className="text-amber-600 cursor-default uppercase tracking-widest">Accès libre</span>
        <a 
          href="https://github.com/ErwanLT/BrewBound" 
          target="_blank" 
          rel="noreferrer" 
          className="hover:text-slate-900 transition-colors cursor-pointer uppercase tracking-widest flex items-center gap-1.5 underline decoration-slate-200 underline-offset-4"
        >
          <Github className="w-3 h-3" /> Code source
        </a>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
        <span className="text-slate-400 italic font-mono uppercase tracking-tighter">Données à jour</span>
      </div>
    </footer>
  );
};
