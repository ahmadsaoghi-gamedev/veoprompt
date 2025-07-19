/**
 * Rate Limit Optimization System
 * Comprehensive solution for handling API rate limits with multiple strategies
 */


// Types
interface QueuedRequest<T> {
  id: string;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timestamp: number;
  retryCount: number;
  priority: number;
}

interface RateLimitError {
  message: string;
  retryAfter?: number;
  timestamp: number;
}

interface RequestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimitErrors: RateLimitError[];
  averageResponseTime: number;
  lastRequestTime: number;
}

// 1. REQUEST THROTTLING SYSTEM
class RequestThrottler {
  private lastRequestTime: number = 0;
  private minInterval: number = 2000; // 2 seconds between requests
  private queue: Array<() => void> = [];
  private processing: boolean = false;

  async throttle<T>(apiCall: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.minInterval) {
          const waitTime = this.minInterval - timeSinceLastRequest;
          await new Promise(res => setTimeout(res, waitTime));
        }

        this.lastRequestTime = Date.now();

        try {
          const result = await apiCall();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      this.queue.push(executeRequest);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        await request();
      }
    }
    this.processing = false;
  }

  setMinInterval(interval: number) {
    this.minInterval = interval;
  }
}

// 2. EXPONENTIAL BACKOFF IMPLEMENTATION
class ExponentialBackoff {
  private baseDelay: number = 1000; // 1 second
  private maxDelay: number = 32000; // 32 seconds
  private maxRetries: number = 5;

  async execute<T>(
    apiFunction: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await apiFunction();
      } catch (error) {
        lastError = error as Error;

        if (this.isRateLimitError(error)) {
          const waitTime = this.calculateBackoff(attempt);
          console.log(`Rate limit hit. Waiting ${waitTime}ms before retry ${attempt + 1}/${retries}`);

          // Update UI with retry information
          this.notifyUI(waitTime, attempt + 1, retries);

          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          // Non-rate limit error, throw immediately
          throw error;
        }
      }
    }

    throw new Error(`Max retries (${retries}) exceeded. Last error: ${lastError?.message}`);
  }

  private calculateBackoff(attempt: number): number {
    const delay = Math.min(this.baseDelay * Math.pow(2, attempt), this.maxDelay);
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.3 * delay;
    return Math.floor(delay + jitter);
  }

  private isRateLimitError(error: unknown): boolean {
    const err = error as { message?: string; status?: number };
    return err?.message?.toLowerCase().includes('rate limit') ||
      err?.message?.includes('429') ||
      err?.status === 429;
  }

  private notifyUI(waitTime: number, attempt: number, maxAttempts: number) {
    window.dispatchEvent(new CustomEvent('rateLimitRetry', {
      detail: { waitTime, attempt, maxAttempts }
    }));
  }
}

// 3. REQUEST BATCHING SYSTEM
class RequestBatcher<T> {
  private batch: Array<{
    request: () => Promise<T>;
    resolve: (value: T) => void;
    reject: (error: Error) => void;
  }> = [];
  private batchSize: number = 5;
  private processingInterval: number = 10000; // 10 seconds
  private intervalId: number | null = null;
  private throttler: RequestThrottler;

  constructor(throttler: RequestThrottler) {
    this.throttler = throttler;
    this.startBatchProcessor();
  }

  addRequest(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batch.push({ request, resolve, reject });

      if (this.batch.length >= this.batchSize) {
        this.processBatch();
      }
    });
  }

  private async processBatch() {
    const currentBatch = this.batch.splice(0, this.batchSize);

    for (const { request, resolve, reject } of currentBatch) {
      try {
        const result = await this.throttler.throttle(request);
        resolve(result);
      } catch (error) {
        reject(error as Error);
      }

      // Add delay between batch items
      await new Promise(res => setTimeout(res, 1000));
    }
  }

  private startBatchProcessor() {
    this.intervalId = setInterval(() => {
      if (this.batch.length > 0) {
        this.processBatch();
      }
    }, this.processingInterval);
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

// 4. CACHING SYSTEM
class ResponseCache {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private maxAge: number = 300000; // 5 minutes
  private maxSize: number = 100; // Maximum cache entries

  generateKey(params: Record<string, unknown>): string {
    return btoa(JSON.stringify(params));
  }

  get(key: string): unknown | null {
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      console.log('Cache hit for key:', key);
      return cached.data;
    }

    // Remove expired entry
    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  set(key: string, data: unknown): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value as string;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp
      }))
    };
  }
}

