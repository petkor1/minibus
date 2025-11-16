import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '@/core/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await getDb();

  switch (req.method) {
    case 'GET':
      try {
        const announcements = await db.all('SELECT * FROM announcements ORDER BY createdAt DESC');
        res.status(200).json(announcements);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching announcements' });
      }
      break;

    case 'POST':
      try {
        const { title, content } = req.body;

        if (!title || !content) {
          return res.status(400).json({ message: 'Title and content are required' });
        }

        const result = await db.run(
          'INSERT INTO announcements (title, content) VALUES (?, ?)',
          title,
          content
        );
        
        if (result.lastID) {
            res.status(201).json({ id: result.lastID, title, content });
        } else {
            res.status(500).json({ message: 'Error creating announcement' });
        }

      } catch (error) {
        res.status(500).json({ message: 'Error creating announcement' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
