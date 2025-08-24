import { NextApiRequest, NextApiResponse } from 'next';
import database from '../../../lib/database';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { parse } from 'cookie';

// Authentifizierungsfunktion
function checkAuthentication(req: NextApiRequest): boolean {
  try {
    const cookies = parse(req.headers.cookie || '');
    const sessionToken = cookies.admin_session;

    if (!sessionToken || !sessionToken.startsWith('authenticated-')) {
      return false;
    }

    const tokenTimestamp = parseInt(sessionToken.split('-')[1]);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 Stunden

    if (now - tokenTimestamp > maxAge) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Authentifizierungsfehler:', error);
    return false;
  }
}

// Multer Konfiguration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'shelf-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 40 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Nur Bilddateien sind erlaubt'));
    }
  }
});

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const shelf = await database.get(`
        SELECT s.*,
               sc.name as showcase_name,
               sc.code as showcase_code,
               (sc.code || '-' || s.code) as full_code
        FROM shelves s
        LEFT JOIN showcases sc ON s.showcase_id = sc.id
        WHERE s.id = ?
      `, [id]);

      if (!shelf) {
        return res.status(404).json({ error: 'Regal nicht gefunden' });
      }

      res.status(200).json(shelf);
    } catch (error) {
      console.error('Fehler beim Laden des Regals:', error);
      res.status(500).json({ error: 'Fehler beim Laden des Regals' });
    }
  } else if (req.method === 'PUT') {
    try {
      if (!checkAuthentication(req)) {
        return res.status(401).json({ error: 'Nicht authentifiziert' });
      }

      // Multer Middleware für Bildupload
      await runMiddleware(req, res, upload.single('image'));

      const { name, code, description, position_order, showcase_id } = (req as any).body;
      const image = (req as any).file;

      // Prüfen ob Code bereits in der Vitrine existiert (außer beim aktuellen Regal)
      const existingShelf = await database.get(
        'SELECT id FROM shelves WHERE code = ? AND showcase_id = ? AND id != ?',
        [code, showcase_id, id]
      );

      if (existingShelf) {
        return res.status(400).json({ error: 'Regal-Code bereits in dieser Vitrine vorhanden' });
      }

      // SQL für Update mit oder ohne neues Bild
      let sql = `UPDATE shelves SET name = ?, code = ?, description = ?, position_order = ?`;
      let params = [name, code, description, position_order || 0];

      if (image) {
        sql += `, image_path = ?`;
        params.push(image.filename);
      }

      sql += ` WHERE id = ?`;
      params.push(id);

      await database.run(sql, params);

      res.status(200).json({ message: 'Regal erfolgreich aktualisiert' });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Regals:', error);
      res.status(500).json({ error: 'Fehler beim Aktualisieren des Regals' });
    }
  } else if (req.method === 'DELETE') {
    try {
      if (!checkAuthentication(req)) {
        return res.status(401).json({ error: 'Nicht authentifiziert' });
      }

      // Erst alle Mineralien von diesem Regal entfernen (shelf_id auf NULL setzen)
      await database.run('UPDATE minerals SET shelf_id = NULL WHERE shelf_id = ?', [id]);

      // Dann das Regal löschen
      const result = await database.run('DELETE FROM shelves WHERE id = ?', [id]);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Regal nicht gefunden' });
      }

      res.status(200).json({ message: 'Regal erfolgreich gelöscht' });
    } catch (error) {
      console.error('Fehler beim Löschen des Regals:', error);
      res.status(500).json({ error: 'Fehler beim Löschen des Regals' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};