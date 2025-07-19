/**
 * Optimized API module with integrated rate limiting
 */

import { APISettings } from '../types';
import { rateLimiter, RateLimitUIHelper, RateLimitErrorHandler } from './rateLimiter';

// Re-export all functions from api-fixed.ts
export * from './api-fixed';

// Import the original callGeminiAPI to wrap it
import { callGeminiAPI as originalCallGeminiAPI } from './api-fixed';

/**
 * Enhanced callGeminiAPI with rate limiting
 */
export async function callGeminiAPI(
    prompt: string,
    imageBase64?: string,
    apiSettings?: APISettings
): Promise<string> {
    // Generate cache key for this request
    const cacheKey = JSON.stringify({
        prompt: prompt.substring(0, 100), // Use first 100 chars for cache key
        hasImage: !!imageBase64,
        apiKey: apiSettings?.privateKey?.substring(0, 8) // Use partial key for cache
    });

    try {
        // Show processing state
        RateLimitUIHelper.showProcessingState('Processing your request...');

        // Make the API call with rate limiting
        const result = await rateLimiter.makeRequest(
            async (apiKey?: string) => {
                // If apiKey is provided by rate limiter (from rotation), use it
                const settings: APISettings | undefined = apiKey
                    ? {
                        privateKey: apiKey,
                        usePrivateKey: apiSettings?.usePrivateKey ?? true,
                        isActive: apiSettings?.isActive ?? true,
                        lastValidated: apiSettings?.lastValidated ?? null
                    }
                    : apiSettings;
                return await originalCallGeminiAPI(prompt, imageBase64, settings);
            },
            {
                cacheKey,
                useCache: !imageBase64, // Only cache text-only requests
                priority: imageBase64 ? 1 : 0, // Higher priority for image requests
                useBatching: false // Don't batch API calls for better UX
            }
        );

        // Hide processing state on success
        RateLimitUIHelper.hideProcessingState();

        return result;
    } catch (error) {
        // Handle errors with user-friendly messages
        const errorInfo = RateLimitErrorHandler.handle(error as Error);
        RateLimitUIHelper.showError(errorInfo.message);
        RateLimitUIHelper.hideProcessingState();

        throw error;
    }
}

/**
 * Initialize rate limiter with multiple API keys if available
 */
export function initializeRateLimiter(apiKeys?: string[]) {
    if (apiKeys && apiKeys.length > 0) {
        // Create new rate limiter instance with API keys
        const RateLimiterClass = rateLimiter.constructor as new (apiKeys: string[]) => typeof rateLimiter;
        const newRateLimiter = new RateLimiterClass(apiKeys);

        // Copy over the singleton instance properties
        Object.assign(rateLimiter, newRateLimiter);
    }
}

/**
 * Get rate limiter status for monitoring
 */
export function getRateLimiterStatus() {
    return rateLimiter.getStatus();
}

/**
 * Configure rate limiter settings
 */
export function configureRateLimiter(options: {
    throttleInterval?: number;
    clearCache?: boolean;
    clearQueue?: boolean;
    resetMetrics?: boolean;
}) {
    if (options.throttleInterval) {
        rateLimiter.setThrottleInterval(options.throttleInterval);
    }

    if (options.clearCache) {
        rateLimiter.clearCache();
    }

    if (options.clearQueue) {
        rateLimiter.clearQueue();
    }

    if (options.resetMetrics) {
        rateLimiter.resetMetrics();
    }
}

// Listen for rate limit events and update UI
if (typeof window !== 'undefined') {
    window.addEventListener('rateLimitRetry', (event: Event) => {
        const customEvent = event as CustomEvent;
        const { waitTime, attempt, maxAttempts } = customEvent.detail;
        RateLimitUIHelper.showRateLimitWarning(waitTime);
        console.log(`Rate limit retry: attempt ${attempt}/${maxAttempts}, waiting ${waitTime}ms`);
    });

    window.addEventListener('queueUpdate', (event: Event) => {
        const customEvent = event as CustomEvent;
        const { queueLength, processing } = customEvent.detail;
        RateLimitUIHelper.updateQueueStatus(queueLength, processing);
    });

    window.addEventListener('highErrorRate', (event: Event) => {
        const customEvent = event as CustomEvent;
        const { errorCount, timeWindow } = customEvent.detail;
        console.warn(`High error rate detected: ${errorCount} errors in ${timeWindow}`);

        // Automatically increase throttle interval when high error rate is detected
        const currentInterval = 2000; // Default interval
        const newInterval = Math.min(currentInterval * 2, 10000); // Double interval, max 10s

        rateLimiter.setThrottleInterval(newInterval);
        console.log(`Increased throttle interval to ${newInterval}ms due to high error rate`);
    });
}

// Export rate limiter utilities
export { rateLimiter, RateLimitUIHelper, RateLimitErrorHandler };
