// Enhanced Veo3 Optimized Prompt System
// Optimized for Gemini Veo3 video generation with professional film quality

export interface Veo3SceneConfig {
    sceneNumber: number;
    totalScenes: number;
    duration: number;
    genre: string;
    animationType: string;
    language: string;
    characters: CharacterConfig[];
    storyContext: string;
    previousScene?: Veo3SceneConfig;
}

export interface CharacterConfig {
    name: string;
    age: string;
    personality: string;
    appearance: string;
    speakingStyle: string;
    emotionalState: string;
    position: string;
    clothing: string;
}

export interface Veo3OptimizedPrompt {
    visualPrompt: string;
    audioPrompt: string;
    dialoguePrompt: string;
    cinematographyPrompt: string;
    characterConsistencyPrompt: string;
    sceneTransitionPrompt: string;
    veo3SpecificInstructions: string;
}

// Enhanced Veo3-specific prompt templates
export const VE3_PROMPT_TEMPLATES = {
    // Professional cinematography instructions for Veo3
    CINEMATOGRAPHY: {
        REALISTIC: `
Cinematography for Veo3:
- Camera: Professional DSLR with 24-70mm lens, shallow depth of field (f/2.8)
- Movement: Smooth dolly movements, subtle handheld for intimacy
- Lighting: Three-point lighting setup with key, fill, and rim lights
- Color grading: Natural skin tones, warm highlights, cool shadows
- Focus: Rack focus between characters during dialogue
- Composition: Rule of thirds, leading lines, dynamic angles
- Frame rate: 24fps cinematic motion blur
- Aspect ratio: 16:9 widescreen format`,

        ANIME: `
Cinematography for Veo3 (Anime Style):
- Camera: Dynamic anime-style camera work with dramatic angles
- Movement: Quick cuts, zoom-ins for emotional moments, wide establishing shots
- Lighting: Cel-shaded lighting with strong rim lights and soft shadows
- Color grading: Vibrant, saturated colors with high contrast
- Focus: Sharp focus on characters, soft background blur
- Composition: Dynamic diagonal compositions, extreme close-ups
- Frame rate: 12fps for traditional anime feel with motion blur
- Aspect ratio: 16:9 with letterboxing for cinematic feel`,

        PIXAR: `
Cinematography for Veo3 (Pixar Style):
- Camera: Smooth, family-friendly camera movements
- Movement: Gentle tracking shots, playful camera tilts
- Lighting: Soft, warm lighting with bounce lighting
- Color grading: Bright, cheerful colors with soft shadows
- Focus: Deep focus showing detailed environments
- Composition: Centered compositions with clear character focus
- Frame rate: 24fps with smooth motion blur
- Aspect ratio: 16:9 with rounded corners for friendly feel`
    },

    // Character consistency instructions
    CHARACTER_CONSISTENCY: `
Character Consistency for Veo3:
- Maintain exact facial features, hair, and clothing across all scenes
- Preserve character proportions and body language patterns
- Keep consistent voice characteristics and speaking mannerisms
- Maintain emotional continuity from previous scenes
- Ensure character positioning follows established spatial relationships
- Preserve character-specific gestures and expressions`,

    // Scene transition instructions
    SCENE_TRANSITION: `
Scene Transition for Veo3:
- Smooth continuity from previous scene's ending
- Maintain consistent lighting and color temperature
- Preserve character positioning and emotional state
- Continue established camera movement patterns
- Maintain audio continuity and ambient sound levels
- Ensure seamless visual flow between scenes`
};

// Enhanced dialogue formatting for Veo3
export function formatVeo3Dialogue(
    characters: CharacterConfig[],
    dialogue: string[],
    language: string,
    sceneDuration: number
): string {
    const timingPerLine = Math.floor((sceneDuration * 1000) / dialogue.length);

    return dialogue.map((line, index) => {
        const startTime = index * timingPerLine;
        const endTime = (index + 1) * timingPerLine;

        // Extract character name and dialogue content
        const match = line.match(/^([^:]+):\s*(.+)$/);
        if (!match) return line;

        const [, characterName, dialogueText] = match;
        const character = characters.find(c => c.name === characterName);

        return `[${startTime}-${endTime}ms] ${characterName}: (${character?.emotionalState || 'neutral'}, ${character?.speakingStyle || 'natural'}) "${dialogueText.trim()}"`;
    }).join('\n');
}

// Generate Veo3-optimized visual prompt
export function generateVeo3VisualPrompt(config: Veo3SceneConfig): string {
    const { sceneNumber, totalScenes, duration, genre, animationType, characters, storyContext } = config;

    const characterDescriptions = characters.map(char =>
        `${char.name} (${char.age}, ${char.personality}): ${char.appearance}, wearing ${char.clothing}, positioned ${char.position}, showing ${char.emotionalState} emotion`
    ).join(', ');

    const cinematography = VE3_PROMPT_TEMPLATES.CINEMATOGRAPHY[animationType.toUpperCase() as keyof typeof VE3_PROMPT_TEMPLATES.CINEMATOGRAPHY] ||
        VE3_PROMPT_TEMPLATES.CINEMATOGRAPHY.REALISTIC;

    return `
Create a professional ${duration}-second video scene for Gemini Veo3:

SCENE ${sceneNumber}/${totalScenes}: ${storyContext}

CHARACTERS:
${characterDescriptions}

VISUAL REQUIREMENTS:
- Style: ${animationType} animation with professional quality
- Genre: ${genre} with appropriate mood and atmosphere
- Duration: Exactly ${duration} seconds
- Quality: 4K resolution, high detail, professional lighting

CINEMATOGRAPHY:
${cinematography}

CHARACTER CONSISTENCY:
${VE3_PROMPT_TEMPLATES.CHARACTER_CONSISTENCY}

SCENE TRANSITION:
${config.previousScene ? VE3_PROMPT_TEMPLATES.SCENE_TRANSITION : 'Opening scene - establish setting and characters'}

VEO3 SPECIFIC INSTRUCTIONS:
- Ensure smooth character movements and natural facial expressions
- Maintain consistent lighting throughout the scene
- Use professional color grading and post-processing
- Optimize for AI video generation with clear visual hierarchy
- Include subtle environmental details and atmospheric effects
- Ensure dialogue synchronization with character mouth movements
- Maintain 24fps cinematic quality with appropriate motion blur
`;
}

// Generate Veo3-optimized audio prompt
export function generateVeo3AudioPrompt(config: Veo3SceneConfig, dialogue: string[]): string {
    const { genre, sceneNumber, totalScenes } = config;

    const formattedDialogue = formatVeo3Dialogue(config.characters, dialogue, config.language, config.duration);

    return `
AUDIO DESIGN for Veo3 Scene ${sceneNumber}/${totalScenes}:

DIALOGUE TIMING:
${formattedDialogue}

MUSIC:
- Genre: ${genre} appropriate background music
- Volume: 30% background level, ducking during dialogue
- Style: Professional film score quality
- Tempo: Match scene pacing and emotional tone

SOUND EFFECTS:
- Ambient: Environmental sounds matching the setting
- Foley: Character movement sounds (footsteps, clothing rustle)
- SFX: Scene-specific sound effects for actions
- Volume: Balanced with dialogue and music

AUDIO MIXING:
- Dialogue: Clear and prominent (70% volume)
- Music: Supportive background (30% volume)
- SFX: Realistic and immersive (40% volume)
- Master: Professional broadcast quality levels
`;
}

// Generate complete Veo3-optimized prompt
export function generateCompleteVeo3Prompt(config: Veo3SceneConfig, dialogue: string[]): Veo3OptimizedPrompt {
    return {
        visualPrompt: generateVeo3VisualPrompt(config),
        audioPrompt: generateVeo3AudioPrompt(config, dialogue),
        dialoguePrompt: formatVeo3Dialogue(config.characters, dialogue, config.language, config.duration),
        cinematographyPrompt: VE3_PROMPT_TEMPLATES.CINEMATOGRAPHY[config.animationType.toUpperCase() as keyof typeof VE3_PROMPT_TEMPLATES.CINEMATOGRAPHY] ||
            VE3_PROMPT_TEMPLATES.CINEMATOGRAPHY.REALISTIC,
        characterConsistencyPrompt: VE3_PROMPT_TEMPLATES.CHARACTER_CONSISTENCY,
        sceneTransitionPrompt: config.previousScene ? VE3_PROMPT_TEMPLATES.SCENE_TRANSITION : 'Opening scene',
        veo3SpecificInstructions: `
VEO3 OPTIMIZATION CHECKLIST:
✓ Character consistency maintained across scenes
✓ Professional cinematography with proper lighting
✓ Natural dialogue timing and synchronization
✓ Smooth scene transitions and continuity
✓ High-quality audio mixing and sound design
✓ Optimized for AI video generation capabilities
✓ Professional color grading and post-processing
✓ Appropriate motion blur and frame rate
`
    };
}

// Enhanced story flow optimization
export function optimizeStoryFlow(scenes: Veo3SceneConfig[]): Veo3SceneConfig[] {
    return scenes.map((scene, index) => {
        const previousScene = index > 0 ? scenes[index - 1] : undefined;

        // Ensure character emotional continuity
        if (previousScene) {
            scene.characters = scene.characters.map(char => {
                const prevChar = previousScene.characters.find(c => c.name === char.name);
                if (prevChar) {
                    // Maintain emotional progression
                    return {
                        ...char,
                        emotionalState: char.emotionalState, // Keep current emotional state
                        position: char.position, // Maintain spatial continuity
                    };
                }
                return char;
            });
        }

        return {
            ...scene,
            previousScene
        };
    });
}

// Professional dialogue enhancement
export function enhanceDialogueForVeo3(
    originalDialogue: string[],
    characters: CharacterConfig[],
    language: string,
    genre: string
): string[] {
    return originalDialogue.map(line => {
        // Extract character and dialogue
        const match = line.match(/^([^:]+):\s*(.+)$/);
        if (!match) return line;

        const [, characterName, dialogueText] = match;
        const character = characters.find(c => c.name === characterName);

        if (!character) return line;

        // Enhance dialogue based on character personality and genre
        let enhancedDialogue = dialogueText;

        // Add genre-appropriate enhancements
        switch (genre.toLowerCase()) {
            case 'drama':
                enhancedDialogue = addDramaticWeight(enhancedDialogue);
                break;
            case 'comedy':
                enhancedDialogue = addComedicTiming(enhancedDialogue);
                break;
            case 'thriller':
                enhancedDialogue = addSuspensefulTone(enhancedDialogue);
                break;
            case 'romance':
                enhancedDialogue = addRomanticNuance(enhancedDialogue);
                break;
        }

        // Add character-specific speaking style
        enhancedDialogue = applyCharacterSpeakingStyle(enhancedDialogue, character);

        return `${characterName}: ${enhancedDialogue}`;
    });
}

// Helper functions for dialogue enhancement
function addDramaticWeight(dialogue: string): string {
    // Add dramatic pauses and emphasis
    return dialogue.replace(/([.!?])\s/g, '$1... ').replace(/\b(important|crucial|vital)\b/gi, '**$1**');
}

function addComedicTiming(dialogue: string): string {
    // Add comedic timing and wordplay
    return dialogue.replace(/\b(very|really|so)\b/gi, 'super').replace(/([.!?])\s/g, '$1 *pause* ');
}

function addSuspensefulTone(dialogue: string): string {
    // Add suspenseful elements
    return dialogue.replace(/\b(something|someone|somewhere)\b/gi, '...$1...').replace(/([.!?])\s/g, '$1 *whisper* ');
}

function addRomanticNuance(dialogue: string): string {
    // Add romantic elements
    return dialogue.replace(/\b(love|heart|beautiful)\b/gi, '*$1*').replace(/([.!?])\s/g, '$1 *softly* ');
}

function applyCharacterSpeakingStyle(dialogue: string, character: CharacterConfig): string {
    const style = character.speakingStyle.toLowerCase();

    switch (style) {
        case 'formal':
            return dialogue.replace(/\b(don't|can't|won't)\b/gi, match => match.replace("'", ''));
        case 'casual':
            return dialogue.replace(/\b(do not|cannot|will not)\b/gi, match => match.replace(/\s+/g, "'"));
        case 'dramatic':
            return dialogue.replace(/\b(very|really)\b/gi, 'incredibly').replace(/\b(good|bad)\b/gi, match => match === 'good' ? 'magnificent' : 'terrible');
        case 'comedic':
            return dialogue.replace(/\b(serious|important)\b/gi, 'super serious').replace(/\b(big|small)\b/gi, match => match === 'big' ? 'ginormous' : 'teeny-tiny');
        default:
            return dialogue;
    }
}
