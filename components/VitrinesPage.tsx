import React, { useEffect } from 'react';
import { Showcase, Mineral } from '../types';
import ShowcaseModal from './ShowcaseModal';
import ShelfModal from './ShelfModal';
import VitrineFormModal from './VitrineFormModal';
import ShelfFormModal from './ShelfFormModal';
import MineralModal from './MineralModal';

interface VitrinesPageProps {
  showcases: Showcase[];
  setShowcases: (showcases: Showcase[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  isAuthenticated: boolean;
  selectedShowcase: Showcase | null;
  setSelectedShowcase: (showcase: Showcase | null) => void;
  showShowcaseModal: boolean;
  setShowShowcaseModal: (show: boolean) => void;
  showVitrineForm: boolean;
  setShowVitrineForm: (show: boolean) => void;
  showShelfForm: boolean;
  setShowShelfForm: (show: boolean) => void;
  selectedShelf: any;
  setSelectedShelf: (shelf: any) => void;
  shelfMinerals: Mineral[];
  setShelfMinerals: (minerals: Mineral[]) => void;
  showShelfMineralsModal: boolean;
  setShowShelfMineralsModal: (show: boolean) => void;
  editMode: 'mineral' | 'showcase' | 'shelf' | null;
  setEditMode: (mode: 'mineral' | 'showcase' | 'shelf' | null) => void;
  editFormData: any;
  setEditFormData: (data: any) => void;
  editImage: File | null;
  setEditImage: (image: File | null) => void;
  selectedMineral: Mineral | null;
  setSelectedMineral: (mineral: Mineral | null) => void;
  showMineralModal: boolean;
  setShowMineralModal: (show: boolean) => void;
  shelves: any[];
  loadStats: () => void;
}

export default function VitrinesPage({ 
  showcases,
  setShowcases,
  loading,
  setLoading,
  isAuthenticated,
  selectedShowcase,
  setSelectedShowcase,
  showShowcaseModal,
  setShowShowcaseModal,
  showVitrineForm,
  setShowVitrineForm,
  showShelfForm,
  setShowShelfForm,
  selectedShelf,
  setSelectedShelf,
  shelfMinerals,
  setShelfMinerals,
  showShelfMineralsModal,
  setShowShelfMineralsModal,
  editMode,
  setEditMode,
  editFormData,
  setEditFormData,
  editImage,
  setEditImage,
  selectedMineral,
  setSelectedMineral,
  showMineralModal,
  setShowMineralModal,
  shelves,
  loadStats
}: VitrinesPageProps) {

  // Form data states
  const [vitrineFormData, setVitrineFormData] = React.useState({
    name: '',
    code: '',
    location: '',
    description: ''
  });
  const [vitrineImage, setVitrineImage] = React.useState<File | null>(null);
  const [shelfFormData, setShelfFormData] = React.useState({
    name: '',
    code: '',
    description: '',
    position_order: 0
  });
  const [shelfImage, setShelfImage] = React.useState<File | null>(null);

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
        
        if (type === 'showcase') {
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

  useEffect(() => {
    loadShowcases();
  }, []);

  return (
    <>
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
                <h3>🛏 Noch keine Vitrinen vorhanden</h3>
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
                      <div className="placeholder">🛏</div>
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

      {showMineralModal && selectedMineral && (
        <MineralModal 
          mineral={selectedMineral}
          isAuthenticated={isAuthenticated}
          onClose={() => setShowMineralModal(false)}
          onEdit={handleEditMineral}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}