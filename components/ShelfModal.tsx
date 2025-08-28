import React from 'react';
import { Mineral } from '../types';

interface ShelfModalProps {
  shelf: any;
  minerals: Mineral[];
  loading: boolean;
  isAuthenticated: boolean;
  onClose: () => void;
  onEdit: (shelf: any) => void;
  onDelete: (type: 'shelf', id: number) => void;
  onOpenMineralDetails: (id: number) => void;
  setShowShelfMineralsModal: (show: boolean) => void;
}

export default function ShelfModal({ 
  shelf, 
  minerals, 
  loading, 
  isAuthenticated, 
  onClose, 
  onEdit, 
  onDelete, 
  onOpenMineralDetails,
  setShowShelfMineralsModal 
}: ShelfModalProps) {
  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content shelf-minerals-modal">
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>Regal: {shelf.shelf_name}</h2>
        <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-6)' }}>
          {shelf.showcase_name} - {shelf.full_code}
        </p>

        {isAuthenticated && (
          <div className="admin-buttons">
            <button 
              className="btn btn-secondary"
              onClick={() => onEdit(shelf)}
            >
              ✏️ Bearbeiten
            </button>
            <button 
              className="btn error-btn"
              onClick={() => onDelete('shelf', shelf.id)}
            >
              🗑️ Löschen
            </button>
          </div>
        )}
        
        {shelf.image_path && (
          <div className="detail-image" style={{ marginBottom: 'var(--space-6)' }}>
            <img src={`/uploads/${shelf.image_path}`} alt={shelf.shelf_name} />
          </div>
        )}
        
        <h3 style={{ marginBottom: 'var(--space-4)' }}>
          Mineralien in diesem Regal ({minerals.length})
        </h3>
        
        {loading ? (
          <div className="loading">Lade Mineralien...</div>
        ) : minerals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--gray-500)' }}>
            <p>🗳️ Dieses Regal ist noch leer</p>
            <p>Keine Mineralien zugeordnet</p>
          </div>
        ) : (
          <div className="shelf-minerals-grid">
            {minerals.map(mineral => (
              <div 
                key={mineral.id} 
                className="mineral-card-small" 
                onClick={() => {
                  setShowShelfMineralsModal(false);
                  onOpenMineralDetails(mineral.id);
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
  );
}