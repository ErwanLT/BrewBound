import React, { useState, useEffect, useMemo } from 'react';
import type { Brewery, Beer } from './types';

// Data imports
import breweriesData from './data/breweries.json';
import beersData from './data/beers.json';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MapArea } from './components/MapArea';
import { BreweryDetails } from './components/BreweryDetails';
import { ContributionModal } from './components/ContributionModal';
import { Footer } from './components/Footer';

export default function App() {
  const [breweries] = useState<Brewery[]>(breweriesData as Brewery[]);
  const [beers] = useState<Beer[]>(beersData as Beer[]);
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isContributing, setIsContributing] = useState<'brewery' | 'beer' | null>(null);
  const [editingItem, setEditingItem] = useState<Brewery | Beer | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([46.603354, 1.888334]); // France center
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Close sidebar on mobile when an item is selected
  useEffect(() => {
    if (selectedBrewery && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [selectedBrewery]);

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

  const handleEditBrewery = (b: Brewery) => {
    setEditingItem(b);
    setIsContributing('brewery');
  };

  const handleEditBeer = (beer: Beer) => {
    setEditingItem(beer);
    setIsContributing('beer');
  };

  const handleAddBeer = () => {
    setIsContributing('beer');
  };

  const handleAddBrewery = () => {
    setIsContributing('brewery');
  };

  const handleCloseModal = () => {
    setIsContributing(null);
    setEditingItem(null);
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans">
      <Header 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddBrewery={handleAddBrewery}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          filteredBreweries={filteredBreweries}
          selectedBrewery={selectedBrewery}
          handleSelect={handleSelect}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 relative bg-slate-100">
          <MapArea 
            mapCenter={mapCenter}
            filteredBreweries={filteredBreweries}
            selectedBrewery={selectedBrewery}
            handleSelect={handleSelect}
          />

          <BreweryDetails 
            selectedBrewery={selectedBrewery}
            breweryBeers={breweryBeers}
            onClose={() => setSelectedBrewery(null)}
            onEditBrewery={handleEditBrewery}
            onEditBeer={handleEditBeer}
            onAddBeer={handleAddBeer}
          />
        </main>
      </div>

      <ContributionModal 
        isContributing={isContributing}
        editingItem={editingItem}
        selectedBrewery={selectedBrewery}
        onClose={handleCloseModal}
      />

      <Footer />
    </div>
  );
}
