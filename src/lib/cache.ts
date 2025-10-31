/**
 * Caching Strategy for AstroApp
 * Implements intelligent caching for API responses and expensive computations
 */

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  tags?: string[]; // Cache tagging for invalidation
}

// Cache configuration
interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  enabled: boolean;
}

class AstroAppCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private config: CacheConfig;
  private accessOrder: string[] = []; // For LRU eviction

  constructor(config: CacheConfig) {
    this.config = config;
  }

  /**
   * Generate cache key from parameters
   */
  public generateKey(prefix: string, ...args: unknown[]): string {
    const keyData = args
      .map((arg) =>
        typeof arg === "object" && arg !== null
          ? JSON.stringify(arg)
          : String(arg)
      )
      .join("|");

    return `${prefix}:${this.hashCode(keyData)}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    if (!this.config.enabled) return null;

    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }

    // Update access order for LRU
    this.updateAccessOrder(key);

    return entry.data as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, data: T, ttl?: number, tags?: string[]): void {
    if (!this.config.enabled) return;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      tags,
    };

    // Evict oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, entry as CacheEntry<unknown>);
    this.updateAccessOrder(key);
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
    return this.cache.delete(key);
  }

  /**
   * Invalidate cache by tags
   */
  invalidateByTags(tags: string[]): void {
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (entry.tags && entry.tags.some((tag) => tags.includes(tag))) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.delete(key));
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; hitRate: number; keys: string[] } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Update access order for LRU
   */
  private updateAccessOrder(key: string): void {
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
    this.accessOrder.push(key);
  }

  /**
   * Evict oldest accessed entry (LRU)
   */
  private evictOldest(): void {
    if (this.accessOrder.length > 0) {
      const oldestKey = this.accessOrder.shift();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }
}

// Default cache instance
const defaultCache = new AstroAppCache({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000, // Max 1000 entries
  enabled: true,
});

/**
 * Cache decorator for functions
 */
export function cached<Args extends unknown[], Result>(
  keyPrefix: string,
  ttl?: number,
  tags?: string[]
) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: Args) => Promise<Result>>
  ) {
    const originalMethod = descriptor.value;

    if (!originalMethod) {
      throw new Error("Cache decorator requires a method implementation.");
    }

    descriptor.value = async function (...args: Args) {
      // Generate cache key
      const cacheKey = defaultCache.generateKey(keyPrefix, ...args);

      // Try to get from cache
      const cachedResult = defaultCache.get<Result>(cacheKey);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Cache the result
      defaultCache.set(cacheKey, result, ttl, tags);

      return result;
    };

    return descriptor;
  };
}

/**
 * Specific cache strategies for different data types
 */

// Chart calculation cache - longer TTL since calculations are expensive
export const cachedChartCalculation = cached("chart", 10 * 60 * 1000, [
  "chart",
  "calculation",
]);

// Location search cache - shorter TTL since locations change frequently
export const cachedLocationSearch = cached("location", 2 * 60 * 1000, [
  "location",
  "search",
]);

// Transit calculation cache - medium TTL
export const cachedTransitCalculation = cached("transit", 5 * 60 * 1000, [
  "transit",
  "calculation",
]);

// API response cache - configurable TTL
export const cachedApiResponse = cached("api", 3 * 60 * 1000, [
  "api",
  "response",
]);

/**
 * Cache utilities for Next.js API routes
 */
export async function withCache<T>(
  cacheKey: string,
  ttl: number,
  tags: string[],
  fetcher: () => Promise<T>
): Promise<T> {
  // Try to get from cache first
  const cached = defaultCache.get<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Cache the result
  defaultCache.set(cacheKey, data, ttl, tags);

  return data;
}

/**
 * Invalidate specific cache entries
 */
export function invalidateCache(tags: string[]): void {
  defaultCache.invalidateByTags(tags);
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  defaultCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return defaultCache.getStats();
}

/**
 * Middleware for automatic caching in API routes
 */
export function createCacheMiddleware(
  fetcher: (request: Request) => Promise<Response>,
  cacheKey: string,
  ttl: number = 5 * 60 * 1000,
  tags: string[] = ["api"]
) {
  return async (request: Request): Promise<Response> => {
    try {
      const result = await withCache(
        cacheKey,
        ttl,
        tags,
        async () => await fetcher(request)
      );

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT", // Indicate cache hit
        },
      });
    } catch (error) {
      console.error("Cache middleware error:", error);

      // Fallback to direct execution
      const response = await fetcher(request);

      return new Response(
        JSON.stringify({
          error: "Cache unavailable",
          data: await response.json(),
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "X-Cache": "MISS", // Indicate cache miss/fallback
          },
        }
      );
    }
  };
}

export { defaultCache, AstroAppCache };
