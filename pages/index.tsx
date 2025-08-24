import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Mineral, Showcase, Stats } from '../types';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('home');
  const [minerals, setMinerals] = useState<Mineral[]>([]);
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_minerals: 0,
    total_locations: 0,
    total_colors: 0,
    total_shelves: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [rockTypeFilter, setRockTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterOptions, setFilterOptions] = useState({
    colors: [],
    locations: [],
    rock_types: []
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedMineral, setSelectedMineral] = useState<Mineral | null>(null);
  const [selectedShowcase, setSelectedShowcase] = useState<Showcase | null>(null);
  const [showVitrineForm, setShowVitrineForm] = useState(false);
  const [vitrineFormData, setVitrineFormData] = useState({
    name: '',
    code: '',
    location: '',
    description: ''
  });
  const [vitrineImage, setVitrineImage] = useState<File | null>(null);
  const [showMineralModal, setShowMineralModal] = useState(false);
  const [showShowcaseModal, setShowShowcaseModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showShelfForm, setShowShelfForm] = useState(false);
  const [shelfFormData, setShelfFormData] = useState({
    name: '',
    code: '',
    description: '',
    position_order: 0
  });
  const [shelfImage, setShelfImage] = useState<File | null>(null);
  const [showShelfMineralsModal, setShowShelfMineralsModal] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState<any>(null);
  const [shelfMinerals, setShelfMinerals] = useState<Mineral[]>([]);

  useEffect(() => {
    loadStats();
    if (currentPage === 'collection') {
      loadMinerals();
      loadFilterOptions();
    } else if (currentPage === 'vitrines') {
      loadShowcases();
    }
  }, [currentPage]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Statistiken:', error);
    }
  };

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

  const loadShowcases = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/showcases');
      if (response.ok) {
        const data = await response.json();
        setShowcases(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Vitrinen:', error);
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

  const openShowcaseDetails = async (id: number) => {
    try {
      const response = await fetch(`/api/showcases/${id}`);
      if (response.ok) {
        const showcase = await response.json();
        setSelectedShowcase(showcase);
        setShowShowcaseModal(true);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Vitrine-Details:', error);
    }
  };

  const handleVitrineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', vitrineFormData.name);
      formData.append('code', vitrineFormData.code);
      formData.append('location', vitrineFormData.location);
      formData.append('description', vitrineFormData.description);
      
      if (vitrineImage) {
        formData.append('image', vitrineImage);
      }

      const response = await fetch('/api/showcases', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setVitrineFormData({
          name: '',
          code: '',
          location: '',
          description: ''
        });
        setVitrineImage(null);
        setShowVitrineForm(false);
        loadShowcases();
        loadStats();
        alert('Vitrine erfolgreich hinzugefügt!');
      } else {
        const error = await response.text();
        alert('Fehler: ' + error);
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Vitrine:', error);
      alert('Fehler beim Hinzufügen der Vitrine');
    } finally {
      setLoading(false);
    }
  };

  const handleShelfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', shelfFormData.name);
      formData.append('code', shelfFormData.code);
      formData.append('description', shelfFormData.description);
      formData.append('position_order', shelfFormData.position_order.toString());
      formData.append('showcase_id', selectedShowcase!.id.toString());
      
      if (shelfImage) {
        formData.append('image', shelfImage);
      }

      const response = await fetch('/api/shelves', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setShelfFormData({
          name: '',
          code: '',
          description: '',
          position_order: 0
        });
        setShelfImage(null);
        setShowShelfForm(false);
        openShowcaseDetails(selectedShowcase!.id);
        loadStats();
        alert('Regal erfolgreich hinzugefügt!');
      } else {
        const error = await response.text();
        alert('Fehler: ' + error);
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Regals:', error);
      alert('Fehler beim Hinzufügen des Regals');
    } finally {
      setLoading(false);
    }
  };

  const openShelfDetails = async (shelfId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shelves/${shelfId}/minerals`);
      if (response.ok) {
        const data = await response.json();
        setSelectedShelf(data.shelfInfo);
        setShelfMinerals(data.minerals);
        setShowShelfMineralsModal(true);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Regal-Details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage === 'collection') {
      loadMinerals();
    }
  }, [searchTerm, colorFilter, locationFilter, rockTypeFilter, sortBy]);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/check');
      setIsAuthenticated(response.ok);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setShowPasswordModal(false);
        setPassword('');
      } else {
        alert('Falsches Passwort');
      }
    } catch (error) {
      console.error('Login-Fehler:', error);
    }
  };

  const showPage = (page: string) => {
    if (page === 'admin') {
      if (!isAuthenticated) {
        setShowPasswordModal(true);
        return;
      }
    }
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  const openMineralDetails = async (id: number) => {
    try {
      const response = await fetch(`/api/minerals/${id}`);
      if (response.ok) {
        const mineral = await response.json();
        setSelectedMineral(mineral);
        setShowMineralModal(true);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Mineral-Details:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setColorFilter('');
    setLocationFilter('');
    setRockTypeFilter('');
  };

  const hasActiveFilters = searchTerm || colorFilter || locationFilter || rockTypeFilter;

  useEffect(() => {
    checkAuthentication();
  }, []);

  return (
    <>
      <Head>
        <title>Mineraliensammlung - Marius Weber</title>
        <meta name="description" content="Entdecken Sie eine faszinierende Sammlung seltener Mineralien und Gesteine." />
      </Head>

      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">💎</div>
              <div className="logo-text">
                <span className="logo-title">Mineralien</span>
                <span className="logo-subtitle">Sammlung Marius</span>
              </div>
            </div>
            
            <nav className="nav">
              <a 
                className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
                onClick={() => showPage('home')}
              >
                Startseite
              </a>
              <a 
                className={`nav-link ${currentPage === 'vitrines' ? 'active' : ''}`}
                onClick={() => showPage('vitrines')}
              >
                Vitrinen
              </a>
              <a 
                className={`nav-link ${currentPage === 'collection' ? 'active' : ''}`}
                onClick={() => showPage('collection')}
              >
                Sammlung
              </a>
              <a 
                className={`nav-link ${currentPage === 'admin' ? 'active' : ''}`}
                onClick={() => showPage('admin')}
              >
                Verwaltung
              </a>
            </nav>
            
            <div 
              className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${mobileMenuOpen ? 'active' : ''}`}>
        <a className="mobile-nav-link" onClick={() => showPage('home')}>Startseite</a>
        <a className="mobile-nav-link" onClick={() => showPage('vitrines')}>Vitrinen</a>
        <a className="mobile-nav-link" onClick={() => showPage('collection')}>Sammlung</a>
        <a className="mobile-nav-link" onClick={() => showPage('admin')}>Verwaltung</a>
      </div>

      <main>
        {/* Home Page */}
        {currentPage === 'home' && (
          <section className="page active">
            {/* Hero Section */}
            <div className="hero">
              <div className="container">
                <div className="hero-content">
                  <h1 className="hero-title">
                    Faszinierende Welt der
                    <span className="hero-highlight"> Mineralien</span>
                  </h1>
                  <p className="hero-description">
                    Entdecken Sie eine außergewöhnliche Sammlung seltener Mineralien und Gesteine. 
                    Jedes Exemplar erzählt eine millionenjährige Geschichte der Erdgeschichte.
                  </p>
                  <div className="hero-buttons">
                    <button className="btn btn-primary" onClick={() => showPage('collection')}>
                      Sammlung entdecken
                    </button>
                    <button className="btn btn-secondary" onClick={() => showPage('vitrines')}>
                      Vitrinen erkunden
                    </button>
                  </div>
                </div>
                
                <div className="hero-visual">
                  <div className="hero-crystal">💎</div>
                  <div className="hero-particles">
                    <span className="particle">✨</span>
                    <span className="particle">🔬</span>
                    <span className="particle">⭐</span>
                    <span className="particle">💫</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Section */}
            <div className="stats-section">
              <div className="container">
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-number">{stats.total_minerals}</span>
                    <span className="stat-label">Mineralien</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{stats.total_locations}</span>
                    <span className="stat-label">Fundorte</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{stats.total_colors}</span>
                    <span className="stat-label">Farben</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{stats.total_shelves}</span>
                    <span className="stat-label">Regale</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="features-section">
              <div className="container">
                <div className="section-header">
                  <h2 className="section-title">Sammlungsfeatures</h2>
                  <p className="section-description">
                    Moderne Technologie trifft auf traditionelle Mineralogie
                  </p>
                </div>
                
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon">🔍</div>
                    <h3 className="feature-title">Intelligente Suche</h3>
                    <p className="feature-description">
                      Suchen Sie nach Namen, Steinnummer oder Eigenschaften. 
                      Das System erkennt automatisch Ihre Suchintention.
                    </p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">🎯</div>
                    <h3 className="feature-title">Präzise Filter</h3>
                    <p className="feature-description">
                      Filtern Sie nach Farbe, Fundort, Gesteinsart oder Standort. 
                      Finden Sie genau das gesuchte Mineral.
                    </p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">📊</div>
                    <h3 className="feature-title">Detaillierte Dokumentation</h3>
                    <p className="feature-description">
                      Jedes Mineral ist wissenschaftlich dokumentiert mit 
                      Herkunft, Eigenschaften und hochauflösenden Bildern.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="about-section">
              <div className="container">
                <div className="about-content">
                  <div className="about-text">
                    <h2 className="about-title">Über die Sammlung</h2>
                    <p className="about-description">
                      Diese private Mineraliensammlung ist das Ergebnis jahrelanger 
                      Leidenschaft für Geologie und Mineralogie. Jedes Exemplar wurde 
                      sorgfältig ausgewählt und dokumentiert.
                    </p>
                    <p className="about-description">
                      Von glänzenden Kristallen bis hin zu seltenen geologischen 
                      Formationen - entdecken Sie die Schönheit und Vielfalt 
                      unserer Erde in ihrer reinsten Form.
                    </p>
                  </div>
                  
                  <div className="about-visual">
                    <div className="about-card">
                      <div className="about-card-icon">🌍</div>
                      <h4>Weltweite Fundorte</h4>
                      <p>Mineralien aus allen Kontinenten</p>
                    </div>
                    <div className="about-card">
                      <div className="about-card-icon">🔬</div>
                      <h4>Wissenschaftlich dokumentiert</h4>
                      <p>Präzise Katalogisierung</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Collection Page */}
        {currentPage === 'collection' && (
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
                      onClick={() => openMineralDetails(mineral.id)}
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
        )}

        {/* Vitrines Page */}
        {currentPage === 'vitrines' && (
          <section className="page active">
            <div className="container">
              <div className="page-header">
                <div className="page-header-content">
                  <div>
                    <h1 className="page-title">Vitrinen-Verwaltung</h1>
                    <p className="page-description">Organisieren Sie Ihre Sammlung in thematischen Vitrinen</p>
                  </div>
                  {isAuthenticated && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowVitrineForm(true)}>
                        Neue Vitrine hinzufügen
                    </button>
                  )}
                </div>
              </div>

              <div className="vitrines-grid">
                {loading ? (
                  <div className="loading">Lade Vitrinen...</div>
                ) : showcases.length === 0 ? (
                  <div className="no-showcases">
                    <h3>🛍️ Noch keine Vitrinen vorhanden</h3>
                    <p>Fügen Sie Ihre erste Vitrine hinzu, um Ihre Sammlung zu organisieren.</p>
                  </div>
                ) : (
                  showcases.map(showcase => (
                    <div 
                      key={showcase.id} 
                      className="vitrine-card"
                      onClick={() => openShowcaseDetails(showcase.id)}
                    >
                      <div className="vitrine-image">
                        {showcase.image_path ? (
                          <img src={`/uploads/${showcase.image_path}`} alt={showcase.name} />
                        ) : (
                          <div className="placeholder">🛍️</div>
                        )}
                      </div>
                      <div className="vitrine-info">
                        <h3>{showcase.name}</h3>
                        <p><strong>Code:</strong> {showcase.code}</p>
                        <p><strong>Standort:</strong> {showcase.location || 'Nicht angegeben'}</p>
                        <p><strong>Beschreibung:</strong> {showcase.description ? (showcase.description.substring(0, 80) + '...') : 'Keine Beschreibung'}</p>
                        
                        <div className="vitrine-stats">
                          <div className="vitrine-stat">
                            <span className="vitrine-stat-number">{showcase.shelf_count || 0}</span>
                            <span className="vitrine-stat-label">Regale</span>
                          </div>
                          <div className="vitrine-stat">
                            <span className="vitrine-stat-number">{showcase.mineral_count || 0}</span>
                            <span className="vitrine-stat-label">Mineralien</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {/* Admin Page */}
        {currentPage === 'admin' && isAuthenticated && (
          <section className="page active">
            <div className="container">
              <div className="page-header">
                <h1 className="page-title">Verwaltung</h1>
                <p className="page-description">Neue Mineralien zur Sammlung hinzufügen</p>
              </div>
              
              <div className="admin-form-container">
                <MineralForm onSuccess={() => {
                  loadStats();
                  if (currentPage === 'collection') loadMinerals();
                }} />
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <span className="close-button" onClick={() => setShowPasswordModal(false)}>&times;</span>
            <h2>Admin-Zugang</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="password">Passwort</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin-Passwort eingeben"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-large">
                Anmelden
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mineral Details Modal */}
      {showMineralModal && selectedMineral && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <span className="close-button" onClick={() => setShowMineralModal(false)}>&times;</span>
            <h2>{selectedMineral.name}</h2>
            
            {selectedMineral.image_path && (
              <div className="detail-image">
                <img src={`/uploads/${selectedMineral.image_path}`} alt={selectedMineral.name} />
              </div>
            )}
            
            <div className="detail-info">
              <div className="detail-item">
                <span className="detail-label">Steinnummer:</span>
                <span className="detail-value">{selectedMineral.number}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Farbe:</span>
                <span className="detail-value">{selectedMineral.color || 'Nicht angegeben'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fundort:</span>
                <span className="detail-value">{selectedMineral.location || 'Unbekannt'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Kaufort:</span>
                <span className="detail-value">{selectedMineral.purchase_location || 'Nicht angegeben'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Gesteinsart:</span>
                <span className="detail-value">{selectedMineral.rock_type || 'Nicht angegeben'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Regal:</span>
                <span className="detail-value">
                  {selectedMineral.shelf_code 
                    ? `${selectedMineral.showcase_code}-${selectedMineral.shelf_code}` 
                    : 'Nicht zugeordnet'
                  }
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Hinzugefügt:</span>
                <span className="detail-value">
                  {new Date(selectedMineral.created_at).toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <h3>Beschreibung</h3>
              <p style={{ marginTop: '10px', color: '#555', lineHeight: '1.6' }}>
                {selectedMineral.description || 'Keine Beschreibung verfügbar.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Showcase Details Modal */}
      {showShowcaseModal && selectedShowcase && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content showcase-modal">
            <span className="close-button" onClick={() => setShowShowcaseModal(false)}>&times;</span>
            <h2>{selectedShowcase.name}</h2>
            {isAuthenticated && (
              <button 
                className="btn btn-primary"
                style={{ marginBottom: 'var(--space-4)' }}
                onClick={() => setShowShelfForm(true)}>
                  Neues Regal hinzufügen
              </button>
            )}
            
            {selectedShowcase.image_path && (
              <div className="detail-image">
                <img src={`/uploads/${selectedShowcase.image_path}`} alt={selectedShowcase.name} />
              </div>
            )}
            
            <div className="detail-info">
              <div className="detail-item">
                <span className="detail-label">Code:</span>
                <span className="detail-value">{selectedShowcase.code}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Standort:</span>
                <span className="detail-value">{selectedShowcase.location || 'Nicht angegeben'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Anzahl Regale:</span>
                <span className="detail-value">{selectedShowcase.shelf_count || 0}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Anzahl Mineralien:</span>
                <span className="detail-value">{selectedShowcase.mineral_count || 0}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Hinzugefügt:</span>
                <span className="detail-value">
                  {new Date(selectedShowcase.created_at).toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>
            
            {selectedShowcase.description && (
              <div style={{ marginTop: '20px' }}>
                <h3>Beschreibung</h3>
                <p style={{ marginTop: '10px', color: '#555', lineHeight: '1.6' }}>
                  {selectedShowcase.description}
                </p>
              </div>
            )}

            {/* Regale der Vitrine anzeigen */}
            {selectedShowcase.shelves && selectedShowcase.shelves.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <h3>Regale in dieser Vitrine</h3>
                <div className="shelves-grid">
                  {selectedShowcase.shelves.map((shelf: any) => (
                    <div 
                      key={shelf.id} 
                      className="shelf-card clickable"
                      onClick={() => openShelfDetails(shelf.id)}
                    >
                      {shelf.image_path && (
                        <div className="shelf-image">
                          <img src={`/uploads/${shelf.image_path}`} alt={shelf.name} />
                        </div>
                      )}
                      <div className="shelf-info">
                        <h4>{shelf.name}</h4>
                        <p><strong>Code:</strong> {shelf.full_code}</p>
                        <p><strong>Mineralien:</strong> {shelf.mineral_count || 0}</p>
                        {shelf.description && (
                          <p><strong>Beschreibung:</strong> {shelf.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shelf Minerals Modal */}
      {showShelfMineralsModal && selectedShelf && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content shelf-minerals-modal">
            <span className="close-button" onClick={() => setShowShelfMineralsModal(false)}>&times;</span>
            <h2>Regal: {selectedShelf.shelf_name}</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-6)' }}>
              {selectedShelf.showcase_name} - {selectedShelf.full_code}
            </p>
            
            {selectedShelf.image_path && (
              <div className="detail-image" style={{ marginBottom: 'var(--space-6)' }}>
                <img src={`/uploads/${selectedShelf.image_path}`} alt={selectedShelf.shelf_name} />
              </div>
            )}
            
            <h3 style={{ marginBottom: 'var(--space-4)' }}>
              Mineralien in diesem Regal ({shelfMinerals.length})
            </h3>
            
            {loading ? (
              <div className="loading">Lade Mineralien...</div>
            ) : shelfMinerals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--gray-500)' }}>
                <p>🗳️ Dieses Regal ist noch leer</p>
                <p>Keine Mineralien zugeordnet</p>
              </div>
            ) : (
              <div className="shelf-minerals-grid">
                {shelfMinerals.map(mineral => (
                  <div 
                    key={mineral.id} 
                    className="mineral-card-small" 
                    onClick={() => {
                      setShowShelfMineralsModal(false);
                      openMineralDetails(mineral.id);
                    }}
                  >
                    <div className="mineral-image-small">
                      {mineral.image_path ? (
                        <img src={`/uploads/${mineral.image_path}`} alt={mineral.name} />
                      ) : (
                        <div className="placeholder">📸</div>
                      )}
                    </div>
                    <div className="mineral-info-small">
                      <h4>{mineral.name}</h4>
                      <p><strong>Nr:</strong> {mineral.number}</p>
                      <p><strong>Farbe:</strong> {mineral.color || 'Nicht angegeben'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vitrine Form Modal */}
      {showVitrineForm && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <span className="close-button" onClick={() => {
              setShowVitrineForm(false);
              setVitrineImage(null);
            }}>&times;</span>
            <h2>Neue Vitrine hinzufügen</h2>
            
            <form onSubmit={handleVitrineSubmit}>
              <div className="form-group">
                <label htmlFor="vitrine-name">Name der Vitrine</label>
                <input
                  type="text"
                  id="vitrine-name"
                  value={vitrineFormData.name}
                  onChange={(e) => setVitrineFormData({...vitrineFormData, name: e.target.value})}
                  placeholder="z.B. Hauptsammlung, Edelsteine, Kristalle"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="vitrine-code">Vitrine-Code</label>
                <input
                  type="text"
                  id="vitrine-code"
                  value={vitrineFormData.code}
                  onChange={(e) => setVitrineFormData({...vitrineFormData, code: e.target.value})}
                  placeholder="z.B. V1, HAUPT, EDL"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="vitrine-location">Standort</label>
                <input
                  type="text"
                  id="vitrine-location"
                  value={vitrineFormData.location}
                  onChange={(e) => setVitrineFormData({...vitrineFormData, location: e.target.value})}
                  placeholder="z.B. Wohnzimmer, Keller, Arbeitszimmer"
                />
              </div>

              <div className="form-group">
                <label htmlFor="vitrine-description">Beschreibung</label>
                <textarea
                  id="vitrine-description"
                  value={vitrineFormData.description}
                  onChange={(e) => setVitrineFormData({...vitrineFormData, description: e.target.value})}
                  placeholder="Beschreibung der Vitrine, Thema, Besonderheiten..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label htmlFor="vitrine-image">Bild der Vitrine</label>
                <input
                  type="file"
                  id="vitrine-image"
                  accept="image/*"
                  onChange={(e) => setVitrineImage(e.target.files?.[0] || null)}
                />
                {vitrineImage && (
                  <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    Ausgewählt: {vitrineImage.name}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowVitrineForm(false);
                    setVitrineImage(null);
                  }}
                >
                  Abbrechen
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Wird hinzugefügt...' : 'Vitrine hinzufügen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shelf Form Modal */}
      {showShelfForm && selectedShowcase && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <span className="close-button" onClick={() => {
              setShowShelfForm(false);
              setShelfImage(null);
            }}>&times;</span>
            <h2>Neues Regal für {selectedShowcase.name} hinzufügen</h2>
            
            <form onSubmit={handleShelfSubmit}>
              <div className="form-group">
                <label htmlFor="shelf-name">Name des Regals</label>
                <input
                  type="text"
                  id="shelf-name"
                  value={shelfFormData.name}
                  onChange={(e) => setShelfFormData({...shelfFormData, name: e.target.value})}
                  placeholder="z.B. Oberes Regal, Edelsteine, Kristalle"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="shelf-code">Regal-Code</label>
                <input
                  type="text"
                  id="shelf-code"
                  value={shelfFormData.code}
                  onChange={(e) => setShelfFormData({...shelfFormData, code: e.target.value})}
                  placeholder="z.B. R1, OBER, EDL"
                  required
                />
                <small style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
                  Vollständiger Code wird: {selectedShowcase.code}-{shelfFormData.code}
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="shelf-description">Beschreibung</label>
                <textarea
                  id="shelf-description"
                  value={shelfFormData.description}
                  onChange={(e) => setShelfFormData({...shelfFormData, description: e.target.value})}
                  placeholder="Beschreibung des Regals, Inhalt, Besonderheiten..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="shelf-position">Position/Reihenfolge</label>
                <input
                  type="number"
                  id="shelf-position"
                  value={shelfFormData.position_order}
                  onChange={(e) => setShelfFormData({...shelfFormData, position_order: parseInt(e.target.value) || 0})}
                  placeholder="0"
                  min="0"
                />
                <small style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
                  Bestimmt die Anzeigereihenfolge (0 = erstes Regal)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="shelf-image">Bild des Regals</label>
                <input
                  type="file"
                  id="shelf-image"
                  accept="image/*"
                  onChange={(e) => setShelfImage(e.target.files?.[0] || null)}
                />
                {shelfImage && (
                  <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    Ausgewählt: {shelfImage.name}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowShelfForm(false);
                    setShelfImage(null);
                  }}
                >
                  Abbrechen
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Wird hinzugefügt...' : 'Regal hinzufügen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Mineral Form Component
function MineralForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    color: '',
    description: '',
    location: '',
    purchase_location: '',
    rock_type: '',
    shelf_id: ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [shelves, setShelves] = useState<any[]>([]);

  useEffect(() => {
    loadShelves();
  }, []);

  const loadShelves = async () => {
    try {
      const response = await fetch('/api/shelves');
      if (response.ok) {
        const data = await response.json();
        setShelves(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Regale:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });
      if (image) {
        form.append('image', image);
      }

      const response = await fetch('/api/minerals', {
        method: 'POST',
        body: form
      });

      if (response.ok) {
        setFormData({
          name: '',
          number: '',
          color: '',
          description: '',
          location: '',
          purchase_location: '',
          rock_type: '',
          shelf_id: ''
        });
        setImage(null);
        onSuccess();
        alert('Mineral erfolgreich hinzugefügt!');
      } else {
        const error = await response.text();
        alert('Fehler: ' + error);
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Minerals:', error);
      alert('Fehler beim Hinzufügen des Minerals');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Name des Minerals</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="z.B. Quarz, Pyrit, Amethyst"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="number">Steinnummer</label>
        <input
          type="text"
          id="number"
          value={formData.number}
          onChange={(e) => setFormData({...formData, number: e.target.value})}
          placeholder="Eindeutige Identifikationsnummer"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="color">Farbe</label>
        <input
          type="text"
          id="color"
          value={formData.color}
          onChange={(e) => setFormData({...formData, color: e.target.value})}
          placeholder="Hauptfarbe des Minerals"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Beschreibung</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Detaillierte Beschreibung, Besonderheiten, chemische Formel..."
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Fundort</label>
        <input
          type="text"
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
          placeholder="Geographische Herkunft"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="purchase_location">Kaufort</label>
        <input
          type="text"
          id="purchase_location"
          value={formData.purchase_location}
          onChange={(e) => setFormData({...formData, purchase_location: e.target.value})}
          placeholder="Wo wurde es erworben?"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="rock_type">Gesteinsart</label>
        <input
          type="text"
          id="rock_type"
          value={formData.rock_type}
          onChange={(e) => setFormData({...formData, rock_type: e.target.value})}
          placeholder="z.B. magmatisch, sedimentär, metamorph"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="shelf_id">Regal</label>
        <select
          id="shelf_id"
          value={formData.shelf_id}
          onChange={(e) => setFormData({...formData, shelf_id: e.target.value})}
        >
          <option value="">Kein Regal zugeordnet</option>
          {shelves.map(shelf => (
            <option key={shelf.id} value={shelf.id}>
              {shelf.showcase_name} - {shelf.name} ({shelf.full_code})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="image">Bild hochladen</label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary btn-large">
        {loading ? 'Wird hinzugefügt...' : 'Mineral hinzufügen'}
      </button>
    </form>
  );
}