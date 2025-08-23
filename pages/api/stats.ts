import { NextApiRequest, NextApiResponse } from 'next';
import database from '../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Anzahl Mineralien
      const mineralCount = await database.get('SELECT COUNT(*) as count FROM minerals');
      
      // Anzahl einzigartige Fundorte
      const locationCount = await database.get(
        'SELECT COUNT(DISTINCT location) as count FROM minerals WHERE location IS NOT NULL AND location != ""'
      );
      
      // Anzahl einzigartige Farben
      const colorCount = await database.get(
        'SELECT COUNT(DISTINCT color) as count FROM minerals WHERE color IS NOT NULL AND color != ""'
      );
      
      // Anzahl Regale
      const shelfCount = await database.get('SELECT COUNT(*) as count FROM shelves');

      const stats = {
        total_minerals: mineralCount.count,
        total_locations: locationCount.count,
        total_colors: colorCount.count,
        total_shelves: shelfCount.count
      };

      res.status(200).json(stats);
    } catch (error) {
      console.error('Fehler beim Laden der Statistiken:', error);
      res.status(500).json({ error: 'Fehler beim Laden der Statistiken' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}