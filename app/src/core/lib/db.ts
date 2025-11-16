import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

// This is a singleton to ensure we only have one database connection.
let db: Awaited<ReturnType<typeof open>> | null = null;

export async function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'db', 'minibus.db');
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    
    console.log('Database connection established.');
  }
  return db;
}
