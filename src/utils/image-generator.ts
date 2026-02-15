// Image Generator Utility
// Integration with Gemini API (Supports Image Input)

export interface ImageGenerationResult {
    success: boolean;
    imageData?: string;
    imageUrl?: string;
    error?: string;
    prompt: string;
    timestamp: Date;
}

export type ImageAspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface ImageGenerationOptions {
    aspectRatio?: ImageAspectRatio;
}

declare global {
    interface Window {
        puter?: {
            ai?: {
                txt2img: (prompt: string, options?: Record<string, unknown>) => Promise<HTMLImageElement>;
            };
        };
    }
}

// Image generation using Gemini API with image input support, fallback to Pollinations.ai
let puterScriptPromise: Promise<void> | null = null;
let cachedGeminiImageModels: string[] | null = null;
let cachedGeminiImageModelsAt = 0;

function applyAspectRatioToPrompt(prompt: string, aspectRatio?: ImageAspectRatio): string {
    if (!aspectRatio || aspectRatio === '1:1') {
        return prompt;
    }
    return `${prompt}\nAspect ratio: ${aspectRatio}`;
}

function getDimensionsFromAspectRatio(aspectRatio?: ImageAspectRatio): { width: number; height: number } {
    const maxSize = 1024;
    switch (aspectRatio) {
        case '16:9':
            return { width: maxSize, height: Math.round(maxSize * 9 / 16) };
        case '9:16':
            return { width: Math.round(maxSize * 9 / 16), height: maxSize };
        case '4:3':
            return { width: maxSize, height: Math.round(maxSize * 3 / 4) };
        case '3:4':
            return { width: Math.round(maxSize * 3 / 4), height: maxSize };
        default:
            return { width: maxSize, height: maxSize };
    }
}

async function loadPuterScript(): Promise<void> {
    if (typeof window === 'undefined') {
        throw new Error('Puter.js is only available in the browser');
    }
    if (window.puter?.ai?.txt2img) {
        return;
    }
    if (puterScriptPromise) {
        return puterScriptPromise;
    }
    puterScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://js.puter.com/v2/';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Puter.js'));
        document.head.appendChild(script);
    });
    return puterScriptPromise;
}

async function generateImageWithPuter(prompt: string): Promise<ImageGenerationResult> {
    await loadPuterScript();
    if (!window.puter?.ai?.txt2img) {
        throw new Error('Puter.js is not available');
    }
    const imageElement = await window.puter.ai.txt2img(prompt, { model: 'gemini-2.5-flash-image-preview' });
    const imageUrl = imageElement?.src;
    if (!imageUrl) {
        throw new Error('No image data returned by Puter.js');
    }
    return {
        success: true,
        imageUrl,
        prompt,
        timestamp: new Date()
    };
}

async function generateImageWithPuterOrPollinations(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult> {
    try {
        return await generateImageWithPuter(prompt);
    } catch (error) {
        console.warn('Puter.js image generation failed:', error);
        return await generateImageWithPollinations(prompt, options);
    }
}

async function fetchGeminiImageModels(apiKey: string): Promise<string[]> {
    const now = Date.now();
    if (cachedGeminiImageModels && now - cachedGeminiImageModelsAt < 10 * 60 * 1000) {
        return cachedGeminiImageModels;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) {
        throw new Error('Failed to list Gemini models');
    }
    const data = await response.json();
    const models = Array.isArray(data.models) ? data.models : [];
    const imageModels = models
        .filter((model: { name?: string; displayName?: string; supportedGenerationMethods?: string[] }) => {
            const supportsGenerate = Array.isArray(model.supportedGenerationMethods) && model.supportedGenerationMethods.includes('generateContent');
            const name = model.name?.toLowerCase() || '';
            const displayName = model.displayName?.toLowerCase() || '';
            return supportsGenerate && (name.includes('image') || displayName.includes('image'));
        })
        .map((model: { name?: string }) => (model.name || '').replace(/^models\//, ''))
        .filter((name: string) => name.length > 0);

    cachedGeminiImageModels = imageModels;
    cachedGeminiImageModelsAt = now;
    return imageModels;
}

async function callGeminiImageGenerate(prompt: string, inputImageData: string | undefined, apiKey: string, model: string): Promise<ImageGenerationResult> {
    const requestBody: {
        contents: Array<{
            parts: Array<{
                text?: string;
                inlineData?: {
                    mimeType: string;
                    data: string;
                };
            }>;
        }>;
    } = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };

    if (inputImageData) {
        const base64Data = inputImageData.replace(/^data:image\/[a-z]+;base64,/, '');
        requestBody.contents[0].parts.push({
            inlineData: {
                mimeType: "image/png",
                data: base64Data
            }
        });
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || 'Failed to generate image';
        throw new Error(errorMessage);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const content = data.candidates[0].content;
        if (content.parts && content.parts.length > 0) {
            for (const part of content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return {
                        success: true,
                        imageData: part.inlineData.data,
                        prompt,
                        timestamp: new Date()
                    };
                }
            }
        }
    }

    throw new Error('No image data found in API response');
}

export async function generateImage(prompt: string, inputImageData?: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const finalPrompt = applyAspectRatioToPrompt(prompt, options?.aspectRatio);
    try {
        const { getSettings } = await import('./database');
        const settings = await getSettings();

        if (!settings?.privateKey || !settings?.isActive) {
            console.log('Gemini API key not found, falling back to Pollinations.ai');
            return await generateImageWithPollinations(finalPrompt, options);
        }

        let imageModels: string[] = [];
        try {
            imageModels = await fetchGeminiImageModels(settings.privateKey);
        } catch (error) {
            console.warn('Failed to list Gemini image models:', error);
        }

        const preferredModels = ['gemini-3-pro-image-preview', 'gemini-2.5-flash-image-preview'];
        const modelsToTry = [...new Set([...preferredModels, ...imageModels])];

        for (const model of modelsToTry) {
            try {
                return await callGeminiImageGenerate(finalPrompt, inputImageData, settings.privateKey, model);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                if (message.includes('not found') || message.includes('not supported')) {
                    continue;
                }
                if (message.includes('API_KEY_INVALID') || message.includes('API key')) {
                    throw new Error('API access denied. Please check your API key permissions and billing status.');
                }
                if (message.toLowerCase().includes('quota') || message.includes('429')) {
                    console.log('Gemini API quota exceeded, falling back to Puter.js');
                    return await generateImageWithPuterOrPollinations(finalPrompt, options);
                }
                throw new Error(`API Error: ${message}`);
            }
        }

        console.log('No available Gemini image models, falling back to Puter.js');
        return await generateImageWithPuterOrPollinations(finalPrompt, options);
    } catch (error) {
        console.error('Image generation error:', error);
        console.log('Gemini API failed, trying Puter.js as fallback');
        return await generateImageWithPuterOrPollinations(finalPrompt, options);
    }
}

// Fallback function using Pollinations.ai (free, but no image input support)
async function generateImageWithPollinations(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult> {
    try {
        const { width, height } = getDimensionsFromAspectRatio(options?.aspectRatio);
        const sanitizedPrompt = prompt.replace(/[`]/g, '').trim();
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(sanitizedPrompt)}`;
        const genPollinationsUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(sanitizedPrompt)}`;

        // Add optional parameters for better quality
        const params = new URLSearchParams({
            width: width.toString(),
            height: height.toString(),
            seed: Math.floor(Math.random() * 1000000).toString(),
            model: 'flux',
            nologo: 'true'
        });

        const legacyUrl = `${pollinationsUrl}?${params.toString()}`;
        const genUrl = `${genPollinationsUrl}?${params.toString()}`;

        console.log('Generating image with Pollinations.ai (fallback):', genUrl);

        let response = await fetch(genUrl, {
            method: 'GET',
            headers: {
                'Accept': 'image/*',
            }
        });

        if (!response.ok) {
            response = await fetch(legacyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'image/*',
                }
            });
        }

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Pollinations.ai access denied or rate-limited. Please try again later.');
            }
            throw new Error(`Pollinations.ai API error: ${response.status} ${response.statusText}`);
        }

        // Convert image to base64
        const imageBlob = await response.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        return {
            success: true,
            imageData: base64String,
            prompt,
            timestamp: new Date()
        };

    } catch (error) {
        console.error('Pollinations.ai fallback error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Both Gemini API and Pollinations.ai failed',
            prompt,
            timestamp: new Date()
        };
    }
}

// Enhanced prompt generation for better image results
export function enhancePrompt(basePrompt: string, style?: string, quality?: string): string {
    let enhancedPrompt = basePrompt;

    // Add quality enhancements
    if (quality === 'high') {
        enhancedPrompt += ', high resolution, detailed, sharp focus, professional quality';
    } else if (quality === 'ultra') {
        enhancedPrompt += ', ultra high resolution, extremely detailed, crystal clear, professional studio quality';
    }

    // Add style enhancements
    if (style === 'photorealistic') {
        enhancedPrompt += ', photorealistic, realistic lighting, natural colors';
    } else if (style === 'artistic') {
        enhancedPrompt += ', artistic, creative composition, expressive style';
    } else if (style === 'minimalist') {
        enhancedPrompt += ', minimalist, clean composition, simple design';
    } else if (style === 'vintage') {
        enhancedPrompt += ', vintage style, retro aesthetic, classic composition';
    }

    return enhancedPrompt;
}

// Batch image generation
export async function generateBatchImages(prompts: string[]): Promise<ImageGenerationResult[]> {
    const results: ImageGenerationResult[] = [];

    for (const prompt of prompts) {
        const result = await generateImage(prompt);
        results.push(result);

        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
}

// Image generation with retry logic
export async function generateImageWithRetry(
    prompt: string,
    maxRetries: number = 3
): Promise<ImageGenerationResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await generateImage(prompt);
            if (result.success) {
                return result;
            }
            lastError = new Error(result.error || 'Unknown error');
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }

    return {
        success: false,
        error: lastError?.message || 'Max retries exceeded',
        prompt,
        timestamp: new Date()
    };
}

// Prompt templates for different image types
export const PROMPT_TEMPLATES = {
    portrait: "A {style} portrait of {subject}, {lighting}, {background}, {camera_angle}, {quality}",
    landscape: "A {style} landscape showing {scene}, {weather}, {time_of_day}, {composition}, {quality}",
    product: "A {style} product photograph of {product}, {lighting}, {background}, {angle}, {quality}",
    logo: "A {style} logo design for {brand}, {colors}, {style_description}, {quality}",
    illustration: "A {style} illustration of {subject}, {art_style}, {colors}, {composition}, {quality}",
    abstract: "An {style} abstract composition featuring {elements}, {colors}, {textures}, {quality}"
};

// Generate prompt from template
export function generatePromptFromTemplate(
    template: keyof typeof PROMPT_TEMPLATES,
    variables: Record<string, string>
): string {
    let prompt = PROMPT_TEMPLATES[template];

    // Replace variables in template
    Object.entries(variables).forEach(([key, value]) => {
        prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    return prompt;
}
