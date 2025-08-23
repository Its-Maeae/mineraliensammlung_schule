import { NextApiRequest, NextApiResponse } from 'next';
import database from '../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const showcases = await database.query(`
        SELECT sc.*,
               COUNT(DISTINCT s.id) as shelf_count,
               COUNT(DISTINCT m.id) as mineral_count
        FROM showcases sc
        LEFT JOIN shelves s ON sc.id = s.showcase_id
        LEFT JOIN minerals m ON s.id = m.shelf_id
        GROUP BY sc.id
        ORDER BY sc.name
      `);

      res.status(200).json(showcases);
    } catch (error) {
      console.error('Fehler beim Laden der Vitrinen:', error);
      res.status(500).json({ error: 'Fehler beim Laden der Vitrinen' });
    }
  } else if (req.method === 'POST') {
    try {
      // Authentifizierung prüfen
      const authResponse = await fetch(`${req.headers.origin}/api/auth/check`, {
        headers: { cookie: req.headers.cookie || '' }
      });
      
      if (!authResponse.ok) {
        return res.status(401).json({ error: 'Nicht authentifiziert' });
      }

      const { name, code, location, description } = req.body;

      // Prüfen ob Code bereits existiert
      const existingShowcase = await database.get(
        'SELECT id FROM showcases WHERE code = ?',
        [code]
      );

      if (existingShowcase) {
        return res.status(400).json({ error: 'Vitrine-Code bereits vorhanden' });
      }

      const result = await database.run(
        'INSERT INTO showcases (name, code, location, description) VALUES (?, ?, ?, ?)',
        [name, code, location, description]
      );

      res.status(201).json({ id: result.id, message: 'Vitrine erfolgreich hinzugefügt' });
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Vitrine:', error);
      res.status(500).json({ error: 'Fehler beim Hinzufügen der Vitrine' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}