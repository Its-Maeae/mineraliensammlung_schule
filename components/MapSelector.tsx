import React, { useEffect, useRef, useState } from 'react';

interface MapSelectorProps {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function MapSelector({ latitude, longitude, onLocationSelect }: MapSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Leaflet CSS und JS laden
  useEffect(() => {
    const loadLeaflet = () => {
      // CSS laden (falls noch nicht vorhanden)
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

  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstance.current && window.L) {
      initializeMap();
    }
  }, [mapLoaded]);

  useEffect(() => {
    if (mapInstance.current && latitude && longitude) {
      updateMarker(latitude, longitude);
    }
  }, [latitude, longitude]);

  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;

    const map = window.L.map(mapRef.current).setView(
      latitude && longitude 
        ? [latitude, longitude]
        : [51.1657, 10.4515], // Deutschland Zentrum
      8
    );

    // OpenStreetMap Tiles hinzufügen
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    mapInstance.current = map;

    // Click Listener für Marker setzen
    map.on('click', (event: any) => {
      const lat = event.latlng.lat;
      const lng = event.latlng.lng;
      updateMarker(lat, lng);
      onLocationSelect(lat, lng);
    });

    // Initialen Marker setzen falls Koordinaten vorhanden
    if (latitude && longitude) {
      updateMarker(latitude, longitude);
    }
  };

  const updateMarker = (lat: number, lng: number) => {
    if (!mapInstance.current || !window.L) return;

    // Alten Marker entfernen
    if (markerRef.current) {
      mapInstance.current.removeLayer(markerRef.current);
    }

    // Neuen Marker erstellen
    const marker = window.L.marker([lat, lng], {
      draggable: true
    }).addTo(mapInstance.current);

    // Popup für den Marker
    marker.bindPopup(`
      <div style="text-align: center;">
        <strong>Fundort</strong><br>
        <small>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}</small>
      </div>
    `);

    // Drag Event Listener für Marker
    marker.on('dragend', (event: any) => {
      const newLat = event.target.getLatLng().lat;
      const newLng = event.target.getLatLng().lng;
      
      // Popup aktualisieren
      marker.setPopupContent(`
        <div style="text-align: center;">
          <strong>Fundort</strong><br>
          <small>Lat: ${newLat.toFixed(6)}<br>Lng: ${newLng.toFixed(6)}</small>
        </div>
      `);
      
      onLocationSelect(newLat, newLng);
    });

    markerRef.current = marker;

    // Karte auf Marker zentrieren
    mapInstance.current.setView([lat, lng], mapInstance.current.getZoom());
  };

  const clearLocation = () => {
    if (markerRef.current && mapInstance.current) {
      mapInstance.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    onLocationSelect(0, 0); // Signalisiert das Löschen der Koordinaten
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ width: '100%', height: '300px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '4px' }} />
        {!mapLoaded && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: '#666',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: '#f5f5f5',
            borderRadius: '4px'
          }}>
            Karte wird geladen...
          </div>
        )}
      </div>
      
      {mapLoaded && (
        <div style={{ 
          marginTop: '8px', 
          display: 'flex', 
          gap: '8px', 
          alignItems: 'center',
          fontSize: '12px',
          color: '#666'
        }}>
          <span>💡 Tipp: Klicken Sie auf die Karte oder ziehen Sie den Marker</span>
          {latitude && longitude && (
            <button
              type="button"
              onClick={clearLocation}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Position löschen
            </button>
          )}
        </div>
      )}
    </div>
  );
}