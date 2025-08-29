import React, { useEffect, useState } from 'react';
import { Stats } from '../types';

interface AdminPageProps {
  isAuthenticated: boolean;
  onSuccess: () => void;
}

interface MineralFormData {
  name: string;
  number: string;
  color: string;
  description: string;
  location: string;
  purchase_location: string;
  rock_type: string;
  shelf_id: string;
}

interface ShelfOption {
  id: number;
  name: string;
  showcase_name: string;
  full_code: string;
}

export default function AdminPage({ isAuthenticated, onSuccess }: AdminPageProps) {
  if (!isAuthenticated) {
    return (
      <section className="page active">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Zugriff verweigert</h1>
            <p className="page-description">Sie müssen angemeldet sein, um diese Seite zu sehen.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page active">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Verwaltung</h1>
          <p className="page-description">Neue Mineralien zur Sammlung hinzufügen</p>
        </div>
        
        <div className="admin-form-container">
          <MineralForm onSuccess={onSuccess} />
        </div>
      </div>
    </section>
  );
}

// Mineral Form Component
function MineralForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState<MineralFormData>({
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
  const [shelves, setShelves] = useState<ShelfOption[]>([]);
  
  // States für die Nummer-Validierung
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
                Diese Nummer existiert bereits
              </span>
            )}
            {!checkingNumber && formData.number.trim() && !numberExists && (
              <span className="success-indicator">
                Nummer verfügbar
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