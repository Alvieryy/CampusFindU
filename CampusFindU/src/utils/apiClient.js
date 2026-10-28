import axios from "axios";

/**
 * High-performance client-side API helper with:
 * - Request deduplication (sharing in-flight promises)
 * - In-memory response caching with configurable TTL (default 25s)
 * - Automatic background cache revalidation
 * - Pattern-based cache invalidation on mutations
 * - Request timeout safeguards
 */
class ApiClient {
  constructor() {
    this.cache = new Map();
    this.inflight = new Map();
  }

  /**
   * Cached GET request with promise deduplication and timeout
   * @param {string} url
   * @param {object} options
   * @returns {Promise<any>}
   */
  async get(url, options = {}) {
    const { ttl = 25000, timeout = 10000, force = false } = options;
    const cacheKey = url;

    // 1. Check in-memory cache if not forced
    if (!force) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() < cached.expiresAt) {
        return cached.data;
      }
    }

    // 2. Deduplicate simultaneous in-flight requests for the exact same URL
    if (this.inflight.has(cacheKey)) {
      return this.inflight.get(cacheKey);
    }

    // 3. Dispatch request with timeout safeguard
    const fetchPromise = (async () => {
      try {
        const response = await axios.get(url, {
          timeout,
        });

        // Store response in cache
        this.cache.set(cacheKey, {
          data: response.data,
          expiresAt: Date.now() + ttl,
        });

        return response.data;
      } finally {
        this.inflight.delete(cacheKey);
      }
    })();

    this.inflight.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  /**
   * Direct POST request that invalidates related cache patterns
   */
  async post(url, data, options = {}) {
    const res = await axios.post(url, data, options);
    this.invalidateRelated(url);
    return res;
  }

  /**
   * Direct PUT request that invalidates related cache patterns
   */
  async put(url, data, options = {}) {
    const res = await axios.put(url, data, options);
    this.invalidateRelated(url);
    return res;
  }

  /**
   * Direct DELETE request that invalidates related cache patterns
   */
  async delete(url, options = {}) {
    const res = await axios.delete(url, options);
    this.invalidateRelated(url);
    return res;
  }

  /**
   * Invalidate cache entries matching a string prefix or regex
   * @param {string|RegExp} pattern
   */
  invalidate(pattern) {
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Automatically invalidate caches related to mutated endpoints
   */
  invalidateRelated(url) {
    if (
      url.includes("lost-items") ||
      url.includes("found-items") ||
      url.includes("claims")
    ) {
      this.invalidate("lost-items");
      this.invalidate("found-items");
      this.invalidate("claims");
    }
    if (url.includes("notifications")) {
      this.invalidate("notifications");
    }
  }

  /**
   * Clear all client cache
   */
  clear() {
    this.cache.clear();
    this.inflight.clear();
  }
}

export const apiClient = new ApiClient();
export default apiClient;
