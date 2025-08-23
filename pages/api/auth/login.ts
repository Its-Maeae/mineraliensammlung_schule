import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { serialize } from 'cookie';
import database from '../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: 'Passwort erforderlich' });
      }

      // Admin-Benutzer aus der Datenbank laden
      const adminUser = await database.get('SELECT * FROM admin_users WHERE id = 1');

      if (!adminUser) {
        return res.status(500).json({ error: 'Admin-Benutzer nicht gefunden' });
      }

      // Passwort überprüfen
      const isValid = await bcrypt.compare(password, adminUser.password_hash);

      if (!isValid) {
        return res.status(401).json({ error: 'Ungültiges Passwort' });
      }

      // Session-Cookie setzen (24 Stunden gültig)
      const sessionToken = 'authenticated-' + Date.now();
      const cookie = serialize('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 Stunden
        path: '/'
      });

      res.setHeader('Set-Cookie', cookie);
      res.status(200).json({ message: 'Erfolgreich angemeldet' });
    } catch (error) {
      console.error('Login-Fehler:', error);
      res.status(500).json({ error: 'Server-Fehler beim Login' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}