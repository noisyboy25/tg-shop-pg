import type { Config } from 'drizzle-kit';
export default {
  dialect: 'sqlite',
  schema: './db/schema.ts',
  dbCredentials: {
    url: 'sqlite.db',
  },
} satisfies Config;
