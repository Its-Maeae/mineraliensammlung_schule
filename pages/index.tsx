import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Mineral, Showcase, Stats } from '../types';
import Header from '../components/Header.tsx';
import MobileNav from '../components/MobileNav.tsx';
import HomePage from '../components/HomePage.tsx';
import CollectionPage from '../components/CollectionPage.tsx';
import VitrinesPage from '../components/VitrinesPage.tsx';
import AdminPage from '../components/AdminPage.tsx';
import LegalPages from '../components/LegalPages.tsx';
import PasswordModal from '../components/PasswordModal.tsx';
import MineralModal from '../components/MineralModal.tsx';
import ShowcaseModal from '../components/ShowcaseModal.tsx';
import ShelfModal from '../components/ShelfModal.tsx';
import VitrineFormModal from '../components/VitrineFormModal.tsx';
import ShelfFormModal from '../components/ShelfFormModal.tsx';
import EditModal from '../components/EditModal.tsx';

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

  useEffect(() => {
    if (currentPage === 'collection') {
      loadMinerals();
    }
  }, [searchTerm, colorFilter, locationFilter, rockTypeFilter, sortBy]);

  useEffect(() => {
    checkAuthentication();
  }, []);

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

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      
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

      const response = await fetch(url, {
        method: 'PUT',
        body: formData
      });

      const responseData = await response.json();

      if (response.ok) {
        setEditMode(null);
        setEditImage(null);
        setEditFormData({});
        
        if (editMode === 'mineral') {
          if (currentPage === 'collection') loadMinerals();
          setShowMineralModal(false);
          setSelectedMineral(null);
        } else if (editMode === 'showcase') {
          loadShowcases();
          if (selectedShowcase) {
            await openShowcaseDetails(selectedShowcase.id);
          }
        } else if (editMode === 'shelf') {
          if (selectedShowcase) {
            await openShowcaseDetails(selectedShowcase.id);
          }
          setShowShelfMineralsModal(false);
          setSelectedShelf(null);
        }
        
        loadStats();
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

      const response = await fetch(url, {
        method: 'DELETE'
      });

      if (response.ok) {
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

        loadStats();
        
        if (currentPage === 'collection') {
          loadMinerals();
        }
        
        if (currentPage === 'vitrines') {
          loadShowcases();
        }
        
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
        const responseData = await response.text();
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

  return (
    <>
      <Head>
        <title>Mineraliensammlung - Samuel von Pufendorf Gymnasium Flöha</title>
        <meta name="description" content="Entdecken Sie die Sammlung seltener Mineralien und Gesteine des Samuel von Pufendorf Gymnasium." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header 
        currentPage={currentPage}
        showPage={showPage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <MobileNav 
        mobileMenuOpen={mobileMenuOpen}
        showPage={showPage}
      />

      <main>
        {currentPage === 'home' && (
          <HomePage 
            showPage={showPage}
            stats={stats}
            lastUpdated={lastUpdated}
            loadLastUpdated={loadLastUpdated}
          />
        )}

        {currentPage === 'collection' && (
          <CollectionPage 
            minerals={minerals}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            colorFilter={colorFilter}
            setColorFilter={setColorFilter}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            rockTypeFilter={rockTypeFilter}
            setRockTypeFilter={setRockTypeFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterOptions={filterOptions}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
            onOpenMineralDetails={openMineralDetails}
          />
        )}

        {currentPage === 'vitrines' && (
          <VitrinesPage 
            showcases={showcases}
            loading={loading}
            isAuthenticated={isAuthenticated}
            onOpenShowcaseDetails={openShowcaseDetails}
            setShowVitrineForm={setShowVitrineForm}
          />
        )}

        {currentPage === 'admin' && isAuthenticated && (
          <AdminPage 
            isAuthenticated={isAuthenticated}
            onSuccess={() => {
              loadStats();
              if (currentPage === 'collection') loadMinerals();
            }}
          />
        )}

        {(currentPage === 'impressum' || currentPage === 'quellen' || currentPage === 'kontakt') && (
          <LegalPages currentPage={currentPage} />
        )}
      </main>

      {showPasswordModal && (
        <PasswordModal 
          password={password}
          setPassword={setPassword}
          onSubmit={handleLogin}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {showMineralModal && selectedMineral && (
        <MineralModal 
          mineral={selectedMineral}
          isAuthenticated={isAuthenticated}
          onClose={() => setShowMineralModal(false)}
          onEdit={handleEditMineral}
          onDelete={handleDelete}
        />
      )}

      {showShowcaseModal && selectedShowcase && (
        <ShowcaseModal 
          showcase={selectedShowcase}
          isAuthenticated={isAuthenticated}
          onClose={() => setShowShowcaseModal(false)}
          onEdit={handleEditShowcase}
          onDelete={handleDelete}
          setShowShelfForm={setShowShelfForm}
          onOpenShelfDetails={openShelfDetails}
        />
      )}

      {showShelfMineralsModal && selectedShelf && (
        <ShelfModal 
          shelf={selectedShelf}
          minerals={shelfMinerals}
          loading={loading}
          isAuthenticated={isAuthenticated}
          onClose={() => setShowShelfMineralsModal(false)}
          onEdit={handleEditShelf}
          onDelete={handleDelete}
          onOpenMineralDetails={openMineralDetails}
          setShowShelfMineralsModal={setShowShelfMineralsModal}
        />
      )}

      {showVitrineForm && (
        <VitrineFormModal 
          formData={vitrineFormData}
          setFormData={setVitrineFormData}
          image={vitrineImage}
          setImage={setVitrineImage}
          loading={loading}
          onSubmit={handleVitrineSubmit}
          onClose={() => {
            setShowVitrineForm(false);
            setVitrineImage(null);
          }}
        />
      )}

      {showShelfForm && selectedShowcase && (
        <ShelfFormModal 
          showcase={selectedShowcase}
          formData={shelfFormData}
          setFormData={setShelfFormData}
          image={shelfImage}
          setImage={setShelfImage}
          loading={loading}
          onSubmit={handleShelfSubmit}
          onClose={() => {
            setShowShelfForm(false);
            setShelfImage(null);
          }}
        />
      )}

      {editMode && (
        <EditModal 
          editMode={editMode}
          formData={editFormData}
          setFormData={setEditFormData}
          image={editImage}
          setImage={setEditImage}
          shelves={shelves}
          loading={loading}
          onSubmit={handleUpdateSubmit}
          onClose={() => {
            setEditMode(null);
            setEditImage(null);
          }}
        />
      )}
    </>
  );
}