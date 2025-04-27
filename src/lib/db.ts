// src/lib/db.ts
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000, // Wait max 5 seconds to connect
  idleTimeoutMillis: 10000,      // Disconnect idle clients after 10s
  max: 10,                       // Optional: limit number of clients
});

export const db = drizzle(pool, { schema }); // drizzle ORM
export default pool; // raw SQL access
