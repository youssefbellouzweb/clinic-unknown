import logger from '../utils/logger.js';
import { maskPII } from '../utils/sanitizer.js';

/**
 * Audit logging middleware
 * Captures all mutations (POST, PUT, DELETE) with user context
 */
export const auditMiddleware = (action) => {
    return async (req, res, next) => {
        // Store original send function
        const originalSend = res.send;
        const originalJson = res.json;

        // Override send and json to capture response
        const captureResponse = function (data) {
            // Only log successful mutations (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    // Extract entity information
                    const pathParts = req.baseUrl.split('/').filter(Boolean);
                    const entity = pathParts[pathParts.length - 1] || 'unknown';
                    const entityId = req.params.id || null;

                    // Prepare audit log entry
                    const auditEntry = {
                        action: action || req.method,
                        user_id: req.user?.id || null,
                        user_role: req.user?.role || null,
                        clinic_id: req.user?.clinic_id || null,
                        entity,
                        entity_id: entityId,
                        changes: maskPII(req.body),
                        ip_address: req.ip || req.connection.remoteAddress,
                        user_agent: req.headers['user-agent'],
                        timestamp: new Date().toISOString(),
                        request_id: req.id
                    };

                    // Log audit entry
                    logger.info({
                        audit: auditEntry,
                        type: 'AUDIT_LOG'
                    }, `Audit: ${action || req.method} ${entity}`);

                    // Store in audit_logs table
                    // We need to import db dynamically or pass it in to avoid circular deps if possible, 
                    // but for now assuming db is available or we use the createAuditLog helper
                    // Note: In a real app, this should be fire-and-forget or queued to not block response
                    import('../config/db.js').then(({ default: db }) => {
                        createAuditLog(db, auditEntry);
                    }).catch(err => logger.error({ err }, 'Failed to import db for audit log'));

                } catch (error) {
                    logger.error({ err: error }, 'Failed to create audit log');
                }
            }

            // Call original function
            return originalSend.call(this, data);
        };

        res.send = captureResponse;
        res.json = function (data) {
            res.send = originalSend;
            return originalJson.call(this, data);
        };

        next();
    };
};

/**
 * Create audit log entry in database
 * This will be implemented when audit_logs table is created
 */
export const createAuditLog = async (db, auditData) => {
    try {
        const stmt = db.prepare(`
            INSERT INTO audit_logs (
                user_id, user_role, clinic_id, action, entity, entity_id,
                changes, ip_address, user_agent, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            auditData.user_id,
            auditData.user_role,
            auditData.clinic_id,
            auditData.action,
            auditData.entity,
            auditData.entity_id,
            JSON.stringify(auditData.changes),
            auditData.ip_address,
            auditData.user_agent,
            auditData.timestamp
        );

        return true;
    } catch (error) {
        logger.error({ err: error, auditData }, 'Failed to store audit log in database');
        return false;
    }
};

/**
 * Query audit logs with filters
 */
export const queryAuditLogs = (db, filters = {}) => {
    try {
        let query = 'SELECT * FROM audit_logs WHERE 1=1';
        const params = [];

        if (filters.clinic_id) {
            query += ' AND clinic_id = ?';
            params.push(filters.clinic_id);
        }

        if (filters.user_id) {
            query += ' AND user_id = ?';
            params.push(filters.user_id);
        }

        if (filters.entity) {
            query += ' AND entity = ?';
            params.push(filters.entity);
        }

        if (filters.action) {
            query += ' AND action = ?';
            params.push(filters.action);
        }

        if (filters.start_date) {
            query += ' AND created_at >= ?';
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            query += ' AND created_at <= ?';
            params.push(filters.end_date);
        }

        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(filters.limit || 100);

        const stmt = db.prepare(query);
        return stmt.all(...params);
    } catch (error) {
        logger.error({ err: error, filters }, 'Failed to query audit logs');
        return [];
    }
};

export default {
    auditMiddleware,
    createAuditLog,
    queryAuditLogs
};
