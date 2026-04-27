"""Redis client – replaces lib/redis.ts.

Implements the same graceful-failure behaviour: if no REDIS_URL is set
or connection fails, caching is silently disabled.
"""

import redis as _redis
from config import Config

_pool: _redis.Redis | None = None


def get_redis() -> _redis.Redis | None:
    """Return a Redis client, or None if unavailable."""
    global _pool
    if _pool is not None:
        return _pool

    url = Config.REDIS_URL
    if not url:
        return None

    try:
        _pool = _redis.from_url(
            url,
            decode_responses=True,
            socket_connect_timeout=5,
            retry_on_timeout=True,
        )
        _pool.ping()
        print("Redis connected")
        return _pool
    except Exception:
        print("Redis connection failed. Caching disabled.")
        _pool = None
        return None


def cache_get(key: str) -> str | None:
    """Get a cached value, returns None if Redis is unavailable."""
    r = get_redis()
    if r is None:
        return None
    try:
        return r.get(key)
    except Exception:
        return None


def cache_set(key: str, value: str, ttl: int = 300) -> None:
    """Set a cached value with TTL (default 5 minutes), no-op if Redis unavailable."""
    r = get_redis()
    if r is None:
        return
    try:
        r.setex(key, ttl, value)
    except Exception:
        pass


def cache_delete(key: str) -> None:
    """Delete a cached key, no-op if Redis unavailable."""
    r = get_redis()
    if r is None:
        return
    try:
        r.delete(key)
    except Exception:
        pass
