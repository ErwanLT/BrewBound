import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Brewery } from '../types';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  filteredBreweries: Brewery[];
  selectedBrewery: Brewery | null;
  handleSelect: (b: Brewery) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  filteredBreweries,
  selectedBrewery,
  handleSelect,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <>
      <aside className={`fixed inset-y-0 left-0 w-80 md:w-96 border-r border-slate-200 bg-white flex flex-col shrink-0 z-[60] transition-transform duration-300 transform md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 md:p-6 shrink-0 border-b border-slate-100 bg-white/80 backdrop-blur-md flex justify-between items-center">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Brasseries locales ({filteredBreweries.length})</h2>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 hover:bg-slate-100 rounded-lg md:hidden"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Mobile Search - only visible in sidebar on small screens */}
        <div className="p-4 border-b border-slate-50 sm:hidden">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-10 text-xs focus:outline-none focus:border-amber-500/50"
            />
            <div className="absolute left-3 top-2.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
          {filteredBreweries.map((b) => (
            <motion.button
              layout
              key={b.id}
              onClick={() => handleSelect(b)}
              className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedBrewery?.id === b.id 
                  ? 'bg-amber-50 border-amber-500/40 ring-1 ring-amber-500/20 shadow-lg' 
                  : 'bg-white border-slate-100 hover:border-amber-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className={`font-black tracking-tight text-sm leading-tight pr-2 ${selectedBrewery?.id === b.id ? 'text-slate-900' : 'text-slate-700'}`}>{b.name}</h3>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-2">
                <MapPin className="w-3 h-3 text-slate-400" />
                {b.city}
              </div>
              <div className="flex items-center justify-between mt-4">
                 <div className={`text-[10px] font-black tracking-wider uppercase ${selectedBrewery?.id === b.id ? 'text-amber-600' : 'text-slate-400'}`}>
                    Voir la carte & bières
                 </div>
                 <ChevronRight className={`w-4 h-4 ${selectedBrewery?.id === b.id ? 'text-amber-500' : 'text-slate-300'}`} />
              </div>
            </motion.button>
          ))}
        </div>
      </aside>

      {/* Mobile Overlay Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[55] md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};
