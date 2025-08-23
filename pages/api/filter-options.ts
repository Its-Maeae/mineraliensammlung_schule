import { NextApiRequest, NextApiResponse } from 'next';
import database from '../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Alle verfügbaren Farben
      const colors = await database.query(
        'SELECT DISTINCT color FROM minerals WHERE color IS NOT NULL AND color != "" ORDER BY color'
      );
      
      // Alle verfügbaren Fundorte
      const locations = await database.query(
        'SELECT DISTINCT location FROM minerals WHERE location IS NOT NULL AND location != "" ORDER BY location'
      );
      
      // Alle verfügbaren Gesteinsarten
      const rockTypes = await database.query(
        'SELECT DISTINCT rock_type FROM minerals WHERE rock_type IS NOT NULL AND rock_type != "" ORDER BY rock_type'
      );

      const filterOptions = {
        colors: colors.map((row: any) => row.color),
        locations: locations.map((row: any) => row.location),
        rock_types: rockTypes.map((row: any) => row.rock_type)
      };

      res.status(200).json(filterOptions);
    } catch (error) {
      console.error('Fehler beim Laden der Filteroptionen:', error);
      res.status(500).json({ error: 'Fehler beim Laden der Filteroptionen' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}