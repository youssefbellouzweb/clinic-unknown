import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../clinic.db');

let db;

try {
    db = new Database(dbPath, {
        verbose: (message) => logger.debug(message)
    });
    db.pragma('journal_mode = WAL');
    logger.info(`Connected to SQLite database at ${dbPath}`);
} catch (error) {
    logger.error('Failed to connect to database:', error);
    process.exit(1);
}

export default db;
