import React from 'react';
import { Beer as BeerIcon, MapPin, Plus, Menu } from 'lucide-react';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddBrewery: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  searchQuery,
  setSearchQuery,
  onAddBrewery,
}) => {
  return (
    <nav className="h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-8 bg-white shrink-0 z-50">
      <div className="flex items-center gap-2 md:gap-3">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg md:hidden"
        >
          <Menu className="w-6 h-6 text-slate-600" />
        </button>
        <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-[0_4px_15px_rgba(245,158,11,0.2)]">
          <BeerIcon className="w-5 h-5 md:w-6 md:h-6 text-white font-black" />
        </div>
        <span className="text-lg md:text-xl font-black tracking-tighter text-slate-900 uppercase">Brew<span className="text-amber-500">Bound</span></span>
      </div>
      
      <div className="flex-1 max-w-md mx-4 md:mx-8 hidden sm:block">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200 rounded-full py-2 px-10 text-sm focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all shadow-inner"
          />
          <div className="absolute left-3 top-2.5 text-slate-400">
            <MapPin className="w-4 h-4" />
          </div>
        </div>
      </div>

      <button 
        onClick={onAddBrewery}
        className="bg-slate-900 hover:bg-slate-800 text-white px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden xs:inline">Ajouter</span>
      </button>
    </nav>
  );
};