// 5. API KEY ROTATION SYSTEM
class APIKeyRotator {
  private keys: string[] = [];
  private currentKeyIndex: number = 0;
  private keyUsageCount: Map<string, number> = new Map();
  private keyLastUsed: Map<string, number> = new Map();
  private rotationInterval: number = 60000; // 1 minute cooldown per key

  constructor(keys: string[]) {
    this.keys = keys;
    this.keys.forEach(key => {
      this.keyUsageCount.set(key, 0);
      this.keyLastUsed.set(key, 0);
    });
  }

  getCurrentKey(): string {
    if (this.keys.length === 0) {
      throw new Error('No API keys available');
    }
    return this.keys[this.currentKeyIndex];
  }

  rotateKey(): string {
    if (this.keys.length <= 1) {
      console.warn('Only one API key available, cannot rotate');
      return this.getCurrentKey();
    }

    const now = Date.now();

    // Find the least recently used key that has cooled down
    let bestKeyIndex = -1;
    let oldestUsage = now;

    for (let i = 0; i < this.keys.length; i++) {
      const key = this.keys[i];
      const lastUsed = this.keyLastUsed.get(key) || 0;

      if (now - lastUsed >= this.rotationInterval && lastUsed < oldestUsage) {
        bestKeyIndex = i;
        oldestUsage = lastUsed;
      }
    }

    // If no key has cooled down, use the least recently used one
    if (bestKeyIndex === -1) {
      bestKeyIndex = 0;
      oldestUsage = now;

      for (let i = 0; i < this.keys.length; i++) {
        const key = this.keys[i];
        const lastUsed = this.keyLastUsed.get(key) || 0;

        if (lastUsed < oldestUsage) {
          bestKeyIndex = i;
          oldestUsage = lastUsed;
        }
      }
    }

    this.currentKeyIndex = bestKeyIndex;
    const selectedKey = this.keys[this.currentKeyIndex];

    // Update usage stats
    this.keyUsageCount.set(selectedKey, (this.keyUsageCount.get(selectedKey) || 0) + 1);
    this.keyLastUsed.set(selectedKey, now);

    console.log(`Rotated to API key ${this.currentKeyIndex + 1}/${this.keys.length}`);
    return selectedKey;
  }

  async makeRequest<T>(apiCall: (key: string) => Promise<T>): Promise<T> {
    try {
      const key = this.getCurrentKey();
      return await apiCall(key);
    } catch (error) {
      if (this.isRateLimitError(error)) {
        console.log('Rate limit hit, rotating API key...');
        const newKey = this.rotateKey();
        return await apiCall(newKey);
      }
      throw error;
    }
  }

  private isRateLimitError(error: unknown): boolean {
    const err = error as { message?: string; status?: number };
    return err?.message?.toLowerCase().includes('rate limit') ||
      err?.message?.includes('429') ||
      err?.status === 429;
  }

  getStats() {
    return {
      totalKeys: this.keys.length,
      currentKeyIndex: this.currentKeyIndex,
      keyUsage: Array.from(this.keyUsageCount.entries()).map(([key, count]) => ({
        key: key.substring(0, 8) + '...',
        usageCount: count,
        lastUsed: this.keyLastUsed.get(key) || 0
      }))
    };
  }
}

// 6. REQUEST QUEUE MANAGEMENT SYSTEM
class RequestQueueManager<T> {
  private queue: QueuedRequest<T>[] = [];
  private processing: boolean = false;
  private maxConcurrent: number = 1;
  private throttler: RequestThrottler;
  private backoff: ExponentialBackoff;
  private nextId: number = 0;

  constructor(throttler: RequestThrottler, backoff: ExponentialBackoff) {
    this.throttler = throttler;
    this.backoff = backoff;
  }

  async addToQueue(
    execute: () => Promise<T>,
    priority: number = 0
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id: `req-${this.nextId++}`,
        execute,
        resolve,
        reject,
        timestamp: Date.now(),
        retryCount: 0,
        priority
      };

