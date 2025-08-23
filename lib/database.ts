import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'mineralien.db');

class Database {
    private db: sqlite3.Database | null = null;

    constructor() {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Fehler beim Öffnen der Datenbank:', err);
            } else {
                console.log('Verbindung zur SQLite-Datenbank hergestellt');
            }
        });
    }

    query(sql: string, params: any[] = []): Promise<any[]> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Datenbankverbindung nicht verfügbar'));
                return;
            }

            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    get(sql: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Datenbankverbindung nicht verfügbar'));
                return;
            }

            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    run(sql: string, params: any[] = []): Promise<{ id?: number; changes: number }> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Datenbankverbindung nicht verfügbar'));
                return;
            }

            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    close(): void {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Fehler beim Schließen der Datenbank:', err);
                } else {
                    console.log('Datenbankverbindung geschlossen');
                }
            });
        }
    }
}

const database = new Database();
export default database;