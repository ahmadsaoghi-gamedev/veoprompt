import { APISettings, VideoPromptWithOptimization, Frame, FrameTransition, TrackedCharacter, MultiFrameAnalysis, MultiFramePromptResult } from '../types';

interface LanguageOptions {
    Language: string;
    Accent: string;
}

export async function callGeminiAPI(
    prompt: string,
    imageBase64?: string,
    apiSettings?: APISettings
): Promise<string> {
    const apiKey = apiSettings?.privateKey;

    if (!apiKey || !apiKey.trim()) {
        throw new Error('API key is required. Please configure your Google Generative Language API key in the API Settings.');
    }

    const parts: Array<{ text: string } | { inlineData: { mimeType: string, data: string } }> = [{ text: prompt }];
    if (imageBase64) {
        parts.push({
            inlineData: {
                mimeType: "image/png",
                data: imageBase64.split(',')[1]
            }
        });
    }

    const payload = {
        contents: [{
            role: "user",
            parts: parts
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
        }
    };

    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 1000; // 1 second

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }
            );

            if (response.status === 503) {
                if (attempt < MAX_RETRIES) {
                    console.warn(`Attempt ${attempt}: Received 503 Service Unavailable. Retrying in ${RETRY_DELAY_MS}ms...`);
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                    continue; // Retry the loop
                } else {
                    throw new Error(`API Error (503): Service Unavailable after ${MAX_RETRIES} retries.`);
                }
            }

            if (!response.ok) {
                let errorMessage = 'API request failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error?.message || errorMessage;
                } catch {
                    // If error response is not JSON, use status text
                    errorMessage = response.statusText || errorMessage;
                }

                if (response.status === 400 && errorMessage.includes('API_KEY_INVALID')) {
                    throw new Error('Invalid API key. Please check your Google Generative Language API key in the API Settings and ensure it has the correct permissions.');
                }

                if (response.status === 403) {
                    if (errorMessage.includes('quota')) {
                        throw new Error('API quota exceeded. Please check your Google Cloud Console for usage limits or try again later.');
                    }
                    if (errorMessage.includes('API key')) {
                        throw new Error('API key access denied. Please ensure the Generative Language API is enabled in your Google Cloud Console.');
                    }
                }

                if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please wait a moment before making another request.');
                }

                throw new Error(`API Error (${response.status}): ${errorMessage}`);
            }

            const result = await response.json();
            if (result.candidates?.[0]?.content?.parts?.[0]) {
                let text = result.candidates[0].content.parts[0].text;

                // Enhanced text cleaning for better JSON extraction
                text = text.trim();

                // Remove markdown code blocks more aggressively
                text = text.replace(/^```(?:json)?\s*\n?/gm, '');
                text = text.replace(/\n?```\s*$/gm, '');

                // Remove markdown formatting
                text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold markdown
                text = text.replace(/###\s*(.*?)$/gm, '$1'); // Remove heading markdown
                text = text.replace(/^\s*[-*]\s*/gm, ''); // Remove bullet points

                // Try to extract JSON if the response contains other text
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    text = jsonMatch[0];
                }

                // Final cleanup
                text = text.trim();

                return text;
            } else {
                console.error('Unexpected API response structure:', result);
                throw new Error('Unexpected API response format');
            }
        } catch (error) {
            // If the error is not a 503 and we are not at the last attempt, re-throw to be caught by the loop.
            // If it is the last attempt or not a 503, let the outer catch handle it.
            if (error instanceof Error && error.message.includes('503') && attempt < MAX_RETRIES) {
                // This error will be caught by the loop's `continue` logic if it's a 503.
                // If it's another error, it will fall through to the outer catch.
                throw error;
            } else {
                // For any other error, or if it's the last retry for 503, re-throw to be caught by the outer catch.
                throw error;
            }
        }
    }
    // If the loop finishes without returning, it means all retries failed or a non-retryable error occurred.
    // The last thrown error will be caught by the outer catch block.
    // This part of the code should ideally not be reached if an error is thrown.
    // However, to satisfy TypeScript, we might need a return or throw here.
    // Let's ensure the error is thrown if the loop completes without success.
    throw new Error(`Failed to call Gemini API after ${MAX_RETRIES} attempts.`);
}

export async function validateAPIKey(apiKey: string): Promise<{ isValid: boolean; error?: string }> {
    try {
        if (!apiKey || !apiKey.trim()) {
            return { isValid: false, error: 'API key cannot be empty' };
        }

        // Check if API key format is correct (Google API keys typically start with 'AIza')
        if (!apiKey.startsWith('AIza')) {
            return { isValid: false, error: 'Invalid API key format. Google API keys should start with "AIza"' };
        }

        const testPrompt = "Say 'API key is valid' in one sentence.";
        await callGeminiAPI(testPrompt, undefined, {
            usePrivateKey: true,
            privateKey: apiKey,
            isActive: true,
            lastValidated: null
        });
        return { isValid: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
        return { isValid: false, error: errorMessage };
    }
}

export async function generateKeyImagePrompt(
    userIdea: string,
    apiSettings?: APISettings
): Promise<string> {
    const prompt = `Act as an elite AI prompt engineer specialized in cinematic 3D animations. Craft a highly vivid and evocative image prompt based on this idea: "${userIdea}"

The prompt must include these elements:
1. Main Subject: Describe the main character or object in rich detail, including dynamic pose, expressive face, unique attire, and striking features.
2. Setting & Background: Design an immersive, story-driven environment that complements the subject with depth and mood.
3. Art Style: Select a style like 'cinematic digital painting', 'hyperrealistic 3D render', or 'epic surreal concept art'.
4. Lighting: Specify dramatic and atmospheric lighting such as 'cinematic backlight', 'soft volumetric glow', or 'moody spotlight'.
5. Technical Parameters: Add technical specs like '4K, ultra-detailed, photorealistic, --ar 16:9'.

Return ONLY the final image prompt text without any commentary or formatting.

**CRITICAL RULE:** 
"Final image prompt must be under 800 characters. Use concise, impactful language that maximizes visual clarity and cinematic impression."`;

    return await callGeminiAPI(prompt, undefined, apiSettings);
}

export async function generateVideoPromptsFromImage(
    userIdea: string,
    keyImage: string,
    languageOptions: LanguageOptions,
    apiSettings?: APISettings
): Promise<{
    video_prompts: {
        scenePrompt: string;
        narasi: string;
        dialog_en: string;
        dialog_id: string;
        veo3_optimized_prompt: string;
    }[]
}> {
    const Language_dipilih = languageOptions.Language;
    const genre_tone = "Cinematic, narrative-driven";

    const dynamicPrompt = `
**SISTEM INSTRUKSI UTAMA:**
Anda adalah penulis skenario profesional spesialis animasi 3D berkualitas tinggi untuk Gemini Veo3.

**ATURAN KRITIS:**

1. **ANTI-HAK CIPTA (WAJIB):**
   - DILARANG menggunakan karakter, nama, desain, atau elemen visual dari properti berhak cipta
   - Semua elemen WAJIB 100% orisinal

2. **KONSISTENSI DIALOG:**
   - Setiap scene HARUS memiliki minimal 2 karakter yang berbicara
   - Format dialog harus konsisten: "NAMA_KARAKTER: (ekspresi) dialog"
   - Dialog dalam Language Indonesia harus menggunakan format yang sama dengan dialog English

**TUGAS UTAMA:**
Generate JSON dengan 8 scene prompts dengan dialog yang jelas antar karakter.

**STRUKTUR OUTPUT JSON:**

{
  "video_prompts": [
    {
      "scenePrompt": "[Language: INGGRIS] Deskripsi visual scene yang detail. WAJIB mencakup: setting, komposisi shot, pencahayaan, gerakan kamera, aksi karakter, dan PENTING: jelaskan dengan detail kapan setiap karakter berbicara dengan mouth movement dan facial expressions.",
      
      "narasi": "[Language: INDONESIA] Narasi voice-over yang engaging.",
      
      "dialog_en": "[String] Dialog Master Language Inggris. Format: '[KARAKTER_A: (emotion), dialog]' dan '[KARAKTER_B: (emotion), dialog]'.",
      
      "dialog_id": "[String] Adaptasi Kreatif Language Indonesia Gaul. Format HARUS identik dengan dialog_en dalam hal urutan speaker dan jumlah baris. Contoh: '[Karakter: (ekspresi), dialog]'",
      
      "veo3_optimized_prompt": "[Language: CAMPURAN TERSTRUKTUR] Prompt teroptimasi untuk Veo3 dengan instruksi spesifik tentang character speaking assignment."
    }
    // ... total 8 scenes
  ]
}

**IDE CERITA:**
${userIdea}

**Language DIALOG:**
${Language_dipilih}

**GENRE/TONE YANG DIMINTA:**
${genre_tone}

Hasilkan JSON dengan 8 scene prompts yang memastikan dialog multi-karakter yang jelas dengan sistem dialog sinkron.`;

    const response = await callGeminiAPI(dynamicPrompt, keyImage, apiSettings);
    const result = JSON.parse(response);

    // Generate enhanced Veo3 prompts untuk setiap scene
    result.video_prompts = result.video_prompts.map((prompt: VideoPromptWithOptimization, index: number) => {
        if (!prompt.veo3_optimized_prompt) {
            prompt.veo3_optimized_prompt = generateSceneSpecificVeo3Prompt(
                prompt.scenePrompt,
                prompt.dialog_id,
                Language_dipilih,
                index + 1
            );
        }
        return prompt;
    });

    return result;
}

// FUNGSI HELPER UNTUK SCENE-SPECIFIC VEO3 PROMPTS
function generateSceneSpecificVeo3Prompt(
    scenePrompt: string,
    indonesianDialog: string,
    language: string,
    sceneNumber: number
): string {
    // Extract character names dari dialog
    const dialogLines = indonesianDialog.split('\n').filter(line => line.trim());
    const characters = dialogLines.map(line => {
        const match = line.match(/^([^:]+):/);
        return match ? match[1].trim() : null;
    }).filter(name => name);

    const uniqueCharacters = [...new Set(characters)];

    return `LANGUAGE INSTRUCTION: Generate video with ${language} dialog for Scene ${sceneNumber}.

VISUAL SCENE:
${scenePrompt}

CHARACTER SPEAKING ASSIGNMENT:
${uniqueCharacters.map((char, i) => `${i + 1}. ${char}: Show with mouth movements and facial expressions when speaking`).join('\n')}

DIALOG REQUIREMENT - CHARACTERS MUST SPEAK IN ${language.toUpperCase()} LANGUAGE:
${indonesianDialog}

CRITICAL INSTRUCTIONS:
1. Each character must have distinct visual appearance and voice
2. Show clear mouth movements only for the speaking character
3. Non-speaking characters show listening/reaction expressions
4. Ensure proper turn-taking between characters
5. ALL spoken words must be in ${language} language, NOT English`;
}

// NEW MULTI-FRAME ANALYSIS FUNCTIONS

// Analyze multiple frames to extract details
export async function analyzeFrameSequence(
    frames: Frame[],
    apiSettings?: APISettings
): Promise<Frame[]> {
    const analyzedFrames: Frame[] = [];

    for (const frame of frames) {
        const prompt = `Analyze this image frame for a cinematic animation sequence. Extract:
1. Location: Where is this scene taking place? Be specific.
2. Atmosphere: What is the overall mood and feeling?
3. Time: What time of day/night is it?
4. Mood: What emotional tone does this convey?
5. Visual Elements: List key objects, characters, and important details visible.

Return ONLY a JSON object with these exact fields:
{
  "location": "specific location description",
  "atmosphere": "atmosphere description",
  "time": "time of day",
  "mood": "emotional mood",
  "visualElements": ["element1", "element2", "element3", ...]
}`;

        const response = await callGeminiAPI(prompt, frame.imageUrl, apiSettings);
        const analysis = JSON.parse(response);

        analyzedFrames.push({
            ...frame,
            location: analysis.location,
            atmosphere: analysis.atmosphere,
            time: analysis.time,
            mood: analysis.mood,
            visualElements: analysis.visualElements
        });
    }

    return analyzedFrames;
}

// Detect transitions between frames
export function detectTransitions(frames: Frame[]): FrameTransition[] {
    const transitions: FrameTransition[] = [];

    for (let i = 0; i < frames.length - 1; i++) {
        const currentFrame = frames[i];
        const nextFrame = frames[i + 1];

        // Analyze location change
        const locationChange = currentFrame.location !== nextFrame.location;
        const timeChange = currentFrame.time !== nextFrame.time;

        // Determine transition type
        let movement = 'cut';
        let effect = 'standard';

        if (locationChange && timeChange) {
            movement = 'fade';
            effect = 'time-location-shift';
        } else if (locationChange) {
            movement = 'wipe';
            effect = 'location-change';
        } else if (timeChange) {
            movement = 'dissolve';
            effect = 'time-passage';
        } else {
            movement = 'cut';
            effect = 'continuous-action';
        }

        transitions.push({
            fromFrameId: currentFrame.id,
            toFrameId: nextFrame.id,
            movement,
            duration: 1.5, // Default duration
            effect
        });
    }

    return transitions;
}

// Track characters across frames
export async function trackCharactersAcrossFrames(
    frames: Frame[],
    apiSettings?: APISettings
): Promise<TrackedCharacter[]> {
    const charactersMap = new Map<string, TrackedCharacter>();

    for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];

        const prompt = `Analyze this frame and identify all characters present. For each character, describe:
1. Their name or identifier (if visible)
2. Their position in the frame (left, center, right)
3. Their emotion or expression
4. What action they are performing

Return ONLY a JSON array of characters:
[
  {
    "name": "character identifier",
    "position": "position in frame",
    "emotion": "emotional state",
    "action": "what they're doing",
    "description": "brief physical description"
  }
]`;

        const response = await callGeminiAPI(prompt, frame.imageUrl, apiSettings);
        let charactersInFrame: Array<{
            name: string;
            position: string;
            emotion: string;
            action: string;
            description: string;
        }> = [];

        try {
            const parsed = JSON.parse(response);
            // Ensure it's an array
            if (Array.isArray(parsed)) {
                charactersInFrame = parsed;
            } else {
                console.warn(`Frame ${i + 1}: Expected array but got:`, parsed);
                charactersInFrame = [];
            }
        } catch (parseError) {
            console.error(`Frame ${i + 1}: Failed to parse character data:`, parseError);
            charactersInFrame = [];
        }

        // Only iterate if we have valid array
        if (charactersInFrame && Array.isArray(charactersInFrame)) {
            for (const char of charactersInFrame) {
                const charKey = char.name || char.description;

                if (!charactersMap.has(charKey)) {
                    charactersMap.set(charKey, {
                        name: char.name || `Character ${charactersMap.size + 1}`,
                        description: char.description,
                        frameAppearances: []
                    });
                }

                const trackedChar = charactersMap.get(charKey)!;
                trackedChar.frameAppearances.push({
                    frameNumber: i + 1,
                    frameId: frame.id,
                    position: char.position,
                    emotion: char.emotion,
                    action: char.action
                });
            }
        }
    }

    return Array.from(charactersMap.values());
}

// Generate multi-frame prompt
export async function generateMultiFramePrompt(
    userIdea: string,
    frames: Frame[],
    selectedStyle: string,
    aspectRatio: string,
    languageOptions: LanguageOptions,
    apiSettings?: APISettings
): Promise<MultiFramePromptResult> {
    // Analyze frames
    const analyzedFrames = await analyzeFrameSequence(frames, apiSettings);

    // Detect transitions
    const transitions = detectTransitions(analyzedFrames);

    // Track characters
    const characters = await trackCharactersAcrossFrames(analyzedFrames, apiSettings);

    // Calculate total duration
    const totalDuration = transitions.reduce((sum, t) => sum + t.duration, 0) + 2; // Add 2 seconds for last frame

    // Create frame analysis object
    const frameAnalysis: MultiFrameAnalysis = {
        frames: analyzedFrames,
        transitions,
        characters,
        totalDuration,
        language: languageOptions.Language
    };

    // Generate the comprehensive prompt
    const prompt = `You are a professional animation director creating a Veo 3 optimized video prompt from a sequence of images.

USER IDEA: ${userIdea}
STYLE: ${selectedStyle}
ASPECT RATIO: ${aspectRatio}

SCENE SEQUENCE ANALYSIS:
${analyzedFrames.map((scene, index) => `
Scene ${index + 1}:
- Location: ${scene.location}
- Atmosphere: ${scene.atmosphere}
- Time: ${scene.time}
- Mood: ${scene.mood}
- Key Visual Elements: ${scene.visualElements.join(', ')}`
    ).join('\n')}

TRANSITION MAPPING:
${transitions.map((transition, index) => `
Scene ${index + 1} → Scene ${index + 2}:
- Movement: ${transition.movement}
- Duration: ${transition.duration}s
- Effect: ${transition.effect}`
    ).join('\n')}

CHARACTERS ACROSS SCENES:
${characters.map(char => `
- ${char.name}:
${char.frameAppearances.map(appearance =>
        `  Scene ${appearance.frameNumber}: ${appearance.position}, ${appearance.emotion}, ${appearance.action}`
    ).join('\n')}`
    ).join('\n')}

DIALOGUE REQUIREMENTS:
- Total scenes: ${analyzedFrames.length}
- Total duration: ${totalDuration} seconds
- Language: ${languageOptions.Language}
- Accent: ${languageOptions.Accent}

CRITICAL INSTRUCTIONS FOR VEO 3 PROMPT:
1. Create a seamless video sequence description without mentioning "frames" or "images"
2. Focus on continuous action, character movement, and scene transitions
3. Use cinematic language suitable for video generation
4. Ensure the final prompt reads like a professional video brief
5. Remove any technical references to source images

Create a comprehensive prompt that includes:
1. SEQUENCE: Detailed scene-by-scene description with smooth cinematic transitions
2. CHARACTERS: Character development and consistency throughout the video
3. DIALOGUE BEATS: Natural dialogue flow synchronized with scene changes
4. VEO3 PROMPT: Clean, professional video generation prompt without technical references

Return a JSON object with:
{
  "sequencePrompt": "Complete cinematic sequence description without frame references",
  "characterProgression": "How characters develop throughout the video sequence",
  "dialogueBeats": "Natural dialogue flow with scene timing",
  "veo3OptimizedPrompt": "Final clean video generation prompt for Veo 3 - NO frame/image references"
}`;

    const response = await callGeminiAPI(prompt, undefined, apiSettings);
    const result = JSON.parse(response);

    // Post-process the veo3OptimizedPrompt to ensure no frame references
    if (result.veo3OptimizedPrompt) {
        result.veo3OptimizedPrompt = cleanFrameReferences(result.veo3OptimizedPrompt);
    }

    return {
        ...result,
        frameAnalysis
    };
}

// Helper function to clean frame references from prompts
function cleanFrameReferences(prompt: string): string {
    return prompt
        // Remove frame references
        .replace(/frame\s*\d+/gi, 'scene')
        .replace(/\bframes?\b/gi, 'scenes')
        .replace(/image\s*\d+/gi, 'scene')
        .replace(/\bimages?\b/gi, 'scenes')
        // Clean up sequence references
        .replace(/sequence of frames/gi, 'video sequence')
        .replace(/frame sequence/gi, 'scene sequence')
        .replace(/frame-by-frame/gi, 'scene-by-scene')
        // Remove technical image references
        .replace(/based on the uploaded frames/gi, 'based on the story concept')
        .replace(/from the provided images/gi, 'from the narrative')
        .replace(/analyzing the frames/gi, 'developing the scenes')
        // Clean up any remaining technical language
        .replace(/frame analysis/gi, 'scene development')
        .replace(/frame transition/gi, 'scene transition')
        // Ensure smooth language flow
        .replace(/\bscene\s+scene\b/gi, 'scene')
        .replace(/scenes scenes/gi, 'scenes')
        // Final cleanup
        .trim();
}

// Generate formatted multi-frame prompt
export async function generateMultiFramePromptFormatted(
    userIdea: string,
    frames: Frame[],
    selectedStyle: string,
    aspectRatio: string,
    languageOptions: LanguageOptions,
    apiSettings?: APISettings
): Promise<string> {
    const result: MultiFramePromptResult = await generateMultiFramePrompt(
        userIdea,
        frames,
        selectedStyle,
        aspectRatio,
        languageOptions,
        apiSettings
    );

    // Compose SCENE SETUP description without frame references
    const sceneSetupLines = result.frameAnalysis.frames.map((scene, idx) => {
        return `Scene ${idx + 1}:
- Location: ${scene.location}
- Atmosphere: ${scene.atmosphere}
- Time: ${scene.time}
- Mood: ${scene.mood}`;
    }).join('\n\n');

    // Compose CHARACTERS list
    const charactersList = result.frameAnalysis.characters.map(char => {
        // For each character, list name and description
        // For emotion and position, take latest appearance
        const lastAppearance = char.frameAppearances[char.frameAppearances.length - 1];
        const emotion = lastAppearance?.emotion || 'neutral';
        const position = lastAppearance?.position || 'unknown position';

        return `- ${char.name}: ${char.description || 'no description'}. Emotion: ${emotion}. Position: ${position}`;
    }).join('\n');

    // Compose DIALOGUE REQUIREMENTS
    const beatCount = result.dialogueBeats ? result.dialogueBeats.split('\n').length : 0;
    const duration = result.frameAnalysis.totalDuration;
    const language = result.frameAnalysis.language;

    // Compose final formatted prompt string without frame references
    const formattedPrompt = `VIDEO SEQUENCE SETUP:
${sceneSetupLines}

CHARACTERS:
${charactersList}

DIALOGUE REQUIREMENTS:
- ${beatCount} dialogue beats
- Total duration: ${duration} seconds
- Language: ${language}

DIALOGUE SEQUENCE:
${result.dialogueBeats || 'No dialogue beats available.'}`;

    // Clean any remaining frame references
    return cleanFrameReferences(formattedPrompt);
}

// Re-export anomaly-related functions from api.ts
export {
    generateAnomalyCharacters,
    generateAnomalyStory,
    generateAnomalyScenePrompt,
    generateTwistedStoryIdea
} from './api';
