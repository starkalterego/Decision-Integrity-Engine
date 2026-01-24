/**
 * Rate limiting configuration for API routes
 * Prevents brute force attacks and API abuse
 */

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

// Clean up expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
            delete store[key];
        }
    });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    windowMs: number;  // Time window in milliseconds
    maxRequests: number;  // Max requests per window
}

export const rateLimitConfigs = {
    // Strict limit for login attempts
    login: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5
    },
    // General API limit
    api: {
        windowMs: 1 * 60 * 1000, // 1 minute
        maxRequests: 100
    },
    // Stricter limit for create operations
    create: {
        windowMs: 1 * 60 * 1000, // 1 minute
        maxRequests: 20
    }
};

/**
 * Check if request should be rate limited
 * @param identifier - Unique identifier (usually IP address or user ID)
 * @param config - Rate limit configuration
 * @returns Object with allowed flag and retry info
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
} {
    const now = Date.now();
    const key = identifier;
    
    // Initialize or reset if window expired
    if (!store[key] || store[key].resetTime < now) {
        store[key] = {
            count: 0,
            resetTime: now + config.windowMs
        };
    }
    
    const entry = store[key];
    entry.count++;
    
    const allowed = entry.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - entry.count);
    
    return {
        allowed,
        remaining,
        resetTime: entry.resetTime
    };
}

/**
 * Get client identifier from request
 * Uses IP address or forwarded IP from proxy
 */
export function getClientIdentifier(request: Request): string {
    // Try to get real IP from headers (for proxies/load balancers)
    const headers = request.headers;
    const forwardedFor = headers.get('x-forwarded-for');
    const realIp = headers.get('x-real-ip');
    
    if (forwardedFor) {
        // x-forwarded-for can be a comma-separated list
        return forwardedFor.split(',')[0].trim();
    }
    
    if (realIp) {
        return realIp;
    }
    
    // Fallback to a default identifier
    return 'unknown';
}
