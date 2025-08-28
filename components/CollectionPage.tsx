import React from 'react';
import { Mineral } from '../types';

interface FilterOptions {
  colors: string[];
  locations: string[];
  rock_types: string[];
}

interface CollectionPageProps {
  minerals: Mineral[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  colorFilter: string;
  setColorFilter: (color: string) => void;
  locationFilter: string;
  setLocationFilter: (location: string) => void;
  rockTypeFilter: string;
  setRockTypeFilter: (type: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  filterOptions: FilterOptions;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  onOpenMineralDetails: (id: number) => void;
}

export default function CollectionPage({ 
  minerals,
  loading,
  searchTerm,
  setSearchTerm,
  colorFilter,
  setColorFilter,
  locationFilter,
  setLocationFilter,
  rockTypeFilter,
  setRockTypeFilter,
  sortBy,
  setSortBy,
  filterOptions,
  hasActiveFilters,
  clearFilters,
  onOpenMineralDetails
}: CollectionPageProps) {
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