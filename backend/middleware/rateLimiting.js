import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn({
            ip: req.ip,
            url: req.url,
            user: req.user?.id
        }, 'Rate limit exceeded');

        res.status(429).json({
            error: 'Too many requests',
            message: 'Please try again later'
        });
    }
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    skipSuccessfulRequests: true,
    message: 'Too many login attempts, please try again later',
    handler: (req, res) => {
        logger.warn({
            ip: req.ip,
            email: req.body?.email,
            url: req.url
        }, 'Auth rate limit exceeded');

        res.status(429).json({
            error: 'Too many login attempts',
            message: 'Please try again after 15 minutes'
        });
    }
});

// Rate limiter for registration endpoints
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 registrations per hour
    message: 'Too many accounts created from this IP, please try again later',
    handler: (req, res) => {
        logger.warn({
            ip: req.ip,
            url: req.url
        }, 'Registration rate limit exceeded');

        res.status(429).json({
            error: 'Too many registrations',
            message: 'Please try again after 1 hour'
        });
    }
});

// Rate limiter for public endpoints (visitor services)
export const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: 'Too many requests, please try again later',
    handler: (req, res) => {
        logger.warn({
            ip: req.ip,
            url: req.url
        }, 'Public endpoint rate limit exceeded');

        res.status(429).json({
            error: 'Too many requests',
            message: 'Please try again later'
        });
    }
});

// Rate limiter for appointment creation
export const appointmentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 appointment requests per hour
    message: 'Too many appointment requests, please try again later',
    handler: (req, res) => {
        logger.warn({
            ip: req.ip,
            user: req.user?.id,
            url: req.url
        }, 'Appointment rate limit exceeded');

        res.status(429).json({
            error: 'Too many appointment requests',
            message: 'Please try again after 1 hour'
        });
    }
});

// Rate limiter for data export/heavy operations
export const heavyOperationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 heavy operations per hour
    message: 'Too many export requests, please try again later',
    handler: (req, res) => {
        logger.warn({
            ip: req.ip,
            user: req.user?.id,
            url: req.url
        }, 'Heavy operation rate limit exceeded');

        res.status(429).json({
            error: 'Too many requests',
            message: 'Please try again after 1 hour'
        });
    }
});

export default {
    apiLimiter,
    authLimiter,
    registerLimiter,
    publicLimiter,
    appointmentLimiter,
    heavyOperationLimiter
};
