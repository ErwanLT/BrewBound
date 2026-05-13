import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Github, ChevronRight, Beer as BeerIcon } from 'lucide-react';
import type { Brewery, Beer } from '../types';
import { BEER_STYLES } from '../constants/beerStyles';

const SORTED_BEER_STYLES = [...BEER_STYLES].sort();

interface ContributionModalProps {
  isContributing: 'brewery' | 'beer' | null;
  editingItem: Brewery | Beer | null;
  selectedBrewery: Brewery | null;
  onClose: () => void;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
  isContributing,
  editingItem,
  selectedBrewery,
  onClose,
}) => {
  const [contributionStep, setContributionStep] = useState(1);
  const [wizardData, setWizardData] = useState<any>({
    brewery: {},
    beers: []
  });
  const [contributionSuccess, setContributionSuccess] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset states when modal opens/closes or type changes
  useEffect(() => {
    if (isContributing) {
      setContributionStep(1);
      setWizardData({ brewery: {}, beers: [] });
      setContributionSuccess(false);
      setPrUrl(null);
    }
  }, [isContributing, editingItem]);

  const handleContribute = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    
    // In multi-step mode, data is in wizardData
    const isWizard = isContributing === 'brewery' && !editingItem;
    const submissionData = isWizard ? wizardData.brewery : Object.fromEntries(new FormData(e?.currentTarget).entries());
    
    try {
      const response = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: isContributing, 
          data: {
            ...(editingItem ? { id: editingItem.id } : {}),
            ...submissionData,
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
            onClose();
          }, 3000);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isContributing && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-t-3xl md:rounded-3xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-1">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">
                    {editingItem 
                      ? `Modifier ${isContributing === 'brewery' ? 'la brasserie' : 'la bière'}`
                      : isContributing === 'brewery' 
                        ? 'Nouvelle Brasserie' 
                        : `Ajouter une bière chez ${selectedBrewery?.name}`
                    }
                  </h2>
                  {!editingItem && isContributing === 'brewery' && !contributionSuccess && (
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={`w-6 h-1 rounded-full ${contributionStep >= s ? 'bg-amber-500' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {!editingItem && isContributing === 'brewery' 
                    ? `Étape ${contributionStep} sur 4 : ${
                        contributionStep === 1 ? 'Informations Générales' :
                        contributionStep === 2 ? 'Localisation' :
                        contributionStep === 3 ? 'Premières Bières' :
                        'Prévisualisation & Envoi'
                      }`
                    : 'Contribution collaborative via GitHub'
                  }
                </p>
              </div>
              <button onClick={onClose} className="bg-white border border-slate-200 p-2 rounded-full hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900 shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
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
                <div className="space-y-6">
                  {/* WIZARD MODE: ADD NEW BREWERY */}
                  {!editingItem && isContributing === 'brewery' ? (
                    <div className="space-y-6">
                      {contributionStep === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom de la brasserie</label>
                              <input 
                                defaultValue={wizardData.brewery.name}
                                onChange={(e) => setWizardData({ ...wizardData, brewery: { ...wizardData.brewery, name: e.target.value }})}
                                required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-900" placeholder="Ex: Popihn" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Site Web</label>
                              <input 
                                defaultValue={wizardData.brewery.website}
                                onChange={(e) => setWizardData({ ...wizardData, brewery: { ...wizardData.brewery, website: e.target.value }})}
                                type="url" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-900" placeholder="https://..." 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                              Description
                              <span className="font-mono lowercase normal-case opacity-60 hidden xs:inline">Markdown supporté</span>
                            </label>
                            <textarea 
                              defaultValue={wizardData.brewery.description}
                              onChange={(e) => setWizardData({ ...wizardData, brewery: { ...wizardData.brewery, description: e.target.value }})}
                              required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 h-32 resize-none text-slate-900" placeholder="Racontez leur histoire..." 
                            />
                          </div>
                          <button 
                            disabled={!wizardData.brewery.name || !wizardData.brewery.description}
                            onClick={() => setContributionStep(2)}
                            className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
                          >
                            Suivant : Localisation
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </motion.div>
                      )}

                      {contributionStep === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ville</label>
                              <input 
                                defaultValue={wizardData.brewery.city}
                                onChange={(e) => setWizardData({ ...wizardData, brewery: { ...wizardData.brewery, city: e.target.value }})}
                                required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-900" placeholder="Ex: Sens" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horaires</label>
                              <input 
                                defaultValue={wizardData.brewery.hours}
                                onChange={(e) => setWizardData({ ...wizardData, brewery: { ...wizardData.brewery, hours: e.target.value }})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-900" placeholder="Mer-Dim: 14h-22h" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adresse complète</label>
                            <div className="flex gap-2">
                              <input 
                                id="wizard-address"
                                defaultValue={wizardData.brewery.address}
                                required className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-900 min-w-0" placeholder="28 Rue des brasseurs..." 
                              />
                              <button 
                                type="button"
                                onClick={async () => {
                                  const addr = (document.getElementById('wizard-address') as HTMLInputElement).value;
                                  if (!addr) return;
                                  try {
                                    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addr)}&format=json&limit=1`);
                                    const geo = await res.json();
                                    if (geo && geo[0]) {
                                      setWizardData({ ...wizardData, brewery: { ...wizardData.brewery, address: addr, city: wizardData.brewery.city || geo[0].address?.city || geo[0].address?.town, lat: parseFloat(geo[0].lat), lng: parseFloat(geo[0].lon) }});
                                      alert(`Localisé ! ${geo[0].display_name}`);
                                    }
                                  } catch (err) { console.error(err); }
                                }}
                                className="bg-amber-500 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                              >
                                Localiser
                              </button>
                            </div>
                          </div>
                          {wizardData.brewery.lat && (
                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                              <CheckCircle2 className="w-4 h-4" /> Coordonnées enregistrées
                            </div>
                          )}
                          <div className="flex gap-4">
                            <button onClick={() => setContributionStep(1)} className="flex-1 py-4 border border-slate-200 text-slate-600 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all">Retour</button>
                            <button 
                              disabled={!wizardData.brewery.city || !wizardData.brewery.address}
                              onClick={() => setContributionStep(3)} 
                              className="flex-[2] py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
                            >
                              Suivant : Bières
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {contributionStep === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                           <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                             <h4 className="text-sm font-black text-slate-900">Ajouter une bière (Optionnel)</h4>
                             <div className="grid grid-cols-2 gap-4">
                                <input id="w-beer-name" className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs" placeholder="Nom" />
                                <select id="w-beer-style" className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs">
                                  <option value="">Style...</option>
                                  {SORTED_BEER_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                             </div>
                             <textarea id="w-beer-desc" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs h-20 resize-none" placeholder="Description..." />
                             <button 
                               onClick={() => {
                                 const name = (document.getElementById('w-beer-name') as HTMLInputElement).value;
                                 const style = (document.getElementById('w-beer-style') as HTMLSelectElement).value;
                                 const desc = (document.getElementById('w-beer-desc') as HTMLTextAreaElement).value;
                                 if (name && style && desc) {
                                   setWizardData({ ...wizardData, beers: [...wizardData.beers, { name, style, description: desc, abv: 'N/A' }]});
                                   (document.getElementById('w-beer-name') as HTMLInputElement).value = '';
                                   (document.getElementById('w-beer-desc') as HTMLTextAreaElement).value = '';
                                 }
                               }}
                               className="w-full py-2 border-2 border-dashed border-slate-300 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-slate-400 hover:text-slate-600"
                             >
                               Ajouter à la liste
                             </button>
                           </div>

                           <div className="space-y-2">
                             {wizardData.beers.map((beer: any, i: number) => (
                               <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                 <div>
                                    <p className="text-xs font-black text-slate-900">{beer.name}</p>
                                    <p className="text-[10px] text-amber-600 font-bold uppercase">{beer.style}</p>
                                 </div>
                                 <button onClick={() => setWizardData({ ...wizardData, beers: wizardData.beers.filter((_: any, idx: number) => idx !== i)})} className="p-1 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded transition-colors"><X className="w-4 h-4" /></button>
                               </div>
                             ))}
                           </div>

                           <div className="flex gap-4">
                            <button onClick={() => setContributionStep(2)} className="flex-1 py-4 border border-slate-200 text-slate-600 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all">Retour</button>
                            <button onClick={() => setContributionStep(4)} className="flex-[2] py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">Suivant : Aperçu</button>
                          </div>
                        </motion.div>
                      )}

                      {contributionStep === 4 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                          <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4 shadow-xl">
                            <div className="flex justify-between items-start">
                              <div>
                                 <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Aperçu de la brasserie</p>
                                 <h3 className="text-2xl font-black tracking-tighter">{wizardData.brewery.name}</h3>
                                 <p className="text-xs text-slate-400">{wizardData.brewery.city}</p>
                              </div>
                              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center"><BeerIcon className="w-6 h-6 text-white" /></div>
                            </div>
                            <p className="text-xs text-slate-300 line-clamp-2 italic">"{wizardData.brewery.description}"</p>
                            <div className="pt-4 border-t border-white/10 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                               <span>{wizardData.beers.length} Bières initiales</span>
                               {wizardData.brewery.lat && <span>Localisé sur carte</span>}
                            </div>
                          </div>

                          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm"><Github className="w-5 h-5 text-slate-900" /></div>
                            <div className="flex-1">
                              <p className="text-[11px] font-bold text-slate-700 capitalize tracking-tight">Soumission Finale</p>
                              <p className="text-[10px] text-slate-400 leading-tight">Votre proposition sera transformée en Pull Request pour être revue et validée.</p>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <button onClick={() => setContributionStep(3)} className="flex-1 py-4 border border-slate-200 text-slate-600 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all">Retour</button>
                            <button 
                              disabled={isSubmitting}
                              onClick={() => handleContribute()} 
                              className="flex-[2] py-4 bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                              {isSubmitting ? 'Envoi...' : 'Envoyer la proposition'}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    /* CLASSIC MODE: EDITING OR SINGLE BEER ADDITION */
                    <form onSubmit={handleContribute} className="space-y-6">
                      {isContributing === 'brewery' ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <input name="address" id="address-input" defaultValue={(editingItem as Brewery)?.address} required className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-900 placeholder:text-slate-300 min-w-0" placeholder="28 Rue des brasseurs..." />
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
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 md:px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0"
                              >
                                Localiser
                              </button>
                            </div>
                            <input type="hidden" name="lat" id="lat-input" defaultValue={(editingItem as Brewery)?.lat} />
                            <input type="hidden" name="lng" id="lng-input" defaultValue={(editingItem as Brewery)?.lng} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <span className="font-mono lowercase normal-case opacity-60 hidden xs:inline">Markdown supporté (**gras**, *italique*)</span>
                            </label>
                            <textarea name="description" defaultValue={(editingItem as Brewery)?.description} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 h-24 resize-none text-slate-900 placeholder:text-slate-300" placeholder="Brève histoire ou spécialité..." />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom de la bière</label>
                              <input name="name" defaultValue={(editingItem as Beer)?.name} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-900 placeholder:text-slate-300" placeholder="Ex: West Coast IPA" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Style</label>
                              <div className="relative">
                                <select name="style" defaultValue={(editingItem as Beer)?.style || ""} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-900 appearance-none cursor-pointer">
                                  <option value="" disabled className="bg-white">Choisir un style...</option>
                                  {SORTED_BEER_STYLES.map(style => (
                                    <option key={style} value={style} className="bg-white text-slate-900">{style}</option>
                                  ))}
                                </select>
                                <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">
                                  <ChevronRight className="w-4 h-4 rotate-90" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <span className="font-mono lowercase normal-case opacity-60 hidden xs:inline">Markdown supporté (**gras**, *italique*)</span>
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
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                      >
                        <Github className="w-5 h-5 text-white" />
                        {isSubmitting ? 'Envoi...' : (editingItem ? 'Mettre à jour via Pull Request' : 'Générer la Pull Request')}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
