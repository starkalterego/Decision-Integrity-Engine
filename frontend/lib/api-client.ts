// Optimized API client with caching and parallel requests

interface FetchOptions extends Omit<RequestInit, 'cache'> {
  cache?: boolean;
  cacheTTL?: number;
}

class OptimizedAPIClient {
  private cache = new Map<string, { data: unknown; expiry: number }>();
  private pendingRequests = new Map<string, Promise<unknown>>();

  private getCacheKey(url: string, options?: RequestInit): string {
    return `${url}:${JSON.stringify(options || {})}`;
  }

  private getFromCache(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache(key: string, data: unknown, ttl: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  async fetch<T = unknown>(url: string, options: FetchOptions = {}): Promise<T> {
    const { cache: useCache = true, cacheTTL = 60000, ...fetchOptions } = options;
    const cacheKey = this.getCacheKey(url, fetchOptions);

    // Check cache
    if (useCache && fetchOptions.method !== 'POST' && fetchOptions.method !== 'PUT' && fetchOptions.method !== 'DELETE') {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached as T;
      }

      // Check if request is already pending (deduplication)
      const pending = this.pendingRequests.get(cacheKey);
      if (pending) {
        return pending as Promise<T>;
      }
    }

    // Make request
    const requestPromise = (async () => {
      try {
        const response = await fetch(url, fetchOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Cache successful responses
        if (useCache && fetchOptions.method !== 'POST' && fetchOptions.method !== 'PUT' && fetchOptions.method !== 'DELETE') {
          this.setCache(cacheKey, data, cacheTTL);
        }
        
        return data;
      } finally {
        this.pendingRequests.delete(cacheKey);
      }
    })();

    // Store pending request
    this.pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }

  async batchFetch<T extends Record<string, string>>(
    requests: T,
    options: FetchOptions = {}
  ): Promise<{ [K in keyof T]: unknown }> {
    const entries = Object.entries(requests);
    const promises = entries.map(async ([key, url]) => {
      try {
        const data = await this.fetch(url as string, options);
        return [key, data];
      } catch (error) {
        console.error(`Batch fetch failed for ${key}:`, error);
        return [key, { success: false, error: error instanceof Error ? error.message : 'Unknown error' }];
      }
    });

    const results = await Promise.all(promises);
    return Object.fromEntries(results) as { [K in keyof T]: unknown };
  }

  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      pendingRequests: this.pendingRequests.size,
    };
  }
}

// Singleton instance
export const apiClient = new OptimizedAPIClient();

// Convenience methods
export const api = {
  get: <T = unknown>(url: string, cacheTTL?: number) =>
    apiClient.fetch<T>(url, { method: 'GET', cacheTTL }),

  post: <T = unknown>(url: string, body: unknown) =>
    apiClient.fetch<T>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: false,
    }),

  put: <T = unknown>(url: string, body: unknown) =>
    apiClient.fetch<T>(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: false,
    }),

  delete: <T = unknown>(url: string) =>
    apiClient.fetch<T>(url, { method: 'DELETE', cache: false }),

  batch: <T extends Record<string, string>>(requests: T, cacheTTL?: number) =>
    apiClient.batchFetch(requests, { cacheTTL }),

  clearCache: (pattern?: string) => apiClient.clearCache(pattern),
};
