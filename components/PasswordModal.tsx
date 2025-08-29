import React from 'react';

interface PasswordModalProps {
  password: string;
  setPassword: (password: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  onClose: () => void;
}

export default function PasswordModal({ password, setPassword, isAuthenticated, setIsAuthenticated, onClose }: PasswordModalProps) {
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        setIsAuthenticated(true);
        onClose();
        setPassword('');
      } else {
        alert('Falsches Passwort');
      }
    } catch (error) {
      console.error('Login-Fehler:', error);
    }
  };

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>Admin-Zugang</h2>
        <form onSubmit={handleLogin}>
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