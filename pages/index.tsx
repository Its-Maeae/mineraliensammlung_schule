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
  const [showMineralModal, setShowMineralModal] = useState(false);
  const [showShowcaseModal, setShowShowcaseModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showShelfForm, setShowShelfForm] = useState(false);
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

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/check');
      setIsAuthenticated(response.ok);
    } catch (error) {
      setIsAuthenticated(false);
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
        <title>Mineraliensammlung - Samuel von Pufendorf Gymnasium FlÃ¶ha</title>
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
            setLastUpdated={setLastUpdated}
          />
        )}

        {currentPage === 'collection' && (
          <CollectionPage 
            minerals={minerals}
            setMinerals={setMinerals}
            loading={loading}
            setLoading={setLoading}
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
            setFilterOptions={setFilterOptions}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
            selectedMineral={selectedMineral}
            setSelectedMineral={setSelectedMineral}
            showMineralModal={showMineralModal}
            setShowMineralModal={setShowMineralModal}
            isAuthenticated={isAuthenticated}
            editMode={editMode}
            setEditMode={setEditMode}
            editFormData={editFormData}
            setEditFormData={setEditFormData}
            editImage={editImage}
            setEditImage={setEditImage}
            shelves={shelves}
            loadStats={loadStats}
          />
        )}

        {currentPage === 'vitrines' && (
          <VitrinesPage 
            showcases={showcases}
            setShowcases={setShowcases}
            loading={loading}
            setLoading={setLoading}
            isAuthenticated={isAuthenticated}
            selectedShowcase={selectedShowcase}
            setSelectedShowcase={setSelectedShowcase}
            showShowcaseModal={showShowcaseModal}
            setShowShowcaseModal={setShowShowcaseModal}
            showVitrineForm={showVitrineForm}
            setShowVitrineForm={setShowVitrineForm}
            showShelfForm={showShelfForm}
            setShowShelfForm={setShowShelfForm}
            selectedShelf={selectedShelf}
            setSelectedShelf={setSelectedShelf}
            shelfMinerals={shelfMinerals}
            setShelfMinerals={setShelfMinerals}
            showShelfMineralsModal={showShelfMineralsModal}
            setShowShelfMineralsModal={setShowShelfMineralsModal}
            editMode={editMode}
            setEditMode={setEditMode}
            editFormData={editFormData}
            setEditFormData={setEditFormData}
            editImage={editImage}
            setEditImage={setEditImage}
            selectedMineral={selectedMineral}
            setSelectedMineral={setSelectedMineral}
            showMineralModal={showMineralModal}
            setShowMineralModal={setShowMineralModal}
            shelves={shelves}
            loadStats={loadStats}
          />
        )}

        {currentPage === 'admin' && isAuthenticated && (
          <AdminPage 
            isAuthenticated={isAuthenticated}
            onSuccess={() => {
              loadStats();
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
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          onClose={() => setShowPasswordModal(false)}
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
          setLoading={setLoading}
          onClose={() => {
            setEditMode(null);
            setEditImage(null);
          }}
          setEditMode={setEditMode}
          setSelectedMineral={setSelectedMineral}
          setShowMineralModal={setShowMineralModal}
          setSelectedShowcase={setSelectedShowcase}
          setShowShelfMineralsModal={setShowShelfMineralsModal}
          setSelectedShelf={setSelectedShelf}
          currentPage={currentPage}
          setMinerals={setMinerals}
          setShowcases={setShowcases}
          loadStats={loadStats}
        />
      )}
    </>
  );
}