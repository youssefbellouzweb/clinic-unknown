import logger from './logger.js';

// Custom error classes
export class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message, 400);
        this.errors = errors;
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error
    if (err.statusCode >= 500) {
        logger.error({
            err,
            req: {
                method: req.method,
                url: req.url,
                ip: req.ip,
                user: req.user?.id
            }
        }, 'Internal server error');
    } else {
        logger.warn({
            message: err.message,
            statusCode: err.statusCode,
            url: req.url,
            method: req.method
        }, 'Request error');
    }

    // Send error response
    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err.message,
            errors: err.errors,
            stack: err.stack
        });
    } else {
        // Production: don't leak error details
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                error: err.message,
                errors: err.errors
            });
        } else {
            // Programming or unknown error: don't leak details
            logger.error({ err }, 'Non-operational error');
            res.status(500).json({
                status: 'error',
                error: 'Internal server error'
            });
        }
    }
};

// Async error wrapper
export const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export default {
    AppError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    errorHandler,
    catchAsync
};
