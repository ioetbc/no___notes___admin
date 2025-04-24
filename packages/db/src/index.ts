import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

// PostgreSQL connection configuration
const connectionString = process.env.DATABASE_URL || 
  `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'no_notes_admin'}`;

// Create a database client
export const createDb = () => {
  // Create postgres client
  const client = postgres(connectionString, { 
    max: 10,
    // For SSR, keep connections alive
    idle_timeout: 20, 
    connect_timeout: 10
  });
  
  // Create drizzle client
  return drizzle(client, { schema });
};

// Export the schema and types
export * from './schema.js';