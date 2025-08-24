import { NextApiRequest, NextApiResponse } from 'next';
import database from '../../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // Regal-Informationen laden
      const shelfInfo = await database.get(`
        SELECT s.id,
              s.name,
              s.code,
              s.image_path,
              s.description,
              s.position_order,
              sc.name as showcase_name,
              sc.code as showcase_code,
              (sc.code || '-' || s.code) as full_code
        FROM shelves s
        LEFT JOIN showcases sc ON s.showcase_id = sc.id
        WHERE s.id = ?
      `, [id]);

      if (!shelfInfo) {
        return res.status(404).json({ error: 'Regal nicht gefunden' });
      }

      // Mineralien in diesem Regal laden
      const minerals = await database.query(`
        SELECT m.*
        FROM minerals m
        WHERE m.shelf_id = ?
        ORDER BY m.name
      `, [id]);

      res.status(200).json({
        shelfInfo,
        minerals
      });
    } catch (error) {
      console.error('Fehler beim Laden der Regal-Mineralien:', error);
      res.status(500).json({ error: 'Fehler beim Laden der Regal-Mineralien' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}