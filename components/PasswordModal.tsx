import React from 'react';

interface PasswordModalProps {
  password: string;
  setPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function PasswordModal({ password, setPassword, onSubmit, onClose }: PasswordModalProps) {
  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>Admin-Zugang</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="password">Passwort</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin-Passwort eingeben"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-large">
            Anmelden
          </button>
        </form>
      </div>
    </div>
  );
}