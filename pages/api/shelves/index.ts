import { NextApiRequest, NextApiResponse } from 'next';
import database from '../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const shelves = await database.query(`
        SELECT s.*,
               sc.name as showcase_name,
               sc.code as showcase_code,
               (sc.code || '-' || s.code) as full_code,
               COUNT(m.id) as mineral_count
        FROM shelves s
        LEFT JOIN showcases sc ON s.showcase_id = sc.id
        LEFT JOIN minerals m ON s.id = m.shelf_id
        GROUP BY s.id
        ORDER BY sc.name, s.position_order, s.name
      `);

      res.status(200).json(shelves);
    } catch (error) {
      console.error('Fehler beim Laden der Regale:', error);
      res.status(500).json({ error: 'Fehler beim Laden der Regale' });
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

      const { name, code, showcase_id, description, position_order } = req.body;

      // Prüfen ob Code bereits in dieser Vitrine existiert
      const existingShelf = await database.get(
        'SELECT id FROM shelves WHERE code = ? AND showcase_id = ?',
        [code, showcase_id]
      );

      if (existingShelf) {
        return res.status(400).json({ error: 'Regal-Code bereits in dieser Vitrine vorhanden' });
      }

      const result = await database.run(
        'INSERT INTO shelves (name, code, showcase_id, description, position_order) VALUES (?, ?, ?, ?, ?)',
        [name, code, showcase_id, description, position_order || 0]
      );

      res.status(201).json({ id: result.id, message: 'Regal erfolgreich hinzugefügt' });
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Regals:', error);
      res.status(500).json({ error: 'Fehler beim Hinzufügen des Regals' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}