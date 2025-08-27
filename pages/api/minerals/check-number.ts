import type { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import path from 'path';

interface CheckNumberResponse {
  exists: boolean;
  mineral?: {
    id: number;
    name: string;
    number: string;
  };
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckNumberResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { number } = req.query;

  if (!number || typeof number !== 'string') {
    return res.status(400).json({ error: 'Nummer ist erforderlich' });
  }

  const trimmedNumber = number.trim();
  if (!trimmedNumber) {
    return res.status(400).json({ error: 'Nummer darf nicht leer sein' });
  }

  const dbPath = path.join(process.cwd(), 'mineralien.db');
  const db = new sqlite3.Database(dbPath);

  db.get(
    'SELECT id, name, number FROM minerals WHERE number = ? LIMIT 1',
    [trimmedNumber],
    (err, row: any) => {
      if (err) {
        console.error('Database error:', err);
        db.close();
        return res.status(500).json({ error: 'Datenbankfehler' });
      }

      if (row) {
        // Nummer existiert bereits
        res.status(200).json({ 
          exists: true,
          mineral: {
            id: row.id,
            name: row.name,
            number: row.number
          }
        });
      } else {
        // Nummer ist verfügbar
        res.status(200).json({ exists: false });
      }

      db.close();
    }
  );
}