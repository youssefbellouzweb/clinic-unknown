// XSS sanitization and input cleaning utilities

/**
 * Sanitize string to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
export const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;

    return str
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
        .trim();
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
};

/**
 * Mask PII fields for logging
 */
export const maskPII = (data, fields = ['email', 'phone', 'address', 'birthdate']) => {
    if (!data || typeof data !== 'object') return data;

    const masked = { ...data };

    fields.forEach(field => {
        if (masked[field]) {
            if (field === 'email' && typeof masked[field] === 'string') {
                const [local, domain] = masked[field].split('@');
                if (local && domain) {
                    masked[field] = `${local.substring(0, 2)}***@${domain}`;
                }
            } else if (field === 'phone' && typeof masked[field] === 'string') {
                const digits = masked[field].replace(/\D/g, '');
                masked[field] = `***-***-${digits.slice(-4)}`;
            } else {
                masked[field] = '[MASKED]';
            }
        }
    });

    return masked;
};

/**
 * Remove null and undefined values from object
 */
export const removeEmpty = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    return Object.entries(obj).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});
};

/**
 * Escape SQL LIKE wildcards
 */
export const escapeLike = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[%_]/g, '\\$&');
};

export default {
    sanitizeString,
    sanitizeObject,
    maskPII,
    removeEmpty,
    escapeLike
};
