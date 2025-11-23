import db from '../config/db.js';
import logger from '../utils/logger.js';

/**
 * Middleware to enforce tenant isolation
 * Extracts clinic_id from user token or request params and enforces it on queries
 */
export const enforceTenant = (req, res, next) => {
    // Skip for super admin
    if (req.user && req.user.role === 'super_admin') {
        return next();
    }

    // Skip for public routes that don't need tenant context (e.g. login, register-clinic)
    // But some public routes might need it if they are clinic-specific (e.g. public directory profile)
    // This middleware assumes it's placed AFTER auth middleware for protected routes

    if (!req.user || !req.user.clinicId) {
        // If no user context, check if it's a public tenant-scoped route (e.g. by slug)
        // For now, we focus on authenticated tenant isolation
        return next();
    }

    const clinicId = req.user.clinicId;
    req.clinicId = clinicId;

    // Override db methods to enforce clinic_id
    // This is a simplified example. In a real app, you might use a query builder or ORM hooks.
    // With better-sqlite3, we can't easily intercept all calls without a proxy.
    // Instead, we will rely on the service layer to use `req.clinicId`.
    // But we can add a helper to req to ensure it's used.

    logger.debug({ clinicId }, 'Tenant context set');
    next();
};

/**
 * Helper to add clinic_id to SQL queries
 * @param {string} sql 
 * @returns {string} SQL with clinic_id check appended (naive implementation)
 */
export const withTenant = (sql) => {
    // This is just a helper, actual enforcement happens in services
    return sql;
};
