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
    console.log('Erstelle Tabellen...');
    
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
    `, (err) => {
        if (err) console.error('Fehler bei showcases Tabelle:', err);
        else console.log('Showcases Tabelle erstellt');
    });

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
    `, (err) => {
        if (err) console.error('Fehler bei shelves Tabelle:', err);
        else console.log('Shelves Tabelle erstellt');
    });

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
    `, (err) => {
        if (err) console.error('Fehler bei minerals Tabelle:', err);
        else console.log('Minerals Tabelle erstellt');
    });

    // Admin User Tabelle
    db.run(`
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Fehler bei admin_users Tabelle:', err);
            return;
        }
        console.log('Admin_users Tabelle erstellt');

        // Prüfe ob bereits ein Admin existiert
        db.get('SELECT COUNT(*) as count FROM admin_users', (err, row) => {
            if (err) {
                console.error('Fehler beim Prüfen vorhandener Admin-User:', err);
                return;
            }

            if (row.count > 0) {
                console.log('Admin-User bereits vorhanden, überspringe Erstellung');
                return;
            }

            // Standard Admin-Passwort erstellen (admin123)
            const defaultPassword = 'admin123';
            console.log('Erstelle Admin-User...');
            
            bcrypt.hash(defaultPassword, 10, (err, hash) => {
                if (err) {
                    console.error('Fehler beim Hashen des Passworts:', err);
                    return;
                }

                console.log('Passwort gehasht, füge Admin-User ein...');
                
                db.run(
                    'INSERT INTO admin_users (password_hash) VALUES (?)',
                    [hash],
                    function(err) {
                        if (err) {
                            console.error('Fehler beim Einfügen des Admin-Benutzers:', err);
                        } else {
                            console.log('✅ Standard-Admin-Benutzer erfolgreich erstellt!');
                            console.log('   Passwort: admin123');
                            console.log('   User ID:', this.lastID);
                        }
                    }
                );
            });
        });
    });

    // Beispiel-Daten einfügen
    db.run(`
        INSERT OR IGNORE INTO showcases (name, code, location, description) 
        VALUES ('Hauptvitrine', 'V01', 'Wohnzimmer', 'Die zentrale Vitrine mit den wertvollsten Stücken')
    `, (err) => {
        if (err) console.error('Fehler bei Beispiel-Showcase:', err);
        else console.log('Beispiel-Showcase erstellt');
    });

    db.run(`
        INSERT OR IGNORE INTO shelves (name, code, showcase_id, description, position_order) 
        VALUES ('Oberstes Regal', '01', 1, 'Regal für besondere Kristalle', 1)
    `, (err) => {
        if (err) console.error('Fehler bei Beispiel-Shelf:', err);
        else console.log('Beispiel-Shelf erstellt');
    });
});

// Warte kurz und schließe dann die Datenbank
setTimeout(() => {
    db.close((err) => {
        if (err) {
            console.error('Fehler beim Schließen der Datenbank:', err);
        } else {
            console.log('\n🎉 Datenbank erfolgreich initialisiert!');
            console.log('Führen Sie "npm run dev" aus, um den Server zu starten.');
        }
    });
}, 1000); // 1 Sekunde warten, damit alle async Operationen abgeschlossen sind