const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Erstelle uploads Ordner falls nicht vorhanden
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const db = new sqlite3.Database('mineralien.db');

// Erstelle Tabellen
db.serialize(() => {
    // Showcases (Vitrinen) Tabelle
    db.run(`
        CREATE TABLE IF NOT EXISTS showcases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT UNIQUE NOT NULL,
            location TEXT,
            description TEXT,
            image_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Shelves (Regale) Tabelle
    db.run(`
        CREATE TABLE IF NOT EXISTS shelves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT NOT NULL,
            showcase_id INTEGER NOT NULL,
            description TEXT,
            position_order INTEGER DEFAULT 0,
            image_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (showcase_id) REFERENCES showcases (id) ON DELETE CASCADE,
            UNIQUE(showcase_id, code)
        )
    `);

    // Minerals (Mineralien) Tabelle
    db.run(`
        CREATE TABLE IF NOT EXISTS minerals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            number TEXT UNIQUE NOT NULL,
            color TEXT,
            description TEXT,
            location TEXT,
            purchase_location TEXT,
            rock_type TEXT,
            shelf_id INTEGER,
            image_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (shelf_id) REFERENCES shelves (id) ON DELETE SET NULL
        )
    `);

    // Admin User Tabelle
    db.run(`
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Standard Admin-Passwort erstellen (admin123)
    const defaultPassword = 'admin123';
    bcrypt.hash(defaultPassword, 10, (err, hash) => {
        if (err) {
            console.error('Fehler beim Hashen des Passworts:', err);
            return;
        }

        db.run(
            'INSERT OR REPLACE INTO admin_users (id, password_hash) VALUES (1, ?)',
            [hash],
            function(err) {
                if (err) {
                    console.error('Fehler beim Einfügen des Admin-Benutzers:', err);
                } else {
                    console.log('Standard-Admin-Benutzer erstellt. Passwort: admin123');
                }
            }
        );
    });

    // Beispiel-Daten einfügen
    db.run(`
        INSERT OR IGNORE INTO showcases (name, code, location, description) 
        VALUES ('Hauptvitrine', 'V01', 'Wohnzimmer', 'Die zentrale Vitrine mit den wertvollsten Stücken')
    `);

    db.run(`
        INSERT OR IGNORE INTO shelves (name, code, showcase_id, description, position_order) 
        VALUES ('Oberstes Regal', '01', 1, 'Regal für besondere Kristalle', 1)
    `);
});

db.close((err) => {
    if (err) {
        console.error('Fehler beim Schließen der Datenbank:', err);
    } else {
        console.log('Datenbank erfolgreich initialisiert!');
        console.log('Führen Sie "npm run dev" aus, um den Server zu starten.');
    }
});