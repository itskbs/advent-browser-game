import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL);

let schemaReady = null;

// Lazy, idempotent: cheap enough to call at the top of every handler.
export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        username_lower TEXT NOT NULL UNIQUE,
        birthdate TEXT NOT NULL,
        progress JSONB NOT NULL DEFAULT '{"solved":{},"eggs":{},"gift":false}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.catch((err) => { schemaReady = null; throw err; });
  }
  return schemaReady;
}
