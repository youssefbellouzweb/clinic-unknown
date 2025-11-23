import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Authentication Middleware
 * Verifies JWT access token and attaches user to request
 */
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            let user;
            if (decoded.type === 'patient_portal') {
                // Verify patient portal user
                user = db.prepare('SELECT id, clinic_id, patient_id, email FROM patient_portal_users WHERE id = ? AND is_active = 1').get(decoded.id);
                if (user) {
                    user.role = 'patient'; // Assign virtual role for RBAC
                }
            } else {
                // Verify regular user
                user = db.prepare('SELECT id, clinic_id, role, name, email FROM users WHERE id = ? AND is_verified = 1').get(decoded.id);
            }

            if (!user) {
                return res.status(401).json({ error: 'Unauthorized: User not found or inactive' });
            }

            // Attach user to request
            req.user = {
                id: user.id,
                clinicId: user.clinic_id, // Standardize to camelCase
                clinic_id: user.clinic_id, // Keep snake_case for compatibility
                role: user.role,
                email: user.email,
                name: user.name,
                patient_id: user.patient_id // Only for patient portal users
            };

            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Unauthorized: Token expired', code: 'TOKEN_EXPIRED' });
            }
            throw err;
        }
    } catch (error) {
        logger.error({ error }, 'Auth middleware error');
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

/**
 * Optional Authentication Middleware
 * Attaches user if token is present, but doesn't block if missing
 */
export const authenticateOptional = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }
    return authenticate(req, res, next);
};
