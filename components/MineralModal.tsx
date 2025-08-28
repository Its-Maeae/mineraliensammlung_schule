import React from 'react';
import { Mineral } from '../types';

interface MineralModalProps {
  mineral: Mineral;
  isAuthenticated: boolean;
  onClose: () => void;
  onEdit: (mineral: Mineral) => void;
  onDelete: (type: 'mineral', id: number) => void;
}

export default function MineralModal({ mineral, isAuthenticated, onClose, onEdit, onDelete }: MineralModalProps) {
  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>{mineral.name}</h2>
        
        {mineral.image_path && (
          <div className="detail-image">
            <img src={`/uploads/${mineral.image_path}`} alt={mineral.name} />
          </div>
        )}
        
        <div className="detail-info">
          <div className="detail-item">
            <span className="detail-label">Steinnummer:</span>
            <span className="detail-value">{mineral.number}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Farbe:</span>
            <span className="detail-value">{mineral.color || 'Nicht angegeben'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Fundort:</span>
            <span className="detail-value">{mineral.location || 'Unbekannt'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Kaufort:</span>
            <span className="detail-value">{mineral.purchase_location || 'Nicht angegeben'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Gesteinsart:</span>
            <span className="detail-value">{mineral.rock_type || 'Nicht angegeben'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Regal:</span>
            <span className="detail-value">
              {mineral.shelf_code 
                ? `${mineral.showcase_code}-${mineral.shelf_code}` 
                : 'Nicht zugeordnet'
              }
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Hinzugefügt:</span>
            <span className="detail-value">
              {new Date(mineral.created_at).toLocaleDateString('de-DE')}
            </span>
          </div>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Beschreibung</h3>
          <p style={{ marginTop: '10px', color: '#555', lineHeight: '1.6' }}>
            {mineral.description || 'Keine Beschreibung verfügbar.'}
          </p>
        </div>

        {isAuthenticated && (
          <div className="admin-buttons">
            <button 
              className="btn btn-secondary"
              onClick={() => onEdit(mineral)}
            >
              ✏️ Bearbeiten
            </button>
            <button 
              className="btn error-btn"
              onClick={() => onDelete('mineral', mineral.id)}
            >
              🗑️ Löschen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}