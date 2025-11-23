import logger from '../utils/logger.js';

/**
 * Role-Based Access Control Middleware
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 */
export const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (allowedRoles.length === 0) {
            return next();
        }

        if (req.user.role === 'super_admin') {
            return next();
        }

        if (!allowedRoles.includes(req.user.role)) {
            logger.warn({
                userId: req.user.id,
                role: req.user.role,
                resource: req.originalUrl
            }, 'Access denied');
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};

/**
 * Permission-based authorization (granular)
 * @param {string} permission - Permission required
 */
export const requirePermission = (permission) => {
    return (req, res, next) => {
        // TODO: Implement granular permission logic mapping roles to permissions
        // For MVP, we stick to role-based
        next();
    };
};
