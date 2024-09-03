import type { Config } from 'drizzle-kit';
export default {
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  dbCredentials: {
    url: 'sqlite.db',
  },
} satisfies Config;
