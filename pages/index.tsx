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
  const [editMode, setEditMode] = useState<'mineral' | 'showcase' | 'shelf' | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [editImage, setEditImage] = useState<File | null>(null);
  const [shelves, setShelves] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    loadStats();
    if (currentPage === 'collection') {
      loadMinerals();
      loadFilterOptions();
    } else if (currentPage === 'vitrines') {
      loadShowcases();
    }
  }, [currentPage]);

  useEffect(() => {
    loadShelves();
  }, []);

  const showImpressumPage = () => {
    setCurrentPage('impressum');
    setMobileMenuOpen(false);
  };

  const showQuellenPage = () => {
    setCurrentPage('quellen');
    setMobileMenuOpen(false);
  };

  const showKontaktPage = () => {
    setCurrentPage('kontakt');
    setMobileMenuOpen(false);
  };

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

  const loadLastUpdated = async () => {
  try {
    const response = await fetch('/api/last-updated');
    if (response.ok) {
      const data = await response.json();
      setLastUpdated(data.last_updated);
    }
  } catch (error) {
    console.error('Fehler beim Laden des letzten Update-Datums:', error);
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
      // Vitrine Details neu laden
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

// Zusätzliche Debug-Funktion für Shelf Details
const openShelfDetails = async (shelfId: number) => {
  try {
    setLoading(true);
    console.log('Loading shelf details for ID:', shelfId);
    
    const response = await fetch(`/api/shelves/${shelfId}/minerals`);
    const responseData = await response.json();
    
    console.log('Shelf details response:', responseData);
    
    if (response.ok) {
      setSelectedShelf(responseData.shelfInfo);
      setShelfMinerals(responseData.minerals);
      setShowShelfMineralsModal(true);
    } else {
      console.error('Error loading shelf details:', responseData);
      alert('Fehler beim Laden der Regal-Details: ' + (responseData.error || 'Unbekannter Fehler'));
    }
  } catch (error) {
    console.error('Fehler beim Laden der Regal-Details:', error);
    alert('Fehler beim Laden der Regal-Details');
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

  // Mineral bearbeiten
const handleEditMineral = (mineral: Mineral) => {
  setEditFormData({
    id: mineral.id,
    name: mineral.name,
    number: mineral.number,
    color: mineral.color || '',
    description: mineral.description || '',
    location: mineral.location || '',
    purchase_location: mineral.purchase_location || '',
    rock_type: mineral.rock_type || '',
    shelf_id: mineral.shelf_id || ''
  });
  setEditMode('mineral');
  setEditImage(null);
};

// Vitrine bearbeiten
const handleEditShowcase = (showcase: Showcase) => {
  setEditFormData({
    id: showcase.id,
    name: showcase.name,
    code: showcase.code,
    location: showcase.location || '',
    description: showcase.description || ''
  });
  setEditMode('showcase');
  setEditImage(null);
};

// Regal bearbeiten
const handleEditShelf = (shelf: any) => {
  console.log('Edit shelf:', shelf);
  setEditFormData({
    id: shelf.id,
    name: shelf.name || shelf.shelf_name,
    code: shelf.code,
    description: shelf.description || '',
    position_order: shelf.position_order || 0,
    showcase_id: shelf.showcase_id || selectedShowcase?.id
  });
  setEditMode('shelf');
  setEditImage(null);
};

// Update-Funktion
const handleUpdateSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData();
    
    // Daten zum FormData hinzufügen
    Object.keys(editFormData).forEach(key => {
      if (key !== 'id' && editFormData[key] !== undefined && editFormData[key] !== null) {
        formData.append(key, editFormData[key].toString());
      }
    });
    
    if (editImage) {
      formData.append('image', editImage);
    }

    let url = '';
    let entityName = '';
    switch (editMode) {
      case 'mineral':
        url = `/api/minerals/${editFormData.id}`;
        entityName = 'Mineral';
        break;
      case 'showcase':
        url = `/api/showcases/${editFormData.id}`;
        entityName = 'Vitrine';
        break;
      case 'shelf':
        url = `/api/shelves/${editFormData.id}`;
        entityName = 'Regal';
        break;
    }

    console.log('Sending update to:', url);
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await fetch(url, {
      method: 'PUT',
      body: formData
    });

    const responseData = await response.json();
    console.log('Update response:', responseData);

    if (response.ok) {
      setEditMode(null);
      setEditImage(null);
      setEditFormData({});
      
      // Entsprechende Listen neu laden
      if (editMode === 'mineral') {
        if (currentPage === 'collection') loadMinerals();
        setShowMineralModal(false);
        setSelectedMineral(null);
      } else if (editMode === 'showcase') {
        loadShowcases();
        if (selectedShowcase) {
          // Vitrine-Details neu laden
          await openShowcaseDetails(selectedShowcase.id);
        }
      } else if (editMode === 'shelf') {
        if (selectedShowcase) {
          // Showcase-Details neu laden um aktualisierte Regalliste zu zeigen
          await openShowcaseDetails(selectedShowcase.id);
        }
        // Modal schließen
        setShowShelfMineralsModal(false);
        setSelectedShelf(null);
      }
      
      loadStats(); // Statistiken aktualisieren
      alert(`${entityName} erfolgreich aktualisiert!`);
    } else {
      alert('Fehler: ' + (responseData.error || 'Unbekannter Fehler'));
    }
  } catch (error) {
    console.error('Fehler beim Aktualisieren:', error);
    alert('Fehler beim Aktualisieren. Bitte versuchen Sie es erneut.');
  } finally {
    setLoading(false);
  }
};

// Delete-Funktion
const handleDelete = async (type: 'mineral' | 'showcase' | 'shelf', id: number) => {
  const confirmMessage = {
    mineral: 'Möchten Sie dieses Mineral wirklich löschen?',
    showcase: 'Möchten Sie diese Vitrine wirklich löschen? Alle zugehörigen Regale werden ebenfalls gelöscht!',
    shelf: 'Möchten Sie dieses Regal wirklich löschen? Alle zugeordneten Mineralien werden nicht gelöscht, aber ihre Regal-Zuordnung entfernt!'
  };

  if (!confirm(confirmMessage[type])) {
    return;
  }

  try {
    setLoading(true);
    
    let url = '';
    switch (type) {
      case 'mineral':
        url = `/api/minerals/${id}`;
        break;
      case 'showcase':
        url = `/api/showcases/${id}`;
        break;
      case 'shelf':
        url = `/api/shelves/${id}`;
        break;
    }

    console.log('Deleting:', type, 'ID:', id, 'URL:', url);

    const response = await fetch(url, {
      method: 'DELETE'
    });

    const responseData = await response.text();
    console.log('Delete response:', responseData);

    if (response.ok) {
      // Modals schließen
      if (type === 'mineral') {
        setShowMineralModal(false);
        setSelectedMineral(null);
      } else if (type === 'showcase') {
        setShowShowcaseModal(false);
        setSelectedShowcase(null);
      } else if (type === 'shelf') {
        setShowShelfMineralsModal(false);
        setSelectedShelf(null);
      }

      // Listen neu laden
      loadStats();
      
      if (currentPage === 'collection') {
        loadMinerals();
      }
      
      if (currentPage === 'vitrines') {
        loadShowcases();
      }
      
      // Bei Regal: Showcase-Details neu laden um aktualisierte Regalliste zu zeigen
      if (type === 'shelf' && selectedShowcase) {
        await openShowcaseDetails(selectedShowcase.id);
      }

      const entityNames = {
        mineral: 'Mineral',
        showcase: 'Vitrine',
        shelf: 'Regal'
      };

      alert(`${entityNames[type]} erfolgreich gelöscht!`);
    } else {
      alert('Fehler beim Löschen: ' + responseData);
    }
  } catch (error) {
    console.error('Fehler beim Löschen:', error);
    alert('Fehler beim Löschen. Bitte versuchen Sie es erneut.');
  } finally {
    setLoading(false);
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
        <title>Mineraliensammlung - Samuel von Pufendorf Gymnasium Flöha</title>
        <meta name="description" content="Entdecken Sie die Sammlung seltener Mineralien und Gesteine des Samuel von Pufendorf Gymnasium." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">💎</div>
              <div className="logo-text">
                <span className="logo-title">Gesteins- und Mineraliensammlung</span>
                <span className="logo-subtitle">Samuel von Pufendorf Gymnasium Flöha</span>
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
                    <span className="hero-highlight"> Mineralien und Gesteine</span>
                  </h1>
                  <p className="hero-description">
                    Entdecken Sie die umfangreiche Sammlung seltener Mineralien und Gesteine 
                    des Samuel von Pufendorf Gymnasiums Flöha auf eine interaktive Art.
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
                    Was kann dieses Archiv?
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
                      Herkunft, Eigenschaften und passenden Bildern.
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
                      Diese Sammlung ist Eigentum der Samuel von Pufendorf Schule in Flöha. 
                      Sowohl Lehrer als auch andere Personen trugen zu dieser Sammlung bei.
                    </p>
                    <p className="about-description">
                      Von verschiedensten Gesteinen bis hin zu seltenen 
                      Mineralien sind in dieser Sammlung zu finden.
                    </p>
                  </div>
                  
                  <div className="about-visual">
                    <div className="about-card">
                      <div className="about-card-icon">🌍</div>
                      <h4>Weltweite Fundorte</h4>
                      <p>Mineralien aus verschiedensten Fundorten</p>
                    </div>
                    <div className="about-card">
                      <div className="about-card-icon">🔬</div>
                      <h4>Wissenschaftlich dokumentiert</h4>
                      <p>Präzise Katalogisierung von Schülern dieser Schule</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Impressum Section */}
            <div className="impressum-section">
              <div className="container">
                <div className="impressum-content">
                  <div className="impressum-main">
                    <h2 className="impressum-title">Impressum</h2>
                    
                    <div className="impressum-grid">
                      <div className="impressum-card">
                        <h3>👤 Kontaktperson</h3>
                        <p><strong>Marius Schmieder (Digitalisierung)</strong></p>
                        <p>Schüler der 10c</p>
                        <p>📞 03726 123456</p>
                        <p>✉️ <a href="mailto:marius-schmieder@gymnasium-floeha.lernsax.de">
                          marius-schmieder@gymnasium-floeha.lernsax.de
                        </a></p>
                      </div>

                      <div className="impressum-card">
                        <h3>👤 Kontaktperson</h3>
                        <p><strong>Charlie Espig (Bestimmung)</strong></p>
                        <p>Schüler der 10c</p>
                        <p>📞 03726 123456</p>
                        <p>✉️ <a href="mailto:charlie-espig@gymnasium-floeha.lernsax.de">
                          charlie-espig@gymnasium-floeha.lernsax.de
                        </a></p>
                      </div>

                      <div className="impressum-card">
                        <h3>👤 Kontaktperson</h3>
                        <p><strong>Manuela Barthel (Projektleitung)</strong></p>
                        <p>Fachbereich Geologie</p>
                        <p>📞 03726 123456</p>
                        <p>✉️ <a href="mailto:manuela-bathel@gymnasium-floeha.lernsax.de">
                          manuela-barthel@gymnasium-floeha.lernsax.de
                        </a></p>
                      </div>

                      <div className="impressum-card">
                        <h3>Bildungseinrichtung</h3>
                        <p><strong>Samuel von Pufendorf Gymnasium Flöha</strong></p>
                        <p>Turnerstraße 16</p>
                        <p>09557 Flöha, Deutschland</p>
                        <p>🌐 <a href="https://gymnasium-floeha.de" target="_blank" rel="noopener noreferrer">
                            gymnasium-floeha.de
                          </a>
                        </p>
                      </div>
                      
                      <div className="impressum-card">
                        <h3>👥 Mitwirkende</h3>
                        <p>• Marius Schmieder (Digitalisierung)</p>
                        <p>• Charlie Espig (Bestimmung)</p>
                        <p>• Manuela Barthel (Projektleitung)</p>
                      </div>
                      
                      <div className="impressum-card">
                        <h3>Letzte Aktualisierung</h3>
                        <p className="last-update-date">
                          {lastUpdated ? new Date(lastUpdated).toLocaleDateString('de-DE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Wird geladen...'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="impressum-links">
                      <button className="impressum-link" onClick={showImpressumPage}>
                        Vollständiges Impressum
                      </button>
                      <button className="impressum-link" onClick={showQuellenPage}>
                        Quellen & Literatur
                      </button>
                      <button className="impressum-link" onClick={showKontaktPage}>
                        Kontakt & Support
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Impressum Page */}
            {currentPage === 'impressum' && (
              <section className="page active">
                <div className="container">
                  <div className="page-header">
                    <h1 className="page-title">Impressum</h1>
                    <p className="page-description">Rechtliche Informationen und Angaben zur Verantwortlichkeit</p>
                  </div>
                  
                  <div className="legal-content">
                    <div className="legal-section">
                      <h2>Angaben gemäß § 5 TMG</h2>
                      <p><strong>Samuel von Pufendorf Gymnasium Flöha</strong></p>
                      <p>Turnerstraße 16<br/>
                        09557 Flöha<br/>
                        Deutschland</p>
                    </div>
                    
                    <div className="legal-section">
                      <h2>Vertreten durch</h2>
                      <p>Schulleitung: Frau Noack<br/>
                        Fachbereich Geologie: Herr Sommer</p>
                    </div>
                    
                    <div className="legal-section">
                      <h2>Kontakt</h2>
                      <p>Telefon: 03726 58160<br/>
                        E-Mail: gymnasium-floeha@landkreis-mittelsachsen.de<br/>
                        Internet: www.gymnasium-floeha.de</p>
                    </div>
                    
                    <div className="legal-section">
                      <h2>Haftung für Inhalte</h2>
                      <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>
                    </div>
                    
                    <div className="legal-section">
                      <h2>Datenschutz</h2>
                      <p>Diese Website verwendet keine Cookies und sammelt keine personenbezogenen Daten. Die Mineraliensammlung dient ausschließlich wissenschaftlichen und pädagogischen Zwecken.</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Quellen Page */}
            {currentPage === 'quellen' && (
              <section className="page active">
                <div className="container">
                  <div className="page-header">
                    <h1 className="page-title">Quellen & Literatur</h1>
                    <p className="page-description">Wissenschaftliche Grundlagen und Referenzen</p>
                  </div>
                  
                  <div className="sources-content">
                    <div className="sources-section">
                      <h2>📚 Hauptliteratur</h2>
                      <ul className="sources-list">
                        <li>Klein, C. & Dutrow, B. (2007). Manual of Mineral Science. 23rd Edition. John Wiley & Sons.</li>
                        <li>Deer, W.A., Howie, R.A. & Zussman, J. (2013). An Introduction to the Rock-Forming Minerals. 3rd Edition. Mineralogical Society.</li>
                        <li>Strunz, H. & Nickel, E.H. (2001). Strunz Mineralogical Tables. 9th Edition. E. Schweizerbart'sche Verlagsbuchhandlung.</li>
                      </ul>
                    </div>
                    
                    <div className="sources-section">
                      <h2>🌐 Online-Ressourcen</h2>
                      <ul className="sources-list">
                        <li><a href="https://www.mindat.org" target="_blank" rel="noopener noreferrer">Mindat.org - Mineraldatenbank</a></li>
                        <li><a href="https://rruff.info" target="_blank" rel="noopener noreferrer">RRUFF Project - Mineraldatenbank</a></li>
                        <li><a href="https://webmineral.com" target="_blank" rel="noopener noreferrer">Webmineral - Mineralogische Datenbank</a></li>
                      </ul>
                    </div>
                    
                    <div className="sources-section">
                      <h2>🔬 Technische Ausstattung</h2>
                      <ul className="sources-list">
                        <li>Stereo-Mikroskop Leica EZ4 HD für Detailaufnahmen</li>
                        <li>Digitalkamera Nikon D7500 für Übersichtsbilder</li>
                        <li>Mineralbestimmung mit Mohshärte-Skala und Strichtafel</li>
                      </ul>
                    </div>
                    
                    <div className="sources-section">
                      <h2>🎓 Mitwirkende Personen</h2>
                      <ul className="sources-list">
                        <li><strong>Dr. Schmidt</strong> - Projektleitung, geologische Expertise</li>
                        <li><strong>Sarah Müller</strong> - Digitalisierung und Fotografie</li>
                        <li><strong>Tom Weber</strong> - Webentwicklung und Datenbank</li>
                        <li><strong>Schüler der Klassen 9-12</strong> - Katalogisierung und Beschreibung</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Kontakt Page */}
            {currentPage === 'kontakt' && (
              <section className="page active">
                <div className="container">
                  <div className="page-header">
                    <h1 className="page-title">Kontakt & Support</h1>
                    <p className="page-description">Haben Sie Fragen zur Sammlung oder benötigen Sie Unterstützung?</p>
                  </div>
                  
                  <div className="contact-content">
                    <div className="contact-grid">
                      <div className="contact-card">
                        <h3>🏫 Schuladresse</h3>
                        <p><strong>Samuel von Pufendorf Gymnasium Flöha</strong></p>
                        <p>Turnerstraße 16<br/>
                          09557 Flöha<br/>
                          Deutschland</p>
                        <p>📞 <strong>03726 58160</strong></p>
                      </div>
                      
                      <div className="contact-card">
                        <h3>👤 Ansprechpartner</h3>
                        <p><strong>Frau Barthel</strong><br/>
                          Fachbereich Geologie</p>
                        <p>📧 manuela-barthel@gymnasium-floeha.lernsax.de</p>
                        <p>🕒 Sprechzeiten: Mo-Fr 8:00-15:00</p>
                      </div>
                      
                      <div className="contact-card">
                        <h3>💻 Technischer Support</h3>
                        <p><strong>Marius Schmieder</strong><br/>
                          Schüler Klasse 10c</p>
                        <p>📧 marius-schmieder@gymnasium-floeha.lernsax.de</p>
                        <p>🔧 Bei technischen Problemen mit der Website</p>
                      </div>
                      
                      <div className="contact-card">
                        <h3>🌐 Online</h3>
                        <p><strong>Website:</strong><br/>
                          <a href="https://gymnasium-floeha.de" target="_blank" rel="noopener noreferrer">
                            gymnasium-floeha.de
                          </a></p>
                        <p><strong>Sammlung:</strong><br/>
                          Diese Webanwendung</p>
                      </div>
                    </div>
                    
                    <div className="contact-info">
                      <h2>ℹ️ Wichtige Informationen</h2>
                      <div className="info-grid">
                        <div className="info-item">
                          <h4>🔍 Besichtigungen</h4>
                          <p>Besichtigungen der physischen Sammlung sind nach Voranmeldung möglich. Bitte kontaktieren Sie Dr. Schmidt mindestens eine Woche im Voraus.</p>
                        </div>
                        <div className="info-item">
                          <h4>📖 Bildungsnutzung</h4>
                          <p>Diese Sammlung steht für Bildungszwecke zur Verfügung. Schulklassen und Interessierte sind herzlich willkommen.</p>
                        </div>
                        <div className="info-item">
                          <h4>🤝 Kooperationen</h4>
                          <p>Wir freuen uns über Kooperationen mit anderen Schulen, Universitäten und geologischen Vereinen.</p>
                        </div>
                        <div className="info-item">
                          <h4>💝 Spenden</h4>
                          <p>Mineralspenden zur Erweiterung der Sammlung werden gerne entgegengenommen. Bitte vorher Kontakt aufnehmen.</p>
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
                    <p className="page-description">Finden sie schnell heraus welche Mineralien an welchem Ort lagern.</p>
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
                    <h3>🛏️ Noch keine Vitrinen vorhanden</h3>
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
                          <div className="placeholder">🛏️</div>
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

            {isAuthenticated && (
              <div className="admin-buttons">
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleEditMineral(selectedMineral)}
                >
                  ✏️ Bearbeiten
                </button>
                <button 
                  className="btn error-btn"
                  onClick={() => handleDelete('mineral', selectedMineral.id)}
                >
                  🗑️ Löschen
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vitrine Details Modal */}
      {showShowcaseModal && selectedShowcase && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content showcase-modal">
            <span className="close-button" onClick={() => setShowShowcaseModal(false)}>&times;</span>
            <h2>{selectedShowcase.name}</h2>
            
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

            {isAuthenticated && (
              <div className="admin-buttons">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowShelfForm(true)}>
                    Neues Regal hinzufügen
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleEditShowcase(selectedShowcase)}
                >
                  ✏️ Bearbeiten
                </button>
                <button 
                  className="btn error-btn"
                  onClick={() => handleDelete('showcase', selectedShowcase.id)}
                >
                  🗑️ Löschen
                </button>
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

            {isAuthenticated && (
              <div className="admin-buttons">
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleEditShelf(selectedShelf)}
                >
                  ✏️ Bearbeiten
                </button>
                <button 
                  className="btn error-btn"
                  onClick={() => handleDelete('shelf', selectedShelf.id)}
                >
                  🗑️ Löschen
                </button>
              </div>
            )}
            
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

      {/* Edit Modal */}
      {editMode && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <span className="close-button" onClick={() => {
              setEditMode(null);
              setEditImage(null);
            }}>&times;</span>
            <h2>
              {editMode === 'mineral' ? 'Mineral bearbeiten' : 
              editMode === 'showcase' ? 'Vitrine bearbeiten' : 
              'Regal bearbeiten'}
            </h2>
            
            <form onSubmit={handleUpdateSubmit}>
              {editMode === 'mineral' && (
                <>
                  <div className="form-group">
                    <label>Name des Minerals</label>
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Steinnummer</label>
                    <input
                      type="text"
                      value={editFormData.number || ''}
                      onChange={(e) => setEditFormData({...editFormData, number: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Farbe</label>
                    <input
                      type="text"
                      value={editFormData.color || ''}
                      onChange={(e) => setEditFormData({...editFormData, color: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Beschreibung</label>
                    <textarea
                      value={editFormData.description || ''}
                      onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                      rows={4}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fundort</label>
                    <input
                      type="text"
                      value={editFormData.location || ''}
                      onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Kaufort</label>
                    <input
                      type="text"
                      value={editFormData.purchase_location || ''}
                      onChange={(e) => setEditFormData({...editFormData, purchase_location: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Gesteinsart</label>
                    <input
                      type="text"
                      value={editFormData.rock_type || ''}
                      onChange={(e) => setEditFormData({...editFormData, rock_type: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Regal</label>
                    <select
                      value={editFormData.shelf_id || ''}
                      onChange={(e) => setEditFormData({...editFormData, shelf_id: e.target.value})}
                    >
                      <option value="">Kein Regal zugeordnet</option>
                      {shelves.map(shelf => (
                        <option key={shelf.id} value={shelf.id}>
                          {shelf.showcase_name} - {shelf.name} ({shelf.full_code})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {editMode === 'showcase' && (
                <>
                  <div className="form-group">
                    <label>Name der Vitrine</label>
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Vitrine-Code</label>
                    <input
                      type="text"
                      value={editFormData.code || ''}
                      onChange={(e) => setEditFormData({...editFormData, code: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Standort</label>
                    <input
                      type="text"
                      value={editFormData.location || ''}
                      onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Beschreibung</label>
                    <textarea
                      value={editFormData.description || ''}
                      onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                      rows={4}
                    />
                  </div>
                </>
              )}

              {editMode === 'shelf' && (
                <>
                  <div className="form-group">
                    <label>Name des Regals</label>
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Regal-Code</label>
                    <input
                      type="text"
                      value={editFormData.code || ''}
                      onChange={(e) => setEditFormData({...editFormData, code: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Beschreibung</label>
                    <textarea
                      value={editFormData.description || ''}
                      onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Position/Reihenfolge</label>
                    <input
                      type="number"
                      value={editFormData.position_order || 0}
                      onChange={(e) => setEditFormData({...editFormData, position_order: parseInt(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Bild ersetzen (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                />
                {editImage && (
                  <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                    Neues Bild: {editImage.name}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditMode(null);
                    setEditImage(null);
                  }}
                >
                  Abbrechen
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Wird gespeichert...' : 'Änderungen speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary-color: #1e40af;
          --primary-light: #3b82f6;
          --primary-dark: #1e3a8a;
          --secondary-color: #64748b;
          --accent-color: #0ea5e9;
          --success-color: #10b981;
          --warning-color: #f59e0b;
          --error-color: #ef4444;
          
          --white: #ffffff;
          --gray-50: #f8fafc;
          --gray-100: #f1f5f9;
          --gray-200: #e2e8f0;
          --gray-300: #cbd5e1;
          --gray-400: #94a3b8;
          --gray-500: #64748b;
          --gray-600: #475569;
          --gray-700: #334155;
          --gray-800: #1e293b;
          --gray-900: #0f172a;
          
          --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --font-size-xs: 0.75rem;
          --font-size-sm: 0.875rem;
          --font-size-base: 1rem;
          --font-size-lg: 1.125rem;
          --font-size-xl: 1.25rem;
          --font-size-2xl: 1.5rem;
          --font-size-3xl: 1.875rem;
          --font-size-4xl: 2.25rem;
          --font-size-5xl: 3rem;
          
          --space-1: 0.25rem;
          --space-2: 0.5rem;
          --space-3: 0.75rem;
          --space-4: 1rem;
          --space-5: 1.25rem;
          --space-6: 1.5rem;
          --space-8: 2rem;
          --space-10: 2.5rem;
          --space-12: 3rem;
          --space-16: 4rem;
          --space-20: 5rem;
          
          --radius-sm: 0.375rem;
          --radius-md: 0.5rem;
          --radius-lg: 0.75rem;
          --radius-xl: 1rem;
          --radius-2xl: 1.5rem;
          
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
          --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
          
          --transition-fast: 0.15s ease;
          --transition-normal: 0.3s ease;
          --transition-slow: 0.5s ease;
          
          --container-max-width: 1200px;
          --header-height: 80px;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: var(--font-family);
          font-size: var(--font-size-base);
          line-height: 1.6;
          color: var(--gray-800);
          background-color: var(--gray-50);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .container {
          max-width: var(--container-max-width);
          margin: 0 auto;
          padding: 0 var(--space-4);
        }

        /* Header Styles */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--gray-200);
          height: var(--header-height);
          transition: all var(--transition-normal);
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: var(--header-height);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          text-decoration: none;
          color: var(--gray-900);
        }

        .logo-icon {
          font-size: var(--font-size-2xl);
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-size: var(--font-size-lg);
          font-weight: 700;
          color: var(--gray-900);
          line-height: 1.2;
        }

        .logo-subtitle {
          font-size: var(--font-size-sm);
          color: var(--gray-600);
          font-weight: 500;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: var(--space-8);
        }

        .nav-link {
          position: relative;
          color: var(--gray-600);
          text-decoration: none;
          font-weight: 500;
          font-size: var(--font-size-sm);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          cursor: pointer;
        }

        .nav-link:hover {
          color: var(--primary-color);
          background-color: var(--gray-100);
        }

        .nav-link.active {
          color: var(--primary-color);
          background-color: rgba(30, 64, 175, 0.1);
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: var(--space-4);
          right: var(--space-4);
          height: 2px;
          background: var(--primary-color);
          border-radius: 1px;
        }

        /* Mobile Menu */
        .mobile-menu-toggle {
          display: none;
          flex-direction: column;
          cursor: pointer;
          padding: var(--space-2);
          gap: var(--space-1);
        }

        .mobile-menu-toggle span {
          width: 24px;
          height: 2px;
          background: var(--gray-700);
          border-radius: 1px;
          transition: all var(--transition-fast);
        }

        .mobile-nav {
          display: none;
          position: fixed;
          top: var(--header-height);
          left: 0;
          right: 0;
          background: var(--white);
          border-bottom: 1px solid var(--gray-200);
          box-shadow: var(--shadow-lg);
          z-index: 999;
        }

        .mobile-nav.active {
          display: block;
        }

        .mobile-nav-link {
          display: block;
          padding: var(--space-4);
          color: var(--gray-700);
          text-decoration: none;
          font-weight: 500;
          border-bottom: 1px solid var(--gray-100);
          transition: all var(--transition-fast);
          cursor: pointer;
        }

        .mobile-nav-link:hover {
          background-color: var(--gray-50);
          color: var(--primary-color);
        }

        /* Main Content */
        main {
          margin-top: var(--header-height);
        }

        .page {
          display: none;
          min-height: calc(100vh - var(--header-height));
        }

        .page.active {
          display: block;
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .page-header {
          padding: var(--space-16) 0 var(--space-12);
          text-align: center;
        }

        .page-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-align: left;
        }

        .page-title {
          font-size: var(--font-size-4xl);
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-4);
          line-height: 1.1;
        }

        .page-description {
          font-size: var(--font-size-lg);
          color: var(--gray-600);
          max-width: 600px;
          margin: 0 auto;
        }

        /* Hero Section */
        .hero {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
          color: var(--white);
          padding: var(--space-20) 0;
          position: relative;
          overflow: hidden;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: var(--space-16);
          align-items: center;
        }

        .hero-title {
          font-size: var(--font-size-5xl);
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: var(--space-6);
        }

        .hero-highlight {
          background: linear-gradient(135deg, #60a5fa, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: var(--font-size-lg);
          line-height: 1.6;
          margin-bottom: var(--space-8);
          opacity: 0.9;
        }

        .hero-buttons {
          display: flex;
          gap: var(--space-4);
          flex-wrap: wrap;
        }

        .hero-visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-crystal {
          font-size: 8rem;
          animation: float 6s ease-in-out infinite;
          filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .hero-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          font-size: var(--font-size-2xl);
          opacity: 0.7;
          animation: sparkle 4s ease-in-out infinite;
        }

        .particle:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
        .particle:nth-child(2) { top: 60%; right: 15%; animation-delay: 1s; }
        .particle:nth-child(3) { bottom: 30%; left: 20%; animation-delay: 2s; }
        .particle:nth-child(4) { top: 10%; right: 30%; animation-delay: 3s; }

        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-3) var(--space-6);
          font-size: var(--font-size-sm);
          font-weight: 600;
          border: none;
          border-radius: var(--radius-lg);
          cursor: pointer;
          text-decoration: none;
          transition: all var(--transition-fast);
          line-height: 1;
          gap: var(--space-2);
        }

        .btn-primary {
          background: var(--primary-color);
          color: var(--white);
          box-shadow: var(--shadow-sm);
        }

        .btn-primary:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .btn-secondary {
          background: var(--white);
          color: var(--primary-color);
          border: 2px solid var(--primary-color);
        }

        .btn-secondary:hover {
          background: var(--primary-color);
          color: var(--white);
          transform: translateY(-1px);
        }

        .btn-large {
          padding: var(--space-4) var(--space-8);
          font-size: var(--font-size-base);
        }

        /* Statistics Section */
        .stats-section {
          padding: var(--space-20) 0;
          background: var(--white);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-6);
        }

        .stat-card {
          background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
          color: var(--white);
          padding: var(--space-8);
          border-radius: var(--radius-xl);
          text-align: center;
          box-shadow: var(--shadow-lg);
          transition: transform var(--transition-normal);
        }

        .stat-card:hover {
          transform: translateY(-4px);
        }

        .stat-number {
          font-size: var(--font-size-4xl);
          font-weight: 700;
          margin-bottom: var(--space-2);
          display: block;
        }

        .stat-label {
          font-size: var(--font-size-lg);
          opacity: 0.9;
          font-weight: 500;
        }

        /* Features Section */
        .features-section {
          padding: var(--space-20) 0;
          background: var(--gray-50);
        }

        .section-header {
          text-align: center;
          margin-bottom: var(--space-16);
        }

        .section-title {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-4);
        }

        .section-description {
          font-size: var(--font-size-lg);
          color: var(--gray-600);
          max-width: 600px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-8);
        }

        .feature-card {
          background: var(--white);
          padding: var(--space-8);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--gray-200);
          transition: all var(--transition-normal);
          text-align: center;
        }

        .feature-card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-4px);
          border-color: var(--primary-color);
        }

        .feature-icon {
          font-size: var(--font-size-4xl);
          margin-bottom: var(--space-4);
          display: block;
        }

        .feature-title {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: var(--space-3);
        }

        .feature-description {
          color: var(--gray-600);
          line-height: 1.6;
        }

        /* About Section */
        .about-section {
          padding: var(--space-20) 0;
          background: var(--white);
        }

        .about-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: var(--space-16);
          align-items: center;
        }

        .about-title {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-6);
        }

        .about-description {
          font-size: var(--font-size-lg);
          color: var(--gray-600);
          line-height: 1.7;
          margin-bottom: var(--space-4);
        }

        .about-visual {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .about-card {
          background: var(--gray-50);
          padding: var(--space-6);
          border-radius: var(--radius-lg);
          text-align: center;
          border: 1px solid var(--gray-200);
        }

        .about-card-icon {
          font-size: var(--font-size-2xl);
          margin-bottom: var(--space-3);
        }

        .about-card h4 {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: var(--space-2);
        }

        .about-card p {
          color: var(--gray-600);
          font-size: var(--font-size-sm);
        }

        /* Impressums-Bereich auf der Startseite */
        .impressum-section {
          padding: var(--space-20) 0;
          background: var(--gray-100);
          border-top: 1px solid var(--gray-200);
        }

        .impressum-content {
          max-width: 1000px;
          margin: 0 auto;
        }

        .impressum-title {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--gray-900);
          text-align: center;
          margin-bottom: var(--space-12);
        }

        .impressum-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-6);
          margin-bottom: var(--space-10);
        }

        .impressum-card {
          background: var(--white);
          padding: var(--space-6);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--gray-200);
          transition: all var(--transition-normal);
        }

        .impressum-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .impressum-card h3 {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: var(--space-4);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .impressum-card p {
          color: var(--gray-700);
          margin-bottom: var(--space-2);
          line-height: 1.5;
        }

        .impressum-card p:last-child {
          margin-bottom: 0;
        }

        .impressum-card strong {
          color: var(--gray-900);
          font-weight: 600;
        }

        .impressum-card a {
          color: var(--primary-color);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .impressum-card a:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }

        .last-update-date {
          font-weight: 600;
          color: var(--primary-color);
          background: rgba(30, 64, 175, 0.1);
          padding: var(--space-3);
          border-radius: var(--radius-md);
          text-align: center;
        }

        .impressum-links {
          display: flex;
          justify-content: center;
          gap: var(--space-4);
          flex-wrap: wrap;
          margin-top: var(--space-8);
        }

        .impressum-link {
          background: var(--primary-color);
          color: var(--white);
          border: none;
          padding: var(--space-3) var(--space-6);
          border-radius: var(--radius-lg);
          font-size: var(--font-size-sm);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .impressum-link:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        /* Rechtliche Seiten */
        .legal-content,
        .sources-content,
        .contact-content {
          max-width: 800px;
          margin: 0 auto;
          background: var(--white);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--gray-200);
        }

        .legal-section,
        .sources-section {
          margin-bottom: var(--space-8);
          padding-bottom: var(--space-6);
          border-bottom: 1px solid var(--gray-200);
        }

        .legal-section:last-child,
        .sources-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .legal-section h2,
        .sources-section h2 {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: var(--space-4);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .legal-section p,
        .sources-section p {
          color: var(--gray-700);
          line-height: 1.7;
          margin-bottom: var(--space-3);
        }

        .legal-section p:last-child,
        .sources-section p:last-child {
          margin-bottom: 0;
        }

        /* Quellen-Listen */
        .sources-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .sources-list li {
          padding: var(--space-3) 0;
          border-bottom: 1px solid var(--gray-200);
          color: var(--gray-700);
          line-height: 1.6;
        }

        .sources-list li:last-child {
          border-bottom: none;
        }

        .sources-list li::before {
          content: "📎";
          margin-right: var(--space-3);
        }

        .sources-list a {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 500;
          transition: color var(--transition-fast);
        }

        .sources-list a:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }

        /* Kontakt-Seite */
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-6);
          margin-bottom: var(--space-10);
        }

        .contact-card {
          background: var(--gray-50);
          padding: var(--space-6);
          border-radius: var(--radius-lg);
          border: 1px solid var(--gray-200);
          transition: all var(--transition-normal);
        }

        .contact-card:hover {
          background: var(--white);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .contact-card h3 {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: var(--space-4);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .contact-card p {
          color: var(--gray-700);
          margin-bottom: var(--space-2);
          line-height: 1.5;
        }

        .contact-card p:last-child {
          margin-bottom: 0;
        }

        .contact-card strong {
          color: var(--gray-900);
          font-weight: 600;
        }

        .contact-card a {
          color: var(--primary-color);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .contact-card a:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }

        .contact-info {
          margin-top: var(--space-10);
          padding-top: var(--space-8);
          border-top: 2px solid var(--gray-200);
        }

        .contact-info h2 {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-6);
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-6);
        }

        .info-item {
          background: var(--gray-50);
          padding: var(--space-5);
          border-radius: var(--radius-lg);
          border-left: 4px solid var(--primary-color);
        }

        .info-item h4 {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: var(--space-3);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .info-item p {
          color: var(--gray-700);
          line-height: 1.6;
          margin: 0;
        }

        /* Mobile Anpassungen */
        @media (max-width: 768px) {
          .impressum-grid {
            grid-template-columns: 1fr;
            gap: var(--space-4);
          }
          
          .impressum-links {
            flex-direction: column;
            align-items: center;
          }
          
          .impressum-link {
            width: 100%;
            max-width: 300px;
            justify-content: center;
          }
          
          .contact-grid {
            grid-template-columns: 1fr;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .legal-content,
          .sources-content,
          .contact-content {
            padding: var(--space-6);
            margin: var(--space-4);
          }
        }

        @media (max-width: 480px) {
          .impressum-section {
            padding: var(--space-16) 0;
          }
          
          .impressum-title {
            font-size: var(--font-size-2xl);
          }
          
          .impressum-card,
          .contact-card {
            padding: var(--space-4);
          }
          
          .legal-content,
          .sources-content,
          .contact-content {
            padding: var(--space-4);
            margin: var(--space-2);
          }
        }

        /* Search and Filter */
        .search-filter-container {
          background: var(--white);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          margin-bottom: var(--space-6);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--gray-200);
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: var(--space-8);
        }

        .search-section h3,
        .filter-section h3 {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: var(--space-4);
        }

        .search-input {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          border: 2px solid var(--gray-200);
          border-radius: var(--radius-lg);
          font-size: var(--font-size-base);
          transition: border-color var(--transition-fast);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
        }

        .filter-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-4);
          align-items: end;
        }

        .filter-section h3 {
          grid-column: 1 / -1;
          margin-bottom: var(--space-2);
        }

        .filter-select {
          padding: var(--space-3) var(--space-4);
          border: 2px solid var(--gray-200);
          border-radius: var(--radius-lg);
          font-size: var(--font-size-sm);
          background: var(--white);
          transition: border-color var(--transition-fast);
        }

        .filter-select:focus {
          outline: none;
          border-color: var(--primary-color);
        }

        .filter-info {
          background: rgba(30, 64, 175, 0.1);
          border: 1px solid rgba(30, 64, 175, 0.2);
          color: var(--primary-dark);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-4);
          display: none;
          align-items: center;
          gap: var(--space-4);
          flex-wrap: wrap;
        }

        .filter-info.show {
          display: flex;
        }

        .filter-tag {
          background: var(--primary-color);
          color: var(--white);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-md);
          font-size: var(--font-size-xs);
          font-weight: 500;
        }

        .clear-filters {
          background: var(--error-color);
          color: var(--white);
          border: none;
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-md);
          font-size: var(--font-size-xs);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .clear-filters:hover {
          background: #dc2626;
        }

        .sort-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          margin-bottom: var(--space-8);
          padding: var(--space-4);
          background: var(--white);
          border-radius: var(--radius-lg);
          border: 1px solid var(--gray-200);
        }

        .sort-section label {
          font-weight: 500;
          color: var(--gray-700);
        }

        .sort-section select {
          padding: var(--space-2) var(--space-4);
          border: 1px solid var(--gray-300);
          border-radius: var(--radius-md);
          background: var(--white);
        }

        /* Grid Layouts */
        .minerals-grid,
        .vitrines-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-6);
          padding: var(--space-4) 0;
        }

        .mineral-card,
        .vitrine-card {
          background: var(--white);
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--gray-200);
          transition: all var(--transition-normal);
          cursor: pointer;
        }

        .mineral-card:hover,
        .vitrine-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
          border-color: var(--primary-color);
        }

        .mineral-image,
        .vitrine-image {
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: var(--white);
          position: relative;
          overflow: hidden;
        }

        .mineral-image img,
        .vitrine-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-normal);
        }

        .mineral-card:hover .mineral-image img,
        .vitrine-card:hover .vitrine-image img {
          transform: scale(1.05);
        }

        .mineral-info,
        .vitrine-info {
          padding: var(--space-6);
        }

        .mineral-info h3,
        .vitrine-info h3 {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: var(--space-3);
        }

        .mineral-info p,
        .vitrine-info p {
          font-size: var(--font-size-sm);
          color: var(--gray-600);
          margin-bottom: var(--space-2);
          line-height: 1.5;
        }

        .mineral-info p strong,
        .vitrine-info p strong {
          color: var(--gray-800);
          font-weight: 600;
        }

        .loading {
          grid-column: 1 / -1;
          text-align: center;
          padding: var(--space-20);
          font-size: var(--font-size-lg);
          color: var(--gray-500);
        }

        /* Vitrine Stats */
        .vitrine-stats {
          display: flex;
          justify-content: space-between;
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--gray-200);
        }

        .vitrine-stat {
          text-align: center;
          flex: 1;
        }

        .vitrine-stat-number {
          display: block;
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: var(--space-1);
        }

        .vitrine-stat-label {
          font-size: var(--font-size-xs);
          color: var(--gray-500);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Modal Styles */
        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
        }

        .modal-content {
          background: var(--white);
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: var(--shadow-xl);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .close-button {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          background: var(--gray-100);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: var(--font-size-xl);
          color: var(--gray-600);
          transition: all var(--transition-fast);
        }

        .close-button:hover {
          background: var(--gray-200);
          color: var(--gray-800);
        }

        .modal h2 {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-6);
          padding-right: var(--space-12);
        }

        /* Detail Views */
        .detail-info {
          display: grid;
          gap: var(--space-4);
          margin: var(--space-6) 0;
        }

        .detail-item {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: var(--space-4);
          padding: var(--space-4) 0;
          border-bottom: 1px solid var(--gray-200);
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-weight: 600;
          color: var(--gray-700);
        }

        .detail-value {
          color: var(--gray-900);
        }

        .detail-image {
          text-align: center;
          margin: var(--space-6) 0;
        }

        .detail-image img {
          max-width: 100%;
          height: auto;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
        }

        /* Forms */
        .admin-form-container {
          max-width: 800px;
          margin: 0 auto;
          background: var(--white);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--gray-200);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
        }

        .form-group label {
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--gray-700);
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          padding: var(--space-3) var(--space-4);
          border: 2px solid var(--gray-200);
          border-radius: var(--radius-lg);
          font-size: var(--font-size-base);
          transition: border-color var(--transition-fast);
          background: var(--white);
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
        }

        .form-group textarea {
          min-height: 100px;
          resize: vertical;
          font-family: inherit;
        }

        .no-showcases {
          grid-column: 1 / -1;
          text-align: center;
          padding: var(--space-20);
          color: var(--gray-500);
        }

        .no-showcases h3 {
          color: var(--gray-600);
          margin-bottom: var(--space-4);
          font-size: var(--font-size-xl);
        }

        .no-showcases p {
          margin-bottom: var(--space-6);
        }

        .placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-size: inherit;
        }

        .form-group textarea {
          min-height: 100px;
          resize: vertical;
          font-family: inherit;
        }

        .modal-content form {
          width: 100%;
        }

        .form-group {
          margin-bottom: var(--space-4);
        }

        .shelf-card.clickable {
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .shelf-card.clickable:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .shelf-image {
          width: 100%;
          height: 120px;
          background: linear-gradient(135deg, var(--gray-400), var(--gray-500));
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: var(--space-3);
        }

        .shelf-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-normal);
        }

        .shelf-card.clickable:hover .shelf-image img {
          transform: scale(1.05);
        }

        .shelf-minerals-modal .modal-content {
          max-width: 1000px;
          max-height: 90vh;
        }

        .shelf-minerals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-4);
          max-height: 60vh;
          overflow-y: auto;
          padding: var(--space-2);
        }

        .mineral-card-small {
          background: var(--white);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--gray-200);
          transition: all var(--transition-normal);
          cursor: pointer;
          display: flex;
          gap: var(--space-3);
          padding: var(--space-3);
        }

        .mineral-card-small:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary-color);
        }

        .mineral-image-small {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: var(--white);
          flex-shrink: 0;
          overflow: hidden;
        }

        .number-input-container {
          position: relative;
        }

        .number-input {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          border: 2px solid var(--gray-200);
          border-radius: var(--radius-lg);
          font-size: var(--font-size-base);
          transition: border-color var(--transition-fast);
          background: var(--white);
        }

        .number-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
        }

        .number-input.error {
          border-color: var(--error-color);
          background-color: rgba(239, 68, 68, 0.05);
        }

        .number-input.error:focus {
          border-color: var(--error-color);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .number-input.success {
          border-color: var(--success-color);
          background-color: rgba(16, 185, 129, 0.05);
        }

        .number-input.success:focus {
          border-color: var(--success-color);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .number-validation-indicator {
          margin-top: var(--space-2);
          min-height: 24px;
          display: flex;
          align-items: center;
        }

        .checking-indicator {
          color: var(--gray-600);
          font-size: var(--font-size-sm);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .error-indicator {
          color: var(--error-color);
          font-size: var(--font-size-sm);
          font-weight: 500;
        }

        .success-indicator {
          color: var(--success-color);
          font-size: var(--font-size-sm);
          font-weight: 500;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--gray-300);
          border-top: 2px solid var(--gray-600);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Button Disabled State Styles */
        .btn:disabled {
          background: var(--gray-300);
          color: var(--gray-500);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn-primary:disabled {
          background: var(--gray-300);
          border-color: var(--gray-300);
        }

        .btn-primary:disabled:hover {
          background: var(--gray-300);
          border-color: var(--gray-300);
          transform: none;
          box-shadow: none;
        }

        .mineral-image-small img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-normal);
        }

        .mineral-card-small:hover .mineral-image-small img {
          transform: scale(1.1);
        }

        .mineral-info-small {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .mineral-info-small h4 {
          font-size: var(--font-size-base);
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: var(--space-2);
          line-height: 1.2;
        }

        .mineral-info-small p {
          font-size: var(--font-size-sm);
          color: var(--gray-600);
          margin-bottom: var(--space-1);
          line-height: 1.3;
        }

        .mineral-info-small p strong {
          color: var(--gray-800);
          font-weight: 600;
        }

        .btn.error-btn {
          background: var(--error-color);
          color: var(--white);
          border: 2px solid var(--error-color);
        }

        .btn.error-btn:hover {
          background: #dc2626;
          border-color: #dc2626;
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        /* Admin-Buttons Container */
        .admin-buttons {
          display: flex;
          gap: var(--space-4);
          justify-content: center;
          margin-top: var(--space-6);
          padding-top: var(--space-4);
          border-top: 1px solid var(--gray-200);
        }

        @media (max-width: 768px) {
          .admin-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .admin-buttons .btn {
            width: 100%;
            max-width: 200px;
          }
        }

        /* Mobile Anpassungen */
        @media (max-width: 768px) {
          .shelf-minerals-modal .modal-content {
            margin: var(--space-2);
            max-height: calc(100vh - 1rem);
          }
          
          .shelf-minerals-grid {
            grid-template-columns: 1fr;
            max-height: 50vh;
          }
          
          .mineral-card-small {
            padding: var(--space-2);
            gap: var(--space-2);
          }
          
          .mineral-image-small {
            width: 60px;
            height: 60px;
          }
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: flex;
          }

          .nav {
            display: none;
          }

          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
            gap: var(--space-8);
          }

          .about-content {
            grid-template-columns: 1fr;
            gap: var(--space-8);
          }

          .search-filter-container {
            grid-template-columns: 1fr;
            gap: var(--space-4);
          }

          .filter-section {
            grid-template-columns: 1fr;
          }

          .page-header-content {
            flex-direction: column;
            gap: var(--space-4);
            text-align: center;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .minerals-grid,
          .vitrines-grid {
            grid-template-columns: 1fr;
          }

          .hero-title {
            font-size: var(--font-size-3xl);
          }

          .page-title {
            font-size: var(--font-size-3xl);
          }

          .hero-crystal {
            font-size: 4rem;
          }

          .modal-content {
            margin: var(--space-4);
            max-height: calc(100vh - 2rem);
          }

          .detail-item {
            grid-template-columns: 1fr;
            gap: var(--space-2);
          }
        }

        .showcase-modal .modal-content {
          max-width: 800px;
          max-height: 90vh;
        }

        .shelves-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: var(--space-4);
          margin-top: var(--space-4);
        }

        .shelf-card {
          background: var(--gray-50);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          transition: all var(--transition-fast);
        }

        .shelf-card:hover {
          background: var(--gray-100);
          border-color: var(--primary-color);
        }

        .shelf-info h4 {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: var(--space-2);
        }

        .shelf-info p {
          font-size: var(--font-size-sm);
          color: var(--gray-600);
          margin-bottom: var(--space-1);
          line-height: 1.4;
        }

        .shelf-info p strong {
          color: var(--gray-800);
          font-weight: 600;
        }

        @media (max-width: 480px) {
          .container {
            padding: 0 var(--space-3);
          }

          .logo-text {
            display: none;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .hero-title {
            font-size: var(--font-size-2xl);
          }

          .page-title {
            font-size: var(--font-size-2xl);
          }
        }
      `}</style>
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
  
  // Neue States für die Nummer-Validierung
  const [numberExists, setNumberExists] = useState(false);
  const [checkingNumber, setCheckingNumber] = useState(false);
  const [numberCheckTimeout, setNumberCheckTimeout] = useState<NodeJS.Timeout | null>(null);

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

    // Funktion zur Überprüfung der Steinnummer
  const checkMineralNumber = async (number: string) => {
    if (!number.trim()) {
      setNumberExists(false);
      return;
    }

    try {
      setCheckingNumber(true);
      const response = await fetch(`/api/minerals/check-number?number=${encodeURIComponent(number.trim())}`);
      
      if (response.ok) {
        const data = await response.json();
        setNumberExists(data.exists);
      } else {
        console.error('Fehler beim Überprüfen der Nummer:', response.statusText);
      }
    } catch (error) {
      console.error('Fehler beim Überprüfen der Nummer:', error);
    } finally {
      setCheckingNumber(false);
    }
  };

  // Debounced Nummer-Überprüfung
  const handleNumberChange = (value: string) => {
    setFormData({...formData, number: value});
    
    // Vorherigen Timeout löschen
    if (numberCheckTimeout) {
      clearTimeout(numberCheckTimeout);
    }
    
    // Neuen Timeout setzen (500ms Verzögerung)
    const timeout = setTimeout(() => {
      checkMineralNumber(value);
    }, 500);
    
    setNumberCheckTimeout(timeout);
  };

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (numberCheckTimeout) {
        clearTimeout(numberCheckTimeout);
      }
    };
  }, [numberCheckTimeout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Überprüfung vor dem Absenden
    if (numberExists) {
      alert('Diese Steinnummer existiert bereits. Bitte wählen Sie eine andere Nummer.');
      return;
    }

    if (!formData.number.trim()) {
      alert('Bitte geben Sie eine Steinnummer ein.');
      return;
    }

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
        setNumberExists(false);
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
        <div className="number-input-container">
          <input
            type="text"
            id="number"
            value={formData.number}
            onChange={(e) => handleNumberChange(e.target.value)}
            placeholder="Eindeutige Identifikationsnummer"
            className={`number-input ${numberExists ? 'error' : formData.number.trim() && !checkingNumber && !numberExists ? 'success' : ''}`}
            required
          />
          <div className="number-validation-indicator">
            {checkingNumber && (
              <span className="checking-indicator">
                <span className="spinner"></span>
                Überprüfe...
              </span>
            )}
            {!checkingNumber && formData.number.trim() && numberExists && (
              <span className="error-indicator">
                ❌ Diese Nummer existiert bereits
              </span>
            )}
            {!checkingNumber && formData.number.trim() && !numberExists && (
              <span className="success-indicator">
                ✅ Nummer verfügbar
              </span>
            )}
          </div>
        </div>
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

      <button 
        type="submit" 
        disabled={loading || numberExists || checkingNumber || !formData.number.trim()} 
        className="btn btn-primary btn-large"
      >
        {loading ? 'Wird hinzugefügt...' : 'Mineral hinzufügen'}
      </button>
    </form>
  );
}