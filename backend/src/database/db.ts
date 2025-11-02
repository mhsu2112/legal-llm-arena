import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/arena.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database connection
export const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

/**
 * Initialize database schema
 */
export function initializeDatabase(): void {
  console.log('Initializing database...');

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');

  // Execute entire schema at once
  try {
    db.exec(schema);
  } catch (error) {
    console.error('Error initializing database schema');
    throw error;
  }

  console.log('Database initialized successfully');
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current timestamp in ISO format
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Helper to parse JSON fields from database
 */
export function parseJsonField<T>(field: string | null | undefined): T {
  if (!field) return [] as T;
  try {
    return JSON.parse(field);
  } catch {
    return [] as T;
  }
}

/**
 * Helper to stringify JSON fields for database
 */
export function stringifyJsonField(value: any): string {
  return JSON.stringify(value || []);
}

// Initialize on import
initializeDatabase();

export default db;
