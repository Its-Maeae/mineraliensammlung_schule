import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Session-Cookie löschen
    const cookie = serialize('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Sofort ablaufen lassen
      path: '/'
    });

    res.setHeader('Set-Cookie', cookie);
    res.status(200).json({ message: 'Erfolgreich abgemeldet' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}