import { sql } from 'drizzle-orm';
import { text, sqliteTable, real, integer } from 'drizzle-orm/sqlite-core';
export const products = sqliteTable('products', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  name: text('name').notNull(),
  price: real('price').notNull(),
  image: text('image').notNull(),
});
