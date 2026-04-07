import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || process.env.RDB_URL;

// Don't connect in test mode or if no URL provided
const redis = (process.env.NODE_ENV === 'test' || !REDIS_URL)
  ? null
  : new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 3) {
          console.log('Redis connection failed permanently. Caching disabled.');
          return null; // Stop retrying
        }
        return Math.min(times * 100, 3000);
      },
      connectTimeout: 5000
    });

if (redis) {
  redis.on('error', (err) => {
    // Only log critical errors, not connection refused spam
    if ((err as any).code !== 'ECONNREFUSED') {
      console.error('Redis error:', err);
    }
  });
}

export default redis;

