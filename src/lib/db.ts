import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

export function getDb() {
  if (!databaseUrl) {
    return null;
  }
  return neon(databaseUrl);
}

/**
 * Ensures the user_saved_repos table exists in Neon DB
 */
let tableInitialized = false;

export async function ensureTablesExist() {
  if (tableInitialized) return true;
  const sql = getDb();
  if (!sql) return false;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS user_saved_repos (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        full_name TEXT NOT NULL,
        owner TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        stars INT DEFAULT 0,
        forks INT DEFAULT 0,
        avatar_url TEXT,
        html_url TEXT NOT NULL,
        saved_at BIGINT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, full_name)
      );
    `;
    tableInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize Neon DB tables:', error);
    return false;
  }
}
