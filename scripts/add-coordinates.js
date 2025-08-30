const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mineralien.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Füge Koordinaten-Felder zur minerals Tabelle hinzu...');
    
    db.run(`
        ALTER TABLE minerals 
        ADD COLUMN latitude REAL
    `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Fehler beim Hinzufügen der latitude Spalte:', err);
        } else {
            console.log('Latitude Spalte hinzugefügt (oder existiert bereits)');
        }
    });

    db.run(`
        ALTER TABLE minerals 
        ADD COLUMN longitude REAL
    `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Fehler beim Hinzufügen der longitude Spalte:', err);
        } else {
            console.log('Longitude Spalte hinzugefügt (oder existiert bereits)');
        }
    });
});

db.close((err) => {
    if (err) {
        console.error('Fehler beim Schließen der Datenbank:', err);
    } else {
        console.log('Migration abgeschlossen!');
    }
});
