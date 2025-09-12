// Image Generator Utility
// Integration with Pollinations.ai (Free Text-to-Image API)

export interface ImageGenerationResult {
    success: boolean;
    imageData?: string;
    error?: string;
    prompt: string;
    timestamp: Date;
}

// Image generation using Pollinations.ai
export async function generateImage(prompt: string): Promise<ImageGenerationResult> {
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

        console.log('Generating image with Pollinations.ai:', fullUrl);

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
        console.error('Image generation error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
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
