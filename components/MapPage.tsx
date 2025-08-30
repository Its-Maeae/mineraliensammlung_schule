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
  setMinerals
}: MapPageProps) {
  const [minerals, setMineralsLocal] = useState<Mineral[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Leaflet CSS und JS laden
  useEffect(() => {
    const loadLeaflet = () => {
      // CSS laden
      if (!document.querySelector('link[href*="leaflet.css"]')) {
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
          setMapLoaded(true);
        };
        document.head.appendChild(script);
      } else {
        setMapLoaded(true);
      }
    };

    loadLeaflet();
  }, []);

  // Mineralien laden
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

  // Karte initialisieren - jedes Mal wenn die Komponente gemountet wird
  useEffect(() => {
    if (mapLoaded && mapRef.current && window.L) {
      // Alte Karte cleanup falls vorhanden
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      initializeMap();
    }
  }, [mapLoaded]);

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      markersRef.current = [];
    };
  }, []);

  // Marker aktualisieren wenn sich Mineralien ändern
  useEffect(() => {
    if (mapInstance.current && minerals.length > 0) {
      updateMarkers();
    }
  }, [minerals]);

  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;

    const map = window.L.map(mapRef.current).setView([51.1657, 10.4515], 6); // Deutschland Zentrum

    // OpenStreetMap Tiles hinzufügen
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    mapInstance.current = map;
    updateMarkers();
  };

  const updateMarkers = () => {
    if (!mapInstance.current || !window.L) return;

    // Alte Marker entfernen
    markersRef.current.forEach(marker => mapInstance.current.removeLayer(marker));
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
    (window as any).openMineralDetails = async (id: number) => {
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

  if (loading) {
    return (
      <section className="page active">
        <div className="container">
          <div className="loading">Lade Karte...</div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="page active">
        <div className="container" style={{ height: '100vh', padding: 0, position: 'relative' }}>
          <div 
            ref={mapRef} 
            style={{ 
              width: '100%', 
              height: '100vh',
              borderRadius: '0'
            }}
          />
          
          {/* Info-Overlay - jetzt weiter unten positioniert */}
          <div style={{ 
            position: 'absolute', 
            bottom: '20px', 
            left: '20px', 
            zIndex: 1000, 
            background: 'rgba(255, 255, 255, 0.95)', 
            padding: '15px', 
            borderRadius: '8px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            maxWidth: '300px',
            backdropFilter: 'blur(5px)'
          }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Fundorte der Mineralien</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              {minerals.length} Mineralien mit Koordinaten gefunden
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
              Powered by OpenStreetMap
            </p>
          </div>
          
          {!mapLoaded && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 1001,
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div className="loading">OpenStreetMap wird geladen...</div>
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