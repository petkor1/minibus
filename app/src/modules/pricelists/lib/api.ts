import { getDb } from '@/core/lib/db';

interface Pricelist {
  id?: number;
  name: string;
  content: string;
  updatedAt?: string;
}

export async function getAllPricelists(): Promise<Pricelist[]> {
  const db = await getDb();
  return db.all('SELECT * FROM pricelists ORDER BY updatedAt DESC');
}

export async function createPricelist(name: string, content: string): Promise<Pricelist> {
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO pricelists (name, content) VALUES (?, ?)',
    name,
    content
  );
  if (result.lastID) {
    return { id: result.lastID, name, content };
  }
  throw new Error('Error creating pricelist');
}

export async function updatePricelist(id: number, name: string, content: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.run(
    'UPDATE pricelists SET name = ?, content = ? WHERE id = ?',
    name,
    content,
    id
  );
  return result.changes > 0;
}

export async function deletePricelist(id: number): Promise<boolean> {
  const db = await getDb();
  const result = await db.run('DELETE FROM pricelists WHERE id = ?', id);
  return result.changes > 0;
}
