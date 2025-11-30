import redisClient from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Cache middleware
 * @param {number} duration - Cache duration in seconds
 */
export const cache = (duration = 300) => {
    return async (req, res, next) => {
        // Skip if Redis is not configured or request is not GET
        if (!redisClient || req.method !== 'GET') {
            return next();
        }

        const key = `cache:${req.originalUrl || req.url}`;

        try {
            const cachedResponse = await redisClient.get(key);

            if (cachedResponse) {
                logger.debug({ key }, 'Cache hit');
                return res.json(JSON.parse(cachedResponse));
            }

            // Override res.json to cache the response
            const originalJson = res.json;
            res.json = (body) => {
                redisClient.setex(key, duration, JSON.stringify(body));
                return originalJson.call(res, body);
            };

            next();
        } catch (error) {
            logger.error({ error: error.message }, 'Cache middleware error');
            next();
        }
    };
};

/**
 * Clear cache by pattern
 * @param {string} pattern - Key pattern to clear
 */
export const clearCache = async (pattern) => {
    if (!redisClient) return;

    try {
        const keys = await redisClient.keys(`cache:${pattern}*`);
        if (keys.length > 0) {
            await redisClient.del(keys);
            logger.info({ count: keys.length, pattern }, 'Cache cleared');
        }
    } catch (error) {
        logger.error({ error: error.message }, 'Clear cache error');
    }
};

export default cache;
