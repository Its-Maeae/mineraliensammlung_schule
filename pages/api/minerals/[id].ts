import { NextApiRequest, NextApiResponse } from 'next';
import database from '../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const mineral = await database.get(
        `SELECT m.*, 
                s.code as shelf_code, 
                s.name as shelf_name,
                sc.code as showcase_code,
                sc.name as showcase_name
         FROM minerals m
         LEFT JOIN shelves s ON m.shelf_id = s.id
         LEFT JOIN showcases sc ON s.showcase_id = sc.id
         WHERE m.id = ?`,
        [id]
      );

      if (!mineral) {
        return res.status(404).json({ error: 'Mineral nicht gefunden' });
      }

      res.status(200).json(mineral);
    } catch (error) {
      console.error('Fehler beim Laden des Minerals:', error);
      res.status(500).json({ error: 'Fehler beim Laden des Minerals' });
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

      const {
        name,
        number,
        color,
        description,
        location,
        purchase_location,
        rock_type,
        shelf_id
      } = req.body;

      // Prüfen ob Steinnummer bereits von anderem Mineral verwendet wird
      const existingMineral = await database.get(
        'SELECT id FROM minerals WHERE number = ? AND id != ?',
        [number, id]
      );

      if (existingMineral) {
        return res.status(400).json({ error: 'Steinnummer bereits vorhanden' });
      }

      await database.run(
        `UPDATE minerals SET 
         name = ?, number = ?, color = ?, description = ?, location = ?,
         purchase_location = ?, rock_type = ?, shelf_id = ?
         WHERE id = ?`,
        [
          name,
          number,
          color,
          description,
          location,
          purchase_location,
          rock_type,
          shelf_id || null,
          id
        ]
      );

      res.status(200).json({ message: 'Mineral erfolgreich aktualisiert' });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Minerals:', error);
      res.status(500).json({ error: 'Fehler beim Aktualisieren des Minerals' });
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

      // Mineral löschen
      const result = await database.run('DELETE FROM minerals WHERE id = ?', [id]);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Mineral nicht gefunden' });
      }

      res.status(200).json({ message: 'Mineral erfolgreich gelöscht' });
    } catch (error) {
      console.error('Fehler beim Löschen des Minerals:', error);
      res.status(500).json({ error: 'Fehler beim Löschen des Minerals' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}