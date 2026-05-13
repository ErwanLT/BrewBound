import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { Beer as BeerIcon, MapPin, Clock, X, Navigation, Plus, Edit2 } from 'lucide-react';
import type { Brewery, Beer } from '../types';

interface BreweryDetailsProps {
  selectedBrewery: Brewery | null;
  breweryBeers: Beer[];
  onClose: () => void;
  onEditBrewery: (b: Brewery) => void;
  onEditBeer: (beer: Beer) => void;
  onAddBeer: () => void;
}

export const BreweryDetails: React.FC<BreweryDetailsProps> = ({
  selectedBrewery,
  breweryBeers,
  onClose,
  onEditBrewery,
  onEditBeer,
  onAddBeer,
}) => {
  return (
    <AnimatePresence>
      {selectedBrewery && (
        <motion.div
          initial={{ opacity: 0, x: 20, y: window.innerWidth < 768 ? 20 : 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 20, y: window.innerWidth < 768 ? 20 : 0 }}
          className="absolute inset-0 md:inset-auto md:right-6 md:top-6 md:bottom-6 w-full md:max-w-md bg-white/95 backdrop-blur-xl z-50 shadow-2xl md:border md:border-slate-200 md:rounded-3xl overflow-hidden flex flex-col"
        >
          <div className="h-1.5 shrink-0 bg-amber-500" />
          <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-start mb-6 md:mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded uppercase tracking-wider">Artisanal</span>
                  <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">{selectedBrewery.city}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">{selectedBrewery.name}</h2>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onEditBrewery(selectedBrewery)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-amber-600 border border-transparent hover:border-slate-200"
                  title="Modifier la brasserie"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-8 md:y-10">
              <section className="space-y-6">
                <div className="text-slate-600 text-sm leading-relaxed italic border-l-2 border-amber-500/40 pl-4 py-1">
                  <ReactMarkdown>{selectedBrewery.description}</ReactMarkdown>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl sm:col-span-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Adresse</h4>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                       <MapPin className="w-3.5 h-3.5 text-amber-500" />
                       {selectedBrewery.address}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Service</h4>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {selectedBrewery.hours}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Lien</h4>
                    <a href={selectedBrewery.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-amber-600 hover:opacity-80 transition-all">
                      <Navigation className="w-3.5 h-3.5" />
                      Site Web
                    </a>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <BeerIcon className="w-6 h-6 text-amber-500" />
                    On Tap
                  </h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{breweryBeers.length} Bières</span>
                </div>

                <div className="space-y-4">
                  {breweryBeers.map((beer, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={beer.id} 
                      className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-amber-200 transition-all shadow-sm group flex gap-4"
                    >
                      {beer.imageUrl && (
                        <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                          <img src={beer.imageUrl} alt={beer.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <h4 className="font-black text-slate-900 group-hover:text-amber-600 transition-colors truncate">{beer.name}</h4>
                            <button 
                              onClick={() => onEditBeer(beer)}
                              className="p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-slate-100 rounded text-slate-400 hover:text-amber-600 transition-all shrink-0"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[9px] font-mono bg-amber-50 px-2 py-0.5 rounded text-amber-600 border border-amber-100 font-bold shrink-0">{beer.abv}</span>
                        </div>
                        <div className="text-[10px] uppercase font-bold text-amber-600/80 mb-2">{beer.style}</div>
                        <div className="text-[11px] text-slate-500 leading-relaxed font-medium">
                          <ReactMarkdown>{beer.description}</ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  <button 
                    onClick={onAddBeer}
                    className="w-full py-3 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    Suggérer une bière
                  </button>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
