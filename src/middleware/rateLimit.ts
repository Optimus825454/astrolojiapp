/**
 * Rate Limiting Middleware for Next.js API Routes
 * Prevents abuse and ensures fair API usage
 */

// Simple in-memory rate limiter (for production, use Redis)
class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isBlocked(key: string): {
    blocked: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now > record.resetTime) {
      // First request or window expired, reset
      this.requests.set(key, { count: 1, resetTime: now + this.windowMs });
      return {
        blocked: false,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs,
      };
    }

    if (record.count >= this.maxRequests) {
      // Rate limit exceeded
      return { blocked: true, remaining: 0, resetTime: record.resetTime };
    }

    // Increment count
    record.count++;
    return {
      blocked: false,
      remaining: this.maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  getRemainingRequests(key: string): number {
    const record = this.requests.get(key);
    return record
      ? Math.max(0, this.maxRequests - record.count)
      : this.maxRequests;
  }

  getResetTime(key: string): number {
    const record = this.requests.get(key);
    return record?.resetTime || Date.now();
  }
}

// Default rate limiter: 100 requests per 15 minutes
const defaultLimiter = new RateLimiter();

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
  keyGenerator?: (request: Request) => string;
}

/**
 * Get client IP from request headers
 */
function getClientIP(request: Request): string {
  // Check various headers for the real client IP
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const remoteAddr = request.headers.get("remote-addr");

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (remoteAddr) {
    return remoteAddr;
  }

  // Fallback to a default IP (in production, use proper client IP detection)
  return "unknown";
}

/**
 * Generate rate limiting key
 */
function generateKey(request: Request, config: RateLimitConfig = {}): string {
  const keyGenerator =
    config.keyGenerator || ((req: Request) => getClientIP(req));
  return keyGenerator(request);
}

/**
 * Apply rate limiting to a Next.js API route handler
 */
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  config: RateLimitConfig = {}
) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.",
    keyGenerator,
  } = config;

  // Create a custom limiter for this route
  const limiter = new RateLimiter(windowMs, maxRequests);

  return async (request: Request): Promise<Response> => {
    const key = generateKey(request, { keyGenerator });
    const result = limiter.isBlocked(key);

    // Add rate limiting headers
    const headers = new Headers({
      "X-RateLimit-Limit": maxRequests.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": Math.ceil(result.resetTime / 1000).toString(),
    });

    if (result.blocked) {
      // Rate limit exceeded
      return new Response(
        JSON.stringify({
          error: message,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429, // Too Many Requests
          headers: {
            ...Object.fromEntries(headers),
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(
              (result.resetTime - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    try {
      // Call the original handler
      const response = await handler(request);

      // Add rate limiting headers to successful responses
      if (response.headers) {
        const responseHeaders = new Headers(response.headers);
        headers.forEach((value, key) => responseHeaders.set(key, value));
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      }

      return response;
    } catch (error) {
      // Even on errors, we should track the request for rate limiting
      console.error(`Rate limited endpoint error for ${key}:`, error);

      return new Response(
        JSON.stringify({
          error: "Internal server error",
          message: "A server error occurred while processing your request.",
        }),
        {
          status: 500,
          headers: {
            ...Object.fromEntries(headers),
            "Content-Type": "application/json",
          },
        }
      );
    }
  };
}

/**
 * Rate limiting for specific endpoints
 */

// Strict rate limiting for AI interpretation (expensive operation)
export const withStrictRateLimit = (
  handler: (request: Request) => Promise<Response>
) =>
  withRateLimit(handler, {
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 5, // Only 5 interpretations per 10 minutes
    message:
      "Yorumlama limiti aşıldı. 10 dakika sonra tekrar deneyebilirsiniz.",
  });

// Moderate rate limiting for calculations
export const withModerateRateLimit = (
  handler: (request: Request) => Promise<Response>
) =>
  withRateLimit(handler, {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 20, // 20 calculations per 5 minutes
    message: "Hesaplama limiti aşıldı. 5 dakika sonra tekrar deneyebilirsiniz.",
  });

// Lenient rate limiting for location search
export const withLenientRateLimit = (
  handler: (request: Request) => Promise<Response>
) =>
  withRateLimit(handler, {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60, // 60 searches per minute
    message: "Arama limiti aşıldı. 1 dakika sonra tekrar deneyebilirsiniz.",
  });

/**
 * Get rate limit status for monitoring
 */
export function getRateLimitStatus(key: string) {
  return {
    remaining: defaultLimiter.getRemainingRequests(key),
    resetTime: defaultLimiter.getResetTime(key),
  };
}

/**
 * Middleware for middleware.ts (Edge Runtime)
 */
export function createRateLimitMiddleware(config: RateLimitConfig = {}) {
  const { windowMs = 15 * 60 * 1000, maxRequests = 100, keyGenerator } = config;

  return function middleware(request: Request) {
    const key = generateKey(request, { keyGenerator });
    const result = defaultLimiter.isBlocked(key);

    if (result.blocked) {
      return new Response(
        JSON.stringify({
          error: "Çok fazla istek. Lütfen daha sonra tekrar deneyin.",
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(
              (result.resetTime - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // Continue to the next middleware or route handler
    return new Response(null, { status: 200 });
  };
}
