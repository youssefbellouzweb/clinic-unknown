import pinoHttp from 'pino-http';
import logger from '../utils/logger.js';
import { sanitizeObject } from '../utils/sanitizer.js';

// Request logging middleware
export const requestLogger = pinoHttp({
    logger,
    // Generate request ID
    genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
    // Custom serializers
    serializers: {
        req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            query: req.query,
            params: req.params,
            user: req.user ? {
                id: req.user.id,
                role: req.user.role,
                clinic_id: req.user.clinic_id
            } : undefined,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        }),
        res: (res) => ({
            statusCode: res.statusCode
        })
    },
    // Custom log level
    customLogLevel: (req, res, err) => {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        if (res.statusCode >= 300) return 'info';
        return 'info';
    },
    // Custom success message
    customSuccessMessage: (req, res) => {
        return `${req.method} ${req.url} ${res.statusCode}`;
    },
    // Custom error message
    customErrorMessage: (req, res, err) => {
        return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
    }
});

// Audit log middleware for mutations
export const auditLog = (action) => {
    return (req, res, next) => {
        const originalSend = res.send;

        res.send = function (data) {
            // Only log successful mutations (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const auditData = {
                    action,
                    user_id: req.user?.id,
                    clinic_id: req.user?.clinic_id,
                    entity: req.baseUrl.split('/').pop(),
                    entity_id: req.params.id || null,
                    changes: sanitizeObject(req.body),
                    ip: req.ip,
                    timestamp: new Date().toISOString()
                };

                logger.info({ audit: auditData }, `Audit: ${action}`);
            }

            return originalSend.call(this, data);
        };

        next();
    };
};

export default {
    requestLogger,
    auditLog
};
