import { NextApiRequest, NextApiResponse } from 'next';
import database from '../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const showcase = await database.get(
        'SELECT * FROM showcases WHERE id = ?',
        [id]
      );

      if (!showcase) {
        return res.status(404).json({ error: 'Vitrine nicht gefunden' });
      }

      // Regale dieser Vitrine laden
      const shelves = await database.query(`
        SELECT s.*,
               sc.code as showcase_code,
               (sc.code || '-' || s.code) as full_code,
               COUNT(m.id) as mineral_count
        FROM shelves s
        LEFT JOIN showcases sc ON s.showcase_id = sc.id
        LEFT JOIN minerals m ON s.id = m.shelf_id
        WHERE s.showcase_id = ?
        GROUP BY s.id
        ORDER BY s.position_order, s.name
      `, [id]);

      showcase.shelves = shelves;

      res.status(200).json(showcase);
    } catch (error) {
      console.error('Fehler beim Laden der Vitrine:', error);
      res.status(500).json({ error: 'Fehler beim Laden der Vitrine' });
    }
  } else if (req.method === 'PUT') {
    try {
      // Authentifizierung prüfen
      const authResponse = await fetch(`${req.headers.origin}/api/auth/check`, {
        headers: { cookie: req.headers.cookie || '' }
      });
      
      if (!authResponse.ok) {
        return res.status(401).json({ error: 'Nicht authentifiziert' });
      }

      const { name, code, location, description } = req.body;

      // Prüfen ob Code bereits von anderer Vitrine verwendet wird
      const existingShowcase = await database.get(
        'SELECT id FROM showcases WHERE code = ? AND id != ?',
        [code, id]
      );

      if (existingShowcase) {
        return res.status(400).json({ error: 'Vitrine-Code bereits vorhanden' });
      }

      await database.run(
        'UPDATE showcases SET name = ?, code = ?, location = ?, description = ? WHERE id = ?',
        [name, code, location, description, id]
      );

      res.status(200).json({ message: 'Vitrine erfolgreich aktualisiert' });
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Vitrine:', error);
      res.status(500).json({ error: 'Fehler beim Aktualisieren der Vitrine' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Authentifizierung prüfen
      const authResponse = await fetch(`${req.headers.origin}/api/auth/check`, {
        headers: { cookie: req.headers.cookie || '' }
      });
      
      if (!authResponse.ok) {
        return res.status(401).json({ error: 'Nicht authentifiziert' });
      }

      // Vitrine löschen (Regale werden durch CASCADE gelöscht)
      const result = await database.run('DELETE FROM showcases WHERE id = ?', [id]);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Vitrine nicht gefunden' });
      }

      res.status(200).json({ message: 'Vitrine erfolgreich gelöscht' });
    } catch (error) {
      console.error('Fehler beim Löschen der Vitrine:', error);
      res.status(500).json({ error: 'Fehler beim Löschen der Vitrine' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}