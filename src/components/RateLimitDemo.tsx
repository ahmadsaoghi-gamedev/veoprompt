/**
 * Demo component showing how to use the rate limit optimization system
 */

import React, { useState, useEffect } from 'react';
import {
    callGeminiAPI,
    getRateLimiterStatus,
    configureRateLimiter
} from '../utils/api-optimized';
import { getSettings } from '../utils/database';
import { APISettings } from '../types';

const RateLimitDemo: React.FC = () => {
    const [apiSettings, setApiSettings] = useState<APISettings | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<string[]>([]);
    const [error, setError] = useState<string>('');
    const [status, setStatus] = useState<ReturnType<typeof getRateLimiterStatus> | null>(null);

    useEffect(() => {
        loadApiSettings();

        // Update status every second
        const interval = setInterval(() => {
            setStatus(getRateLimiterStatus());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const loadApiSettings = async () => {
        try {
            const settings = await getSettings();
            setApiSettings(settings);

            // Initialize rate limiter with multiple API keys if you have them
            // Example: 
            // import { initializeRateLimiter } from '../utils/api-optimized';
            // initializeRateLimiter(['key1', 'key2', 'key3']);
        } catch (error) {
            console.error('Failed to load API settings:', error);
        }
    };

    const makeMultipleRequests = async () => {
        if (!apiSettings || !apiSettings.isActive) {
            setError('Please configure your API key first');
            return;
        }

        setIsLoading(true);
        setError('');
        setResults([]);

        // Make 10 rapid requests to test rate limiting
        const prompts = Array.from({ length: 10 }, (_, i) =>
            `Test request ${i + 1}: Generate a random fact about technology.`
        );

        try {
            for (const prompt of prompts) {
                try {
                    const result = await callGeminiAPI(prompt, undefined, apiSettings);
                    setResults(prev => [...prev, `Request ${prompts.indexOf(prompt) + 1}: ${result}`]);
                } catch (err) {
                    console.error('Request failed:', err);
                    // Continue with other requests even if one fails
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const clearCache = () => {
        configureRateLimiter({ clearCache: true });
        alert('Cache cleared!');
    };

    const clearQueue = () => {
        configureRateLimiter({ clearQueue: true });
        alert('Queue cleared!');
    };

    const resetMetrics = () => {
        configureRateLimiter({ resetMetrics: true });
        alert('Metrics reset!');
    };

    const adjustThrottle = (interval: number) => {
        configureRateLimiter({ throttleInterval: interval });
        alert(`Throttle interval set to ${interval}ms`);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Rate Limit Optimization Demo</h2>

            {/* Status Display */}
            <div className="mb-6 p-4 bg-gray-100 rounded">
                <h3 className="font-bold mb-2">System Status</h3>
                {status && (
                    <div className="space-y-2 text-sm">
                        <div>Queue Length: {status.queue.length}</div>
                        <div>Processing: {status.queue.processing ? 'Yes' : 'No'}</div>
                        <div>Cache Size: {status.cache.size}/{status.cache.maxSize}</div>
                        <div>Total Requests: {status.metrics.totalRequests}</div>
                        <div>Successful: {status.metrics.successfulRequests}</div>
                        <div>Failed: {status.metrics.failedRequests}</div>
                        <div>Avg Response Time: {Math.round(status.metrics.averageResponseTime)}ms</div>
                        <div>Rate Limit Errors: {status.metrics.rateLimitErrors.length}</div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="mb-6 space-y-4">
                <div>
                    <button
                        onClick={makeMultipleRequests}
                        disabled={isLoading || !apiSettings?.isActive}
                        className={`px-4 py-2 rounded text-white ${isLoading || !apiSettings?.isActive
                            ? 'bg-gray-400'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isLoading ? 'Processing...' : 'Make 10 Rapid Requests'}
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={clearCache}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                        Clear Cache
                    </button>
                    <button
                        onClick={clearQueue}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Clear Queue
                    </button>
                    <button
                        onClick={resetMetrics}
                        className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                        Reset Metrics
                    </button>
                </div>

                <div className="flex gap-2 items-center">
                    <span>Throttle Interval:</span>
                    <button
                        onClick={() => adjustThrottle(1000)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        1s
                    </button>
                    <button
                        onClick={() => adjustThrottle(2000)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        2s
                    </button>
                    <button
                        onClick={() => adjustThrottle(5000)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        5s
                    </button>
                </div>
            </div>

            {/* Loading/Error/Status Messages */}
            <div id="loadingSpinner" style={{ display: 'none' }} className="text-blue-600">
                Loading...
            </div>
            <div id="statusMessage" className="mb-4"></div>
            <div id="errorMessage" style={{ display: 'none' }} className="mb-4"></div>
            <div id="queueStatus" style={{ display: 'none' }} className="mb-4 text-sm text-gray-600"></div>

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Results Display */}
            {results.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-bold mb-2">Results:</h3>
                    <div className="space-y-2">
                        {results.map((result, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                                {result}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RateLimitDemo;