      // Insert based on priority
      const insertIndex = this.queue.findIndex(item => item.priority < priority);
      if (insertIndex === -1) {
        this.queue.push(request);
      } else {
        this.queue.splice(insertIndex, 0, request);
      }

      // Notify UI about queue update
      this.notifyQueueUpdate();

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (!request) continue;

      try {
        const result = await this.backoff.execute(() =>
          this.throttler.throttle(request.execute)
        );
        request.resolve(result);
      } catch (error) {
        request.reject(error as Error);
      }

      this.notifyQueueUpdate();
    }

    this.processing = false;
  }

  private notifyQueueUpdate() {
    window.dispatchEvent(new CustomEvent('queueUpdate', {
      detail: {
        queueLength: this.queue.length,
        processing: this.processing
      }
    }));
  }

  getQueueStatus() {
    return {
      length: this.queue.length,
      processing: this.processing,
      items: this.queue.map(item => ({
        id: item.id,
        priority: item.priority,
        age: Date.now() - item.timestamp
      }))
    };
  }

  clearQueue() {
    this.queue.forEach(request => {
      request.reject(new Error('Queue cleared'));
    });
    this.queue = [];
    this.notifyQueueUpdate();
  }
}

// 7. MONITORING AND ANALYTICS
class RequestMonitor {
  private metrics: RequestMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    rateLimitErrors: [],
    averageResponseTime: 0,
    lastRequestTime: 0
  };
  private responseTimes: number[] = [];
  private maxHistorySize: number = 100;

  recordRequest(startTime: number, success: boolean, error?: Error) {
    const responseTime = Date.now() - startTime;
    this.metrics.totalRequests++;

    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;

      if (error && this.isRateLimitError(error)) {
        this.metrics.rateLimitErrors.push({
          message: error.message,
          timestamp: Date.now()
        });

        // Keep only recent errors
        if (this.metrics.rateLimitErrors.length > 10) {
          this.metrics.rateLimitErrors.shift();
        }
      }
    }

    // Update response times
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > this.maxHistorySize) {
      this.responseTimes.shift();
    }

    // Calculate average
    this.metrics.averageResponseTime =
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;

    this.metrics.lastRequestTime = Date.now();

    // Check for high error rate
    this.checkErrorRate();
  }

  private checkErrorRate() {
    const recentErrors = this.metrics.rateLimitErrors.filter(
      error => Date.now() - error.timestamp < 300000 // Last 5 minutes
    );

    if (recentErrors.length > 3) {
      console.warn('High rate limit error frequency detected');
      window.dispatchEvent(new CustomEvent('highErrorRate', {
        detail: {
          errorCount: recentErrors.length,
          timeWindow: '5 minutes'
        }
      }));
    }
  }

  private isRateLimitError(error: Error): boolean {
    return error.message.toLowerCase().includes('rate limit') ||
      error.message.includes('429');
  }

  getMetrics(): RequestMetrics {
    return { ...this.metrics };
  }

  reset() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimitErrors: [],
      averageResponseTime: 0,
      lastRequestTime: 0
    };
    this.responseTimes = [];
  }
}

// 8. MAIN RATE LIMITER CLASS
export class RateLimiter {
  private throttler: RequestThrottler;
  private backoff: ExponentialBackoff;
  private batcher: RequestBatcher<unknown>;
  private cache: ResponseCache;
  private keyRotator: APIKeyRotator | null = null;
  private queueManager: RequestQueueManager<unknown>;
  private monitor: RequestMonitor;

  constructor(apiKeys?: string[]) {
    this.throttler = new RequestThrottler();
    this.backoff = new ExponentialBackoff();
    this.batcher = new RequestBatcher(this.throttler);
    this.cache = new ResponseCache();
    this.queueManager = new RequestQueueManager(this.throttler, this.backoff);
    this.monitor = new RequestMonitor();

    if (apiKeys && apiKeys.length > 0) {
      this.keyRotator = new APIKeyRotator(apiKeys);
    }
  }

