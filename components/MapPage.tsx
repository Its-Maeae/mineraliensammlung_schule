import React, { useState, useEffect, useRef } from 'react';
import { Mineral } from '../types';
import MineralModal from './MineralModal';

interface MapPageProps {
  isAuthenticated: boolean;
  selectedMineral: Mineral | null;
  setSelectedMineral: (mineral: Mineral | null) => void;
  showMineralModal: boolean;
  setShowMineralModal: (show: boolean) => void;
  editMode: 'mineral' | 'showcase' | 'shelf' | null;
  setEditMode: (mode: 'mineral' | 'showcase' | 'shelf' | null) => void;
  editFormData: any;
  setEditFormData: (data: any) => void;
  editImage: File | null;
  setEditImage: (image: File | null) => void;
  shelves: any[];
  loadStats: () => void;
  setMinerals: (minerals: Mineral[]) => void;
  currentPage: string; // Hinzugefügt um Page-Wechsel zu erkennen
}

// Global variable to track Leaflet loading state
declare global {
  interface Window {
    L: any;
    openMineralDetails: (id: number) => Promise<void>;
  }
}

export default function MapPage({
  isAuthenticated,
  selectedMineral,
  setSelectedMineral,
  showMineralModal,
  setShowMineralModal,
  editMode,
  setEditMode,
  editFormData,
  setEditFormData,
  editImage,
  setEditImage,
  shelves,
  loadStats,
  setMinerals,
  currentPage
}: MapPageProps) {
  const [minerals, setMineralsLocal] = useState<Mineral[]>([]);
  const [loading, setLoading] = useState(true);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const isMapVisible = currentPage === 'map';

  // Check if Leaflet is already loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && window.L) {
      setLeafletLoaded(true);
    } else {
      loadLeaflet();
    }
  }, []);

  // Mineralien einmalig laden
  useEffect(() => {
    const loadMinerals = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/minerals');
        if (response.ok) {
          const data = await response.json();
          const mineralsWithCoords = data.filter((mineral: Mineral) => 
            mineral.latitude && mineral.longitude
          );
          setMineralsLocal(mineralsWithCoords);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Mineralien:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMinerals();
  }, []);

  // Map initialisieren wenn die Page sichtbar wird
  useEffect(() => {
    if (isMapVisible && leafletLoaded && mapRef.current && !loading) {
      // Kurze Verzögerung um sicherzustellen dass DOM bereit ist
      const timer = setTimeout(() => {
        initializeMap();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isMapVisible, leafletLoaded, loading]);

  // Map aufräumen wenn Page nicht mehr sichtbar
  useEffect(() => {
    if (!isMapVisible && mapInstance.current) {
      cleanupMap();
    }
  }, [isMapVisible]);

  // Marker aktualisieren wenn Mineralien geladen sind und Map existiert
  useEffect(() => {
    if (mapInstance.current && minerals.length > 0 && isMapVisible) {
      updateMarkers();
    }
  }, [minerals, isMapVisible]);

  const loadLeaflet = () => {
    // Prevent multiple loading attempts
    if (leafletLoaded || typeof window === 'undefined') return;

    // CSS laden (falls noch nicht vorhanden)
    if (!document.querySelector('link[href*="leaflet"]')) {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      cssLink.crossOrigin = '';
      document.head.appendChild(cssLink);
    }

    // JavaScript laden
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => {
        setLeafletLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Leaflet');
        setLoading(false);
      };
      document.head.appendChild(script);
    }
  };

  const cleanupMap = () => {
    try {
      // Marker entfernen
      markersRef.current.forEach(marker => {
        if (mapInstance.current) {
          mapInstance.current.removeLayer(marker);
        }
      });
      markersRef.current = [];

      // Map instance entfernen
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    } catch (error) {
      console.error('Error cleaning up map:', error);
    }
  };

  const initializeMap = () => {
    // Cleanup bestehende Map
    cleanupMap();

    if (!mapRef.current || !window.L) return;

    try {
      // Stelle sicher dass das Container-Element die richtige Größe hat
      if (mapRef.current) {
        mapRef.current.style.height = '100vh';
        mapRef.current.style.width = '100%';
      }

      const map = window.L.map(mapRef.current, {
        center: [51.1657, 10.4515], // Deutschland Zentrum
        zoom: 6,
        zoomControl: true,
        attributionControl: true,
        preferCanvas: false
      });

      // OpenStreetMap Tiles hinzufügen
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstance.current = map;
      
      // Force resize after short delay
      setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.invalidateSize();
          updateMarkers();
        }
      }, 200);
      
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const updateMarkers = () => {
    if (!mapInstance.current || !window.L || minerals.length === 0) return;

    try {
      // Alte Marker entfernen
      markersRef.current.forEach(marker => {
        if (mapInstance.current) {
          mapInstance.current.removeLayer(marker);
        }
      });
      markersRef.current = [];

      // Neue Marker erstellen
      minerals.forEach(mineral => {
        if (mineral.latitude && mineral.longitude) {
          // Custom Icon erstellen basierend auf der Farbe
          const iconColor = getColorForMineral(mineral.color);
          const customIcon = window.L.divIcon({
            className: 'custom-mineral-marker',
            html: `<div style="
              width: 20px; 
              height: 20px; 
              background-color: ${iconColor}; 
              border: 2px solid white; 
              border-radius: 50%; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
            ">💎</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          const marker = window.L.marker([mineral.latitude, mineral.longitude], {
            icon: customIcon
          }).addTo(mapInstance.current);

          // Popup mit Mineral-Informationen
          const popupContent = `
            <div style="padding: 10px; max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px;">${mineral.name}</h3>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Nummer:</strong> ${mineral.number}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Farbe:</strong> ${mineral.color || 'Nicht angegeben'}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Fundort:</strong> ${mineral.location || 'Unbekannt'}</p>
              <button 
                onclick="window.openMineralDetails(${mineral.id})" 
                style="margin-top: 8px; padding: 6px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
              >
                Details anzeigen
              </button>
            </div>
          `;

          marker.bindPopup(popupContent);
          markersRef.current.push(marker);
        }
      });

      // Globale Funktion für Popup-Button
      window.openMineralDetails = async (id: number) => {
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
    } catch (error) {
      console.error('Error updating markers:', error);
    }
  };

  const getColorForMineral = (color?: string) => {
    const colorMap: { [key: string]: string } = {
      'rot': '#ff4444',
      'blau': '#4444ff',
      'grün': '#44ff44',
      'gelb': '#ffff44',
      'schwarz': '#444444',
      'weiß': '#ffffff',
      'braun': '#8b4513',
      'violett': '#8b44ff',
      'grau': '#888888'
    };
    
    return colorMap[color?.toLowerCase() || ''] || '#666666';
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
      shelf_id: mineral.shelf_id || '',
      latitude: mineral.latitude || null,
      longitude: mineral.longitude || null
    });
    setEditMode('mineral');
    setEditImage(null);
  };

  const handleDelete = async (type: 'mineral', id: number) => {
    if (!confirm('Möchten Sie dieses Mineral wirklich löschen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/minerals/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShowMineralModal(false);
        setSelectedMineral(null);
        
        // Mineralien neu laden
        const mineralsResponse = await fetch('/api/minerals');
        if (mineralsResponse.ok) {
          const data = await mineralsResponse.json();
          const mineralsWithCoords = data.filter((mineral: Mineral) => 
            mineral.latitude && mineral.longitude
          );
          setMineralsLocal(mineralsWithCoords);
          setMinerals(data);
        }
        
        loadStats();
        alert('Mineral erfolgreich gelöscht!');
      } else {
        const responseData = await response.text();
        alert('Fehler beim Löschen: ' + responseData);
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert('Fehler beim Löschen. Bitte versuchen Sie es erneut.');
    }
  };

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, []);

  if (loading) {
    return (
      <section className="page active">
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            fontSize: '18px',
            color: '#666'
          }}>
            Lade Karte und Mineralien...
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="page active">
        <div className="container" style={{ height: '100vh', padding: 0, position: 'relative' }}>
          <div style={{ 
            position: 'absolute', 
            top: '20px', 
            left: '20px', 
            zIndex: 1000, 
            background: 'white', 
            padding: '15px', 
            borderRadius: '8px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            maxWidth: '300px'
          }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Fundorte der Mineralien</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              {minerals.length} Mineralien mit Koordinaten gefunden
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
              Powered by OpenStreetMap
            </p>
          </div>
          
          <div 
            ref={mapRef} 
            style={{ 
              width: '100px', 
              height: '100px',
              borderRadius: '0',
              zIndex: 1
            }}
          />
          
          {(!leafletLoaded || !mapInstance.current) && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 1001,
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '18px', color: '#666' }}>
                OpenStreetMap wird geladen...
              </div>
            </div>
          )}
        </div>
      </section>

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