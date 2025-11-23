import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'clinic.db');

// Create SQLite database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        logger.error({ err }, 'Error connecting to database');
    } else {
        logger.info({ dbPath }, 'Connected to SQLite database');
    }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Enable WAL mode for better concurrency
db.run('PRAGMA journal_mode = WAL');

// Initialize database schema
export const initDatabase = () => {
    return new Promise((resolve, reject) => {
        const schemaPath = join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        db.exec(schema, (err) => {
            if (err) {
                logger.error({ err }, 'Error initializing database');
                reject(err);
            } else {
                logger.info('Database schema initialized successfully');
                resolve();
            }
        });
    });
};

// Promisify database methods for easier async/await usage
export const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                logger.error({ err, sql, params }, 'Database run error');
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
};

export const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                logger.error({ err, sql, params }, 'Database get error');
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

export const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                logger.error({ err, sql, params }, 'Database all error');
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

export const dbExec = (sql) => {
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
            if (err) {
                logger.error({ err, sql }, 'Database exec error');
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// Graceful shutdown
process.on('SIGINT', () => {
    logger.info('Closing database connection');
    db.close((err) => {
        if (err) {
            logger.error({ err }, 'Error closing database');
        }
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    logger.info('Closing database connection');
    db.close((err) => {
        if (err) {
            logger.error({ err }, 'Error closing database');
        }
        process.exit(0);
    });
});

export default db;
