import React, { useEffect, useState } from 'react';
import { Mineral } from '../types';

interface CollectionPageProps {
  isAuthenticated: boolean;
  onOpenMineralDetails: (id: number) => void;
  onEditMineral: (mineral: Mineral) => void;
  onDeleteMineral: (id: number) => void;
}

interface FilterOptions {
  colors: string[];
  locations: string[];
  rock_types: string[];
}

export default function CollectionPage({ 
  isAuthenticated, 
  onOpenMineralDetails, 
  onEditMineral, 
  onDeleteMineral 
}: CollectionPageProps) {
  const [minerals, setMinerals] = useState<Mineral[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [rockTypeFilter, setRockTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    colors: [],
    locations: [],
    rock_types: []
  });

  useEffect(() => {
    loadMinerals();
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadMinerals();
  }, [searchTerm, colorFilter, locationFilter, rockTypeFilter, sortBy]);

  const loadMinerals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        color: colorFilter,
        location: locationFilter,
        rock_type: rockTypeFilter,
        sort: sortBy
      });
      
      const response = await fetch(`/api/minerals?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMinerals(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Mineralien:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const response = await fetch('/api/filter-options');
      if (response.ok) {
        const data = await response.json();
        setFilterOptions(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Filteroptionen:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setColorFilter('');
    setLocationFilter('');
    setRockTypeFilter('');
  };

  const hasActiveFilters = searchTerm || colorFilter || locationFilter || rockTypeFilter;

  return (
    <section className="page active">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Mineraliensammlung</h1>
          <p className="page-description">Durchsuchen und filtern Sie die komplette Sammlung</p>
        </div>

        <div className="search-filter-container">
          <div className="search-section">
            <h3>Suche</h3>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Nach Name oder Steinnummer suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-section">
            <h3>Filter</h3>
            <select 
              className="filter-select" 
              value={colorFilter} 
              onChange={(e) => setColorFilter(e.target.value)}
            >
              <option value="">Alle Farben</option>
              {filterOptions.colors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
            <select 
              className="filter-select" 
              value={locationFilter} 
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">Alle Fundorte</option>
              {filterOptions.locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            <select 
              className="filter-select" 
              value={rockTypeFilter} 
              onChange={(e) => setRockTypeFilter(e.target.value)}
            >
              <option value="">Alle Gesteinsarten</option>
              {filterOptions.rock_types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="filter-info show">
            <strong>Aktive Filter:</strong>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {searchTerm && <span className="filter-tag">Suche: {searchTerm}</span>}
              {colorFilter && <span className="filter-tag">Farbe: {colorFilter}</span>}
              {locationFilter && <span className="filter-tag">Fundort: {locationFilter}</span>}
              {rockTypeFilter && <span className="filter-tag">Gesteinsart: {rockTypeFilter}</span>}
            </div>
            <button className="clear-filters" onClick={clearFilters}>
              Filter zurücksetzen
            </button>
          </div>
        )}

        <div className="sort-section">
          <label htmlFor="sortBy">Sortieren nach:</label>
          <select 
            id="sortBy" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="number">Steinnummer</option>
            <option value="color">Farbe</option>
          </select>
        </div>

        <div className="minerals-grid">
          {loading ? (
            <div className="loading">Lade Mineralien...</div>
          ) : minerals.length === 0 ? (
            <div className="loading">Keine Mineralien gefunden</div>
          ) : (
            minerals.map(mineral => (
              <div 
                key={mineral.id} 
                className="mineral-card" 
                onClick={() => onOpenMineralDetails(mineral.id)}
              >
                <div className="mineral-image">
                  {mineral.image_path ? (
                    <img src={`/uploads/${mineral.image_path}`} alt={mineral.name} />
                  ) : (
                    <div className="placeholder">📸</div>
                  )}
                </div>
                <div className="mineral-info">
                  <h3>{mineral.name}</h3>
                  <p><strong>Nummer:</strong> {mineral.number}</p>
                  <p><strong>Farbe:</strong> {mineral.color || 'Nicht angegeben'}</p>
                  <p><strong>Regal:</strong> {mineral.shelf_code ? `${mineral.showcase_code}-${mineral.shelf_code}` : 'Nicht zugeordnet'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}