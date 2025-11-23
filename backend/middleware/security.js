import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { sanitizeObject } from '../utils/sanitizer.js';

// Security headers middleware
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});

// Sanitize request data to prevent NoSQL injection
export const sanitizeInput = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }
    next();
};

// MongoDB sanitization (prevents $ and . in keys)
export const noSqlSanitize = mongoSanitize({
    replaceWith: '_'
});

// CSRF protection configuration
export const csrfConfig = {
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
};

// Additional security middleware
export const additionalSecurity = (req, res, next) => {
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');

    // Add custom security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    next();
};

export default {
    securityHeaders,
    sanitizeInput,
    noSqlSanitize,
    csrfConfig,
    additionalSecurity
};
