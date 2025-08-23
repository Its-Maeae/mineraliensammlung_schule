# Mineraliensammlung - Next.js Web App

Eine moderne Webanwendung zur Verwaltung einer privaten Mineraliensammlung, entwickelt mit Next.js, TypeScript und SQLite.

## Features

- 🔍 **Intelligente Suche** - Suchen nach Namen, Steinnummer oder Eigenschaften
- 🎯 **Präzise Filter** - Filtern nach Farbe, Fundort, Gesteinsart
- 📊 **Detaillierte Dokumentation** - Wissenschaftliche Katalogisierung mit Bildern
- 🛏️ **Vitrinen-Verwaltung** - Organisation in thematischen Vitrinen und Regalen
- 🔒 **Admin-Panel** - Passwortgeschützter Bereich für Verwaltung
- 📱 **Responsive Design** - Optimiert für alle Geräte

## Installation

### Voraussetzungen

- Node.js (Version 16 oder höher)
- npm oder yarn

### Setup

1. **Repository klonen/Dateien erstellen**
   ```bash
   mkdir mineraliensammlung
   cd mineraliensammlung
   ```

2. **Dependencies installieren**
   ```bash
   npm install
   ```

3. **Datenbank initialisieren**
   ```bash
   npm run init-db
   ```

4. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

5. **Anwendung öffnen**
   
   Die Anwendung ist verfügbar unter: `http://localhost:8085`

## Standard-Zugangsdaten

- **Admin-Passwort**: `admin123`

⚠️ **Wichtig**: Ändern Sie das Standard-Passwort nach der ersten Anmeldung!

## Verwendung

### Mineralien hinzufügen

1. Navigieren Sie zum "Verwaltung"-Tab
2. Geben Sie das Admin-Passwort ein
3. Füllen Sie das Formular mit den Mineral-Informationen aus:
   - Name des Minerals (z.B. Quarz, Pyrit, Amethyst)
   - Eindeutige Steinnummer
   - Farbe
   - Detaillierte Beschreibung
   - Fundort (geographische Herkunft)
   - Kaufort
   - Gesteinsart (magmatisch, sedimentär, metamorph)
   - Regal-Zuordnung (optional)
   - Bild hochladen (optional, max. 40MB)

### Vitrinen und Regale verwalten

1. **Neue Vitrine erstellen**:
   - Gehen Sie zum "Vitrinen"-Tab
   - Klicken Sie auf "Neue Vitrine hinzufügen" (nur als Admin)
   - Geben Sie Name, Code, Standort und Beschreibung ein

2. **Regale hinzufügen**:
   - Öffnen Sie eine Vitrine
   - Klicken Sie auf "Neues Regal hinzufügen"
   - Füllen Sie die Regal-Informationen aus

### Sammlung durchsuchen

1. **Suche**: Verwenden Sie das Suchfeld für Namen oder Steinnummern
2. **Filter**: Nutzen Sie die Dropdown-Menüs für Farbe, Fundort und Gesteinsart
3. **Sortierung**: Wählen Sie die gewünschte Sortierung (Name, Nummer, Farbe)
4. **Details anzeigen**: Klicken Sie auf ein Mineral für detaillierte Informationen

## Datenbank-Struktur

### Tabellen

- **minerals**: Alle Mineral-Informationen
- **showcases**: Vitrinen-Informationen
- **shelves**: Regale innerhalb der Vitrinen
- **admin_users**: Admin-Benutzer und Passwort-Hashes

### Beziehungen

- Ein Mineral kann einem Regal zugeordnet sein
- Ein Regal gehört zu einer Vitrine
- Eine Vitrine kann mehrere Regale haben

## Produktions-Deployment

### Für Raspberry Pi

1. **Anwendung bauen**:
   ```bash
   npm run build
   ```

2. **Produktions-Server starten**:
   ```bash
   npm start
   ```

3. **Als Service einrichten** (optional):
   
   Erstellen Sie eine systemd-Service-Datei `/etc/systemd/system/mineraliensammlung.service`:
   
   ```ini
   [Unit]
   Description=mineraliensammlung
   After=network.target

   [Service]
   Type=simple
   WorkingDirectory=/root/mineraliensammlung_schule
   ExecStart=/usr/bin/npm run dev
   Restart=always
   User=root
   Environment=NODE_ENV=development

   [Install]
   WantedBy=multi-user.target
   ```
   
   Service aktivieren:
   ```bash
   sudo systemctl enable mineraliensammlung
   sudo systemctl start mineraliensammlung
   ```

## Ordnerstruktur

```
mineraliensammlung/
├── lib/
│   └── database.ts          # Datenbankverbindung
├── pages/
│   ├── api/
│   │   ├── auth/           # Authentifizierung
│   │   ├── minerals/       # Mineral-API
│   │   ├── showcases/      # Vitrinen-API
│   │   ├── shelves/        # Regale-API
│   │   ├── stats.ts        # Statistiken
│   │   └── filter-options.ts
│   └── index.tsx           # Hauptseite
├── public/
│   └── uploads/            # Hochgeladene Bilder
├── scripts/
│   └── init-db.js          # Datenbank-Initialisierung
├── types/
│   └── index.ts            # TypeScript-Typen
└── mineralien.db           # SQLite-Datenbank
```

## Sicherheit

- Passwörter werden mit bcrypt gehashed
- Admin-Bereich ist session-basiert geschützt
- Bilder werden sicher in `/public/uploads/` gespeichert
- SQL-Injection-Schutz durch Prepared Statements

## Anpassungen

### Passwort ändern

Das Admin-Passwort kann in der Datenbank geändert werden:

```javascript
// In scripts/change-password.js
const bcrypt = require('bcrypt');
const database = require('./lib/database');

const newPassword = 'IhrNeuesPasswort';
bcrypt.hash(newPassword, 10, async (err, hash) => {
  await database.run('UPDATE admin_users SET password_hash = ? WHERE id = 1', [hash]);
  console.log('Passwort erfolgreich geändert');
});
```

### Port ändern

Der Server läuft standardmäßig auf Port 8085. Ändern Sie dies in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev -p NEUER_PORT",
    "start": "next start -p NEUER_PORT"
  }
}
```

## Technische Details

- **Framework**: Next.js 14
- **Sprache**: TypeScript
- **Datenbank**: SQLite3
- **File Upload**: Multer
- **Authentifizierung**: bcrypt + HTTP-Cookies
- **Styling**: Vanilla CSS mit CSS Custom Properties

## Support

Bei Fragen oder Problemen:

1. Überprüfen Sie die Logs in der Konsole
2. Stellen Sie sicher, dass alle Dependencies installiert sind
3. Prüfen Sie die Datenbankverbindung
4. Kontrollieren Sie die Schreibrechte für das uploads-Verzeichnis

## Lizenz

Dieses Projekt ist für den privaten Gebrauch bestimmt.