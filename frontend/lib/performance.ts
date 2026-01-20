// Performance optimization utilities for React components

import { useCallback, useRef, useEffect } from 'react';

/**
 * Debounce hook for input handlers
 * Delays execution until after wait milliseconds have elapsed since last call
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * Throttle hook for frequent operations
 * Ensures callback is called at most once per specified interval
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const inThrottle = useRef(false);

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    },
    [callback, limit]
  );
}

/**
 * Cache API responses with TTL (Time To Live)
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.timestamp) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

export const apiCache = new APICache();

/**
 * Cached fetch function
 */
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit,
  ttl?: number
): Promise<T> {
  const cacheKey = `${url}:${JSON.stringify(options || {})}`;
  
  // Try to get from cache
  const cached = apiCache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch fresh data
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Cache the result
  apiCache.set(cacheKey, data, ttl);
  
  return data;
}

/**
 * Batch multiple API calls
 */
export async function batchFetch<T extends Record<string, string>>(
  requests: T
): Promise<{ [K in keyof T]: unknown }> {
  const entries = Object.entries(requests);
  const promises = entries.map(async ([key, url]) => {
    try {
      const response = await fetch(url as string);
      const data = await response.json();
      return [key, data];
    } catch (error) {
      console.error(`Failed to fetch ${key}:`, error);
      return [key, null];
    }
  });

  const results = await Promise.all(promises);
  return Object.fromEntries(results) as { [K in keyof T]: unknown };
}

/**
 * Optimistic UI update helper
 */
export function optimisticUpdate<T>(
  current: T[],
  newItem: T,
  predicate: (item: T) => boolean
): T[] {
  const exists = current.some(predicate);
  if (exists) {
    return current.map((item) => (predicate(item) ? newItem : item));
  }
  return [...current, newItem];
}

/**
 * Local storage cache with expiry
 */
export const localCache = {
  set(key: string, value: unknown, ttl: number = 3600000) {
    const item = {
      value,
      expiry: Date.now() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  get<T>(key: string): T | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value as T;
    } catch {
      return null;
    }
  },

  clear(key?: string) {
    if (key) {
      localStorage.removeItem(key);
    } else {
      localStorage.clear();
    }
  },
};
