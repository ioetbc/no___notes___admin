import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import * as schema from './schema.js';

// Create a database client
export const createDb = () => {
  // Use absolute path for the database file to ensure consistency
  const databasePath = process.env.DATABASE_URL || 'file:/Users/ioetbc/Free/no___notes___admin/packages/db/data.db';
  
  const client = createClient({
    url: databasePath,
  });

  return drizzle(client, { schema });
};

// Export the schema and types
export * from './schema.js';