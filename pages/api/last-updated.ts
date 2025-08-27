import { NextApiRequest, NextApiResponse } from 'next';
import database from '../../lib/database.ts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Finde das neueste Datum aus allen Tabellen
    const queries = [
      'SELECT MAX(created_at) as last_date FROM minerals',
      'SELECT MAX(created_at) as last_date FROM showcases', 
      'SELECT MAX(created_at) as last_date FROM shelves'
    ];

    const results = await Promise.all(
      queries.map(query => database.get(query))
    );

    // Finde das absolut neueste Datum
    const dates = results
      .map(result => result?.last_date)
      .filter(date => date !== null && date !== undefined)
      .map(date => new Date(date));

    if (dates.length === 0) {
      return res.status(200).json({ 
        last_updated: new Date().toISOString()
      });
    }

    const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    res.status(200).json({ 
      last_updated: latestDate.toISOString()
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des letzten Update-Datums:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
}