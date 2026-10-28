/**
 * High-performance, lightweight in-memory TTL cache with automatic invalidation
 */
class MemoryCache {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Get a cached entry if not expired
     * @param {string} key
     * @returns {any|null}
     */
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    /**
     * Set a cached entry with TTL in seconds (default 30s)
     * @param {string} key
     * @param {any} value
     * @param {number} ttlSeconds
     */
    set(key, value, ttlSeconds = 30) {
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000
        });
    }

    /**
     * Delete an exact cache key
     * @param {string} key
     */
    del(key) {
        this.cache.delete(key);
    }

    /**
     * Invalidate all keys matching a prefix or regex pattern
     * @param {string|RegExp} pattern
     */
    invalidatePattern(pattern) {
        const regex = typeof pattern === 'string' ? new RegExp(`^${pattern}`) : pattern;
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear all cached data
     */
    clear() {
        this.cache.clear();
    }
}

const memoryCache = new MemoryCache();

module.exports = memoryCache;
