import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Don't connect in test mode to avoid hanging the test runner
const redis = process.env.NODE_ENV === 'test' 
  ? (null as unknown as Redis)
  : new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
      }
    });

if (redis) {
  redis.on('error', (err) => {
    console.error('Redis error:', err);
  });
}

export default redis;
