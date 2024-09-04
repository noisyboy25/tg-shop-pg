import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { products } from './schema';

const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);
(async () => {
  const result = await db.select().from(products);
  console.log(result);
})();

export default db;
