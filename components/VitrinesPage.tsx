import React, { useEffect, useState } from 'react';
import { Showcase } from '../types';

interface VitrinesPageProps {
  isAuthenticated: boolean;
  onOpenShowcaseDetails: (id: number) => void;
  setShowVitrineForm: (show: boolean) => void;
}

export default function VitrinesPage({ 
  isAuthenticated, 
  onOpenShowcaseDetails, 
  setShowVitrineForm 
}: VitrinesPageProps) {
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadShowcases();
  }, []);

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

  return (
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
                onClick={() => onOpenShowcaseDetails(showcase.id)}
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
  );
}