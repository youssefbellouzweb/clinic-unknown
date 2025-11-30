import Redis from 'ioredis';
import logger from '../utils/logger.js';

let redisClient = null;

if (process.env.REDIS_HOST) {
    redisClient = new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        }
    });

    redisClient.on('connect', () => {
        logger.info('Redis connected successfully');
    });

    redisClient.on('error', (err) => {
        logger.error({ error: err.message }, 'Redis connection error');
    });
} else {
    logger.warn('Redis configuration missing, caching disabled');
}

export default redisClient;
