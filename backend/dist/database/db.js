"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initializeDatabase = initializeDatabase;
exports.generateId = generateId;
exports.now = now;
exports.parseJsonField = parseJsonField;
exports.stringifyJsonField = stringifyJsonField;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DB_PATH = process.env.DB_PATH || path_1.default.join(__dirname, '../../data/arena.db');
const SCHEMA_PATH = path_1.default.join(__dirname, 'schema.sql');
// Ensure data directory exists
const dataDir = path_1.default.dirname(DB_PATH);
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
// Initialize database connection
exports.db = new better_sqlite3_1.default(DB_PATH);
// Enable foreign keys
exports.db.pragma('foreign_keys = ON');
// Enable WAL mode for better concurrency
exports.db.pragma('journal_mode = WAL');
/**
 * Initialize database schema
 */
function initializeDatabase() {
    console.log('Initializing database...');
    const schema = fs_1.default.readFileSync(SCHEMA_PATH, 'utf-8');
    // Execute entire schema at once
    try {
        exports.db.exec(schema);
    }
    catch (error) {
        console.error('Error initializing database schema');
        throw error;
    }
    console.log('Database initialized successfully');
}
/**
 * Generate a unique ID
 */
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Get current timestamp in ISO format
 */
function now() {
    return new Date().toISOString();
}
/**
 * Helper to parse JSON fields from database
 */
function parseJsonField(field) {
    if (!field)
        return [];
    try {
        return JSON.parse(field);
    }
    catch {
        return [];
    }
}
/**
 * Helper to stringify JSON fields for database
 */
function stringifyJsonField(value) {
    return JSON.stringify(value || []);
}
// Initialize on import
initializeDatabase();
exports.default = exports.db;
