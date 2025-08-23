import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const cookies = parse(req.headers.cookie || '');
      const sessionToken = cookies.admin_session;

      if (!sessionToken || !sessionToken.startsWith('authenticated-')) {
        return res.status(401).json({ error: 'Nicht authentifiziert' });
      }

      // Einfache Token-Validierung (in einer echten Anwendung würde man hier eine DB-Session prüfen)
      const tokenTimestamp = parseInt(sessionToken.split('-')[1]);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 Stunden

      if (now - tokenTimestamp > maxAge) {
        return res.status(401).json({ error: 'Session abgelaufen' });
      }

      res.status(200).json({ message: 'Authentifiziert' });
    } catch (error) {
      console.error('Authentifizierungsfehler:', error);
      res.status(401).json({ error: 'Nicht authentifiziert' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}