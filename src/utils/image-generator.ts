// Image Generator Utility
// Integration with Gemini API (Supports Image Input)

export interface ImageGenerationResult {
    success: boolean;
    imageData?: string;
    error?: string;
    prompt: string;
    timestamp: Date;
}

// Image generation using Gemini API with image input support, fallback to Pollinations.ai
export async function generateImage(prompt: string, inputImageData?: string): Promise<ImageGenerationResult> {
    try {
        // Import getSettings dynamically to avoid circular dependencies
        const { getSettings } = await import('./database');
        const settings = await getSettings();

        if (!settings?.privateKey || !settings?.isActive) {
            console.log('Gemini API key not found, falling back to Pollinations.ai');
            return await generateImageWithPollinations(prompt);
        }

        // Create the request payload
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

        // Add image input if provided
        if (inputImageData) {
            // Remove data URL prefix if present
            const base64Data = inputImageData.replace(/^data:image\/[a-z]+;base64,/, '');

            requestBody.contents[0].parts.push({
                inlineData: {
                    mimeType: "image/png",
                    data: base64Data
                }
            });
        }

        // Make API call to Gemini 2.5 Flash Image Preview
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${settings.privateKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error?.message || 'Failed to generate image';

            // Handle specific error cases with user-friendly messages
            if (response.status === 429) {
                console.log('Gemini API quota exceeded, falling back to Pollinations.ai');
                return await generateImageWithPollinations(prompt);
            } else if (response.status === 403) {
                throw new Error('API access denied. Please check your API key permissions and billing status.');
            } else if (response.status === 400) {
                throw new Error('Invalid request. Please check your prompt and try again.');
            } else {
                throw new Error(`API Error: ${errorMessage}`);
            }
        }

        const data = await response.json();

        // Extract image data from response
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

    } catch (error) {
        console.error('Image generation error:', error);
        // If Gemini fails, try Pollinations.ai as fallback
        console.log('Gemini API failed, trying Pollinations.ai as fallback');
        return await generateImageWithPollinations(prompt);
    }
}

// Fallback function using Pollinations.ai (free, but no image input support)
async function generateImageWithPollinations(prompt: string): Promise<ImageGenerationResult> {
    try {
        // Pollinations.ai API endpoint
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

        // Add optional parameters for better quality
        const params = new URLSearchParams({
            width: '1024',
            height: '1024',
            seed: Math.floor(Math.random() * 1000000).toString(),
            model: 'flux',
            nologo: 'true'
        });

        const fullUrl = `${pollinationsUrl}?${params.toString()}`;

        console.log('Generating image with Pollinations.ai (fallback):', fullUrl);

        // Make API call to Pollinations.ai
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Accept': 'image/*',
            }
        });

        if (!response.ok) {
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
