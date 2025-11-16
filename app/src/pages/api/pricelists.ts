import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getAllPricelists,
  createPricelist,
  updatePricelist,
  deletePricelist,
} from '@/modules/pricelists/lib/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const pricelists = await getAllPricelists();
        res.status(200).json(pricelists);
      } catch (error) {
        console.error('Error fetching pricelists:', error);
        res.status(500).json({ message: 'Error fetching pricelists' });
      }
      break;

    case 'POST':
      try {
        const { name, content } = req.body;

        if (!name || !content) {
          return res.status(400).json({ message: 'Name and content are required' });
        }

        const newPricelist = await createPricelist(name, content);
        res.status(201).json(newPricelist);
      } catch (error) {
        console.error('Error creating pricelist:', error);
        res.status(500).json({ message: 'Error creating pricelist' });
      }
      break;

    case 'PUT':
      try {
        const { id, name, content } = req.body;

        if (!id || !name || !content) {
          return res.status(400).json({ message: 'ID, name and content are required' });
        }

        const updated = await updatePricelist(id, name, content);
        if (updated) {
          res.status(200).json({ message: 'Pricelist updated' });
        } else {
          res.status(404).json({ message: 'Pricelist not found' });
        }
      } catch (error) {
        console.error('Error updating pricelist:', error);
        res.status(500).json({ message: 'Error updating pricelist' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ message: 'Pricelist ID is required' });
        }

        const deleted = await deletePricelist(Number(id));
        if (deleted) {
          res.status(200).json({ message: 'Pricelist deleted' });
        } else {
          res.status(404).json({ message: 'Pricelist not found' });
        }
      } catch (error) {
        console.error('Error deleting pricelist:', error);
        res.status(500).json({ message: 'Error deleting pricelist' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