  // Main method to make rate-limited API calls
  async makeRequest<T>(
    apiCall: (apiKey?: string) => Promise<T>,
    options: {
      cacheKey?: string;
      priority?: number;
      useCache?: boolean;
      useBatching?: boolean;
    } = {}
  ): Promise<T> {
    const startTime = Date.now();

    try {
      // Check cache first
      if (options.useCache && options.cacheKey) {
        const cached = this.cache.get(options.cacheKey);
        if (cached) {
          this.monitor.recordRequest(startTime, true);
          return cached as T;
        }
      }

      // Prepare the API call with key rotation if available
      const wrappedCall = async () => {
        if (this.keyRotator) {
          return await this.keyRotator.makeRequest(apiCall);
        } else {
          return await apiCall();
        }
      };

      // Execute based on options
      let result: T;

      if (options.useBatching) {
        result = await this.batcher.addRequest(wrappedCall) as T;
      } else {
        result = await this.queueManager.addToQueue(wrappedCall, options.priority || 0) as T;
      }

      // Cache successful result
      if (options.useCache && options.cacheKey) {
        this.cache.set(options.cacheKey, result);
      }

      this.monitor.recordRequest(startTime, true);
      return result;

    } catch (error) {
      this.monitor.recordRequest(startTime, false, error as Error);
      throw error;
    }
  }

  // Configuration methods
  setThrottleInterval(interval: number) {
    this.throttler.setMinInterval(interval);
  }

  // Status and monitoring
  getStatus() {
    return {
      queue: this.queueManager.getQueueStatus(),
      cache: this.cache.getStats(),
      keyRotator: this.keyRotator?.getStats(),
      metrics: this.monitor.getMetrics()
    };
  }

  clearCache() {
    this.cache.clear();
  }

  clearQueue() {
    this.queueManager.clearQueue();
  }

  resetMetrics() {
    this.monitor.reset();
  }

  destroy() {
    this.batcher.destroy();
    this.clearQueue();
    this.clearCache();
  }
}

// 9. UI HELPER FUNCTIONS
export class RateLimitUIHelper {
  static showProcessingState(message: string = 'Processing your request...') {
    const generateBtn = document.getElementById('generateBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const statusMessage = document.getElementById('statusMessage');

    if (generateBtn) generateBtn.setAttribute('disabled', 'true');
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    if (statusMessage) statusMessage.textContent = message;
  }

  static showRateLimitWarning(waitTime: number) {
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) {
      statusMessage.textContent = `Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)} seconds before retry...`;
      statusMessage.className = 'text-yellow-600 bg-yellow-50 p-2 rounded';
    }
  }

  static showError(error: string) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
      errorMessage.textContent = error;
      errorMessage.className = 'text-red-600 bg-red-50 p-2 rounded mt-2';
      errorMessage.style.display = 'block';
    }
  }

  static hideProcessingState() {
    const generateBtn = document.getElementById('generateBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const statusMessage = document.getElementById('statusMessage');

    if (generateBtn) generateBtn.removeAttribute('disabled');
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (statusMessage) statusMessage.textContent = '';
  }

  static updateQueueStatus(queueLength: number, processing: boolean) {
    const queueStatus = document.getElementById('queueStatus');
    if (queueStatus) {
      queueStatus.textContent = `Queue: ${queueLength} requests ${processing ? '(processing...)' : ''}`;
      queueStatus.style.display = queueLength > 0 ? 'block' : 'none';
    }
  }
}

// 10. ERROR HANDLER
export class RateLimitErrorHandler {
  static handle(error: Error): { message: string; retryAfter?: number } {
    let message = 'Something went wrong. ';
    let retryAfter: number | undefined;

    if (error.message.toLowerCase().includes('rate limit')) {
      message = "Too many requests. We'll automatically retry in a moment...";
      retryAfter = this.extractWaitTime(error.message) || 60;
    } else if (error.message.includes('invalid key')) {
      message = 'API key issue. Please check your configuration.';
    } else if (error.message.includes('quota')) {
      message = 'API quota exceeded. Please try again later or check your usage limits.';
    } else if (error.message.includes('network')) {
      message = 'Network error. Please check your connection and try again.';
    }

    return { message, retryAfter };
  }

  private static extractWaitTime(errorMessage: string): number | null {
    const match = errorMessage.match(/wait (\d+) seconds?/i);
    return match ? parseInt(match[1]) : null;
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();
