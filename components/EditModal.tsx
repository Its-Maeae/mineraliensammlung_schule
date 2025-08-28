import React from 'react';

interface EditModalProps {
  editMode: 'mineral' | 'showcase' | 'shelf';
  formData: any;
  setFormData: (data: any) => void;
  image: File | null;
  setImage: (image: File | null) => void;
  shelves: any[];
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function EditModal({ 
  editMode, 
  formData, 
  setFormData, 
  image, 
  setImage, 
  shelves, 
  loading, 
  onSubmit, 
  onClose 
}: EditModalProps) {
  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>
          {editMode === 'mineral' ? 'Mineral bearbeiten' : 
          editMode === 'showcase' ? 'Vitrine bearbeiten' : 
          'Regal bearbeiten'}
        </h2>
        
        <form onSubmit={onSubmit}>
          {editMode === 'mineral' && (
            <>
              <div className="form-group">
                <label>Name des Minerals</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Steinnummer</label>
                <input
                  type="text"
                  value={formData.number || ''}
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Farbe</label>
                <input
                  type="text"
                  value={formData.color || ''}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Beschreibung</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Fundort</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Kaufort</label>
                <input
                  type="text"
                  value={formData.purchase_location || ''}
                  onChange={(e) => setFormData({...formData, purchase_location: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Gesteinsart</label>
                <input
                  type="text"
                  value={formData.rock_type || ''}
                  onChange={(e) => setFormData({...formData, rock_type: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Regal</label>
                <select
                  value={formData.shelf_id || ''}
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
            </>
          )}

          {editMode === 'showcase' && (
            <>
              <div className="form-group">
                <label>Name der Vitrine</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Vitrine-Code</label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Standort</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Beschreibung</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                />
              </div>
            </>
          )}

          {editMode === 'shelf' && (
            <>
              <div className="form-group">
                <label>Name des Regals</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Regal-Code</label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Beschreibung</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Position/Reihenfolge</label>
                <input
                  type="number"
                  value={formData.position_order || 0}
                  onChange={(e) => setFormData({...formData, position_order: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Bild ersetzen (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
            {image && (
              <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                Neues Bild: {image.name}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
            >
              Abbrechen
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Wird gespeichert...' : 'Änderungen speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}