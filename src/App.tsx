import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { Beer as BeerIcon, MapPin, Clock, Info, ChevronRight, X, Navigation, Plus, Github, CheckCircle2, Edit2 } from 'lucide-react';
import type { Brewery, Beer } from './types';

// Data imports
import breweriesData from './data/breweries.json';
import beersData from './data/beers.json';

// Leaflet Icons
const DefaultIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #f59e0b; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const ActiveIcon = L.divIcon({
  className: 'custom-div-icon-active',
  html: `<div style="background-color: #f59e0b; width: 28px; height: 28px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 20px rgba(245, 158, 11, 0.6); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

function MapSync({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const BEER_STYLES = [
  "IPA", "Double IPA", "Triple IPA", "Session IPA", "NEIPA / Hazy IPA", "West Coast IPA", "Black IPA", "White IPA", "Milkshake IPA", "Brut IPA", "Rye IPA", "Cold IPA", "Mountain IPA",
  "Pale Ale", "American Pale Ale", "Amber Ale", "Red Ale", "Blonde Ale", "Strong Ale",
  "Lager", "Pilsner", "Helles", "Dunkel", "Schwarzbier", "Kellerbier", "Export",
  "Stout", "Imperial Stout", "Milk Stout", "Oatmeal Stout", "Pastry Stout", "Coffee Stout", "Irish Dry Stout",
  "Porter", "Imperial Porter", "Baltic Porter", "Pastry Porter",
  "Saison", "Farmhouse Ale", "Witbier", "Hefeweizen", "Kristalweizen", "Weizenbock", "Dunkelweizen", "Berliner Weisse",
  "Gose", "Sour Ale", "Fruited Sour", "Pastry Sour", "Smoothie Sour", "Wild Ale", "Lambic", "Gueuze", "Kriek", "Flanders Red Ale", "Oud Bruin",
  "Triple (Belge)", "Double / Dubbel", "Quadrupel", "Enkel / Patersbier", "Belgian Golden Strong Ale", "Belgian Dark Strong Ale",
  "Bock", "Doppelbock", "Eisbock", "Maibock", "Altbier", "Kölsch",
  "Barleywine", "Old Ale", "Scotch Ale / Wee Heavy", "Irish Red Ale", "English Bitter", "ESB", "Mild Ale",
  "Smoked Beer / Rauchbier", "Wood-Aged Beer", "Barrel-Aged", "Vière (Hybride Bière/Vin)", "Hard Seltzer", "Non-Alcoholic", "Pastry Ale"
];

export default function App() {
  const [breweries] = useState<Brewery[]>(breweriesData as Brewery[]);
  const [beers] = useState<Beer[]>(beersData as Beer[]);
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isContributing, setIsContributing] = useState<'brewery' | 'beer' | null>(null);
  const [editingItem, setEditingItem] = useState<Brewery | Beer | null>(null);
  const [contributionSuccess, setContributionSuccess] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([46.603354, 1.888334]); // France center

  const filteredBreweries = useMemo(() => {
    return breweries.filter(b => 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [breweries, searchQuery]);

  const breweryBeers = useMemo(() => {
    if (!selectedBrewery) return [];
    return beers.filter(beer => beer.breweryId === selectedBrewery.id);
  }, [selectedBrewery, beers]);

  const handleSelect = (b: Brewery) => {
    setSelectedBrewery(b);
    if (b.lat && b.lng) {
      setMapCenter([b.lat, b.lng]);
    }
  };

  const handleContribute = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const response = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: isContributing, 
          data: {
            ...(editingItem ? { id: editingItem.id } : {}),
            ...data,
            ...(isContributing === 'beer' ? { breweryId: selectedBrewery?.id } : {})
          },
          timestamp: new Date().toISOString() 
        })
      });
      const result = await response.json();
      
      if (result.success) {
        setContributionSuccess(true);
        if (result.prUrl && result.prUrl !== "https://github.com/user/brewbound/pulls") {
          setPrUrl(result.prUrl);
        } else {
          setTimeout(() => {
            setIsContributing(null);
            setEditingItem(null);
            setContributionSuccess(false);
          }, 3000);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans">
      {/* Header Navigation */}
      <nav className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-[0_4px_15px_rgba(245,158,11,0.2)]">
            <BeerIcon className="w-6 h-6 text-white font-black" />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">Brew<span className="text-amber-500">Bound</span></span>
        </div>
        
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Rechercher une brasserie ou une ville..."
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
          onClick={() => setIsContributing('brewery')}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </nav>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 md:w-96 border-r border-slate-200 bg-white flex flex-col shrink-0 z-40">
          <div className="p-6 shrink-0 border-b border-slate-100 bg-white/80 backdrop-blur-md">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Brasseries locales ({filteredBreweries.length})</h2>
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

        {/* Map Area */}
        <main className="flex-1 relative bg-slate-100">
          <div className="absolute inset-0 z-0">
            <MapContainer 
              center={mapCenter} 
              zoom={6} 
              className="w-full h-full"
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              />
              <MapSync center={mapCenter} />
              {filteredBreweries.filter(b => b.lat && b.lng).map(b => (
                <Marker 
                  key={b.id} 
                  position={[b.lat, b.lng]}
                  icon={selectedBrewery?.id === b.id ? ActiveIcon : DefaultIcon}
                  eventHandlers={{ click: () => handleSelect(b) }}
                />
              ))}
            </MapContainer>
          </div>

          {/* Details Overlay */}
          <AnimatePresence>
            {selectedBrewery && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute right-6 top-6 bottom-6 w-full max-w-md bg-white/95 backdrop-blur-xl z-50 shadow-2xl border border-slate-200 rounded-3xl overflow-hidden flex flex-col"
              >
                <div className="h-1.5 shrink-0 bg-amber-500" />
                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded uppercase tracking-wider">Artisanal</span>
                        <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">{selectedBrewery.city}</span>
                      </div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{selectedBrewery.name}</h2>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingItem(selectedBrewery);
                          setIsContributing('brewery');
                        }}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-amber-600 border border-transparent hover:border-slate-200"
                        title="Modifier la brasserie"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setSelectedBrewery(null)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <section className="space-y-6">
                      <div className="text-slate-600 text-sm leading-relaxed italic border-l-2 border-amber-500/40 pl-4 py-1">
                        <ReactMarkdown>{selectedBrewery.description}</ReactMarkdown>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl col-span-2">
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
                              <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                                <img src={beer.imageUrl} alt={beer.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-black text-slate-900 group-hover:text-amber-600 transition-colors">{beer.name}</h4>
                                  <button 
                                    onClick={() => {
                                      setEditingItem(beer);
                                      setIsContributing('beer');
                                    }}
                                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-100 rounded text-slate-400 hover:text-amber-600 transition-all"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <span className="text-[9px] font-mono bg-amber-50 px-2 py-0.5 rounded text-amber-600 border border-amber-100 font-bold">{beer.abv}</span>
                              </div>
                              <div className="text-[10px] uppercase font-bold text-amber-600/80 mb-2">{beer.style}</div>
                              <div className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                <ReactMarkdown>{beer.description}</ReactMarkdown>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        
                        <button 
                          onClick={() => setIsContributing('beer')}
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
        </main>
      </div>

      {/* Contribution Modal */}
      <AnimatePresence>
        {isContributing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
                    {editingItem 
                      ? `Modifier ${isContributing === 'brewery' ? 'la brasserie' : 'la bière'}`
                      : isContributing === 'brewery' 
                        ? 'Ajouter une brasserie' 
                        : `Ajouter une bière chez ${selectedBrewery?.name}`
                    }
                  </h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Contribution collaborative via GitHub</p>
                </div>
                <button onClick={() => {
                  setIsContributing(null);
                  setEditingItem(null);
                  setContributionSuccess(false);
                  setPrUrl(null);
                }} className="bg-white border border-slate-200 p-2 rounded-full hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                {contributionSuccess ? (
                  <div className="py-12 text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Action envoyée !</h3>
                      <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">Votre proposition a été transmise avec succès.</p>
                    </div>
                    
                    {prUrl && (
                      <div className="pt-4">
                        <a 
                          href={prUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                        >
                          <Github className="w-4 h-4" />
                          Voir la Pull Request
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleContribute} className="space-y-6">
                    {isContributing === 'brewery' ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom de la brasserie</label>
                            <input name="name" defaultValue={(editingItem as Brewery)?.name} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-900 placeholder:text-slate-300" placeholder="Ex: Popihn" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ville</label>
                            <input name="city" defaultValue={(editingItem as Brewery)?.city} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-900 placeholder:text-slate-300" placeholder="Ex: Sens" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adresse complète</label>
                          <div className="flex gap-2">
                            <input name="address" id="address-input" defaultValue={(editingItem as Brewery)?.address} required className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-900 placeholder:text-slate-300" placeholder="28 Rue des brasseurs..." />
                            <button 
                              type="button"
                              onClick={async () => {
                                const addr = (document.getElementById('address-input') as HTMLInputElement).value;
                                if (!addr) return;
                                try {
                                  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addr)}&format=json&limit=1`);
                                  const geo = await res.json();
                                  if (geo && geo[0]) {
                                    (document.getElementById('lat-input') as HTMLInputElement).value = geo[0].lat;
                                    (document.getElementById('lng-input') as HTMLInputElement).value = geo[0].lon;
                                    alert(`Adresse localisée ! (Lat: ${geo[0].lat}, Lng: ${geo[0].lon})`);
                                  } else {
                                    alert("Adresse non trouvée.");
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              Localiser
                            </button>
                          </div>
                          <input type="hidden" name="lat" id="lat-input" defaultValue={(editingItem as Brewery)?.lat} />
                          <input type="hidden" name="lng" id="lng-input" defaultValue={(editingItem as Brewery)?.lng} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Site Web</label>
                            <input name="website" defaultValue={(editingItem as Brewery)?.website} type="url" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-900 placeholder:text-slate-300" placeholder="https://..." />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horaires</label>
                            <input name="hours" defaultValue={(editingItem as Brewery)?.hours} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-900 placeholder:text-slate-300" placeholder="Mer-Dim: 14h-22h" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                            Description
                            <span className="font-mono lowercase normal-case opacity-60">Markdown supporté (**gras**, *italique*)</span>
                          </label>
                          <textarea name="description" defaultValue={(editingItem as Brewery)?.description} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 h-24 resize-none text-slate-900 placeholder:text-slate-300" placeholder="Brève histoire ou spécialité..." />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom de la bière</label>
                            <input name="name" defaultValue={(editingItem as Beer)?.name} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-900 placeholder:text-slate-300" placeholder="Ex: West Coast IPA" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Style</label>
                            <div className="relative">
                              <select name="style" defaultValue={(editingItem as Beer)?.style || ""} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-900 appearance-none cursor-pointer">
                                <option value="" disabled className="bg-white">Choisir un style...</option>
                                {BEER_STYLES.sort().map(style => (
                                  <option key={style} value={style} className="bg-white text-slate-900">{style}</option>
                                ))}
                              </select>
                              <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">
                                <ChevronRight className="w-4 h-4 rotate-90" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ABV (%)</label>
                            <input name="abv" defaultValue={(editingItem as Beer)?.abv} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-900 placeholder:text-slate-300" placeholder="Ex: 6.5%" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">URL de l'image (étiquette)</label>
                            <input name="imageUrl" defaultValue={(editingItem as Beer)?.imageUrl} type="url" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-900 placeholder:text-slate-300" placeholder="https://..." />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                            Description Gustative
                            <span className="font-mono lowercase normal-case opacity-60">Markdown supporté (**gras**, *italique*)</span>
                          </label>
                          <textarea name="description" defaultValue={(editingItem as Beer)?.description} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 h-24 resize-none text-slate-900 placeholder:text-slate-300" placeholder="Notes de dégustation, houblons utilisés..." />
                        </div>
                      </>
                    )}
                    
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                      <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center italic text-xs font-black text-slate-400 shadow-sm">Git</div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-slate-700 capitalize tracking-tight">Soumission Collaborative</p>
                        <p className="text-[10px] text-slate-400 leading-tight">Cette action génère une proposition de modification dans nos fichiers de données via GitHub.</p>
                      </div>
                    </div>
                    <button type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
                      <Github className="w-5 h-5 text-white" />
                      {editingItem ? 'Mettre à jour via Pull Request' : 'Générer la Pull Request'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Footer */}
      <footer className="h-12 border-t border-slate-200 bg-white flex items-center px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] shrink-0 z-50">
        <div className="flex gap-10">
          <span className="text-amber-600 cursor-default uppercase tracking-widest">Open Data Mode</span>
          <a 
            href="https://github.com/ErwanLT/BrewBound" 
            target="_blank" 
            rel="noreferrer" 
            className="hover:text-slate-900 transition-colors cursor-pointer uppercase tracking-widest flex items-center gap-1.5 underline decoration-slate-200 underline-offset-4"
          >
            <Github className="w-3 h-3" /> Source Code
          </a>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span className="text-slate-400 italic font-mono uppercase tracking-tighter">Database Synchronized</span>
        </div>
      </footer>
    </div>
  );
}
