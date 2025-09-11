// Enhanced Story Flow System for Veo3
// Advanced story continuity and narrative flow optimization

export interface StoryFlowConfig {
    totalScenes: number;
    genre: string;
    theme: string;
    characters: CharacterProfile[];
    targetDuration: number;
    storyArc: string;
    emotionalJourney: string[];
}

export interface CharacterProfile {
    name: string;
    role: string;
    arc: string;
    relationships: { [key: string]: string };
    emotionalState: string;
    development: string;
}

export interface SceneFlow {
    sceneNumber: number;
    purpose: string;
    emotionalTone: string;
    characterFocus: string[];
    plotDevelopment: string;
    visualTransition: string;
    audioTransition: string;
    continuityNotes: string;
    nextSceneSetup: string;
}

export interface StoryFlow {
    scenes: SceneFlow[];
    overallArc: string;
    characterArcs: { [key: string]: string };
    emotionalJourney: string[];
    visualContinuity: string[];
    audioContinuity: string[];
}

// Story arc templates for different genres
export const STORY_ARC_TEMPLATES = {
    DRAMA: {
        structure: ['Setup', 'Confrontation', 'Resolution'],
        emotionalFlow: ['Curiosity', 'Tension', 'Catharsis'],
        characterDevelopment: ['Introduction', 'Conflict', 'Growth'],
        visualStyle: ['Establishing', 'Intimate', 'Revelatory']
    },

    COMEDY: {
        structure: ['Setup', 'Complication', 'Resolution'],
        emotionalFlow: ['Lightness', 'Confusion', 'Satisfaction'],
        characterDevelopment: ['Quirks', 'Misunderstandings', 'Revelations'],
        visualStyle: ['Bright', 'Dynamic', 'Playful']
    },

    THRILLER: {
        structure: ['Setup', 'Escalation', 'Climax'],
        emotionalFlow: ['Unease', 'Suspense', 'Relief'],
        characterDevelopment: ['Normalcy', 'Paranoia', 'Resolution'],
        visualStyle: ['Ordinary', 'Tense', 'Dramatic']
    },

    ROMANCE: {
        structure: ['Meeting', 'Development', 'Resolution'],
        emotionalFlow: ['Attraction', 'Connection', 'Commitment'],
        characterDevelopment: ['Individual', 'Bonding', 'Unity'],
        visualStyle: ['Separate', 'Intimate', 'Together']
    },

    ACTION: {
        structure: ['Setup', 'Action', 'Resolution'],
        emotionalFlow: ['Calm', 'Excitement', 'Triumph'],
        characterDevelopment: ['Preparation', 'Challenge', 'Victory'],
        visualStyle: ['Static', 'Dynamic', 'Triumphant']
    }
};

// Generate enhanced story flow
export function generateEnhancedStoryFlow(config: StoryFlowConfig): StoryFlow {
    const { totalScenes, genre, theme, characters, storyArc, emotionalJourney } = config;

    // Get genre-specific template
    const template = STORY_ARC_TEMPLATES[genre.toUpperCase() as keyof typeof STORY_ARC_TEMPLATES] ||
        STORY_ARC_TEMPLATES.DRAMA;

    // Generate scene flow
    const scenes = generateSceneFlow(totalScenes, template, characters, theme);

    // Generate character arcs
    const characterArcs = generateCharacterArcs(characters, totalScenes);

    // Generate visual continuity
    const visualContinuity = generateVisualContinuity(scenes, template);

    // Generate audio continuity
    const audioContinuity = generateAudioContinuity(scenes, template);

    return {
        scenes,
        overallArc: storyArc,
        characterArcs,
        emotionalJourney: emotionalJourney || template.emotionalFlow,
        visualContinuity,
        audioContinuity
    };
}

// Generate scene flow
function generateSceneFlow(
    totalScenes: number,
    template: Record<string, string[]>,
    characters: CharacterProfile[],
    theme: string
): SceneFlow[] {
    const scenes: SceneFlow[] = [];

    for (let i = 0; i < totalScenes; i++) {
        const sceneNumber = i + 1;
        const progress = i / (totalScenes - 1);

        // Determine scene purpose based on progress
        const purpose = determineScenePurpose(progress, template.structure);

        // Determine emotional tone
        const emotionalTone = determineEmotionalTone(progress, template.emotionalFlow);

        // Determine character focus
        const characterFocus = determineCharacterFocus(sceneNumber, characters);

        // Determine plot development
        const plotDevelopment = determinePlotDevelopment(sceneNumber, totalScenes, theme);

        // Generate transitions
        const visualTransition = generateVisualTransition(sceneNumber, totalScenes, template.visualStyle);
        const audioTransition = generateAudioTransition(sceneNumber, totalScenes, template.emotionalFlow);

        // Generate continuity notes
        const continuityNotes = generateContinuityNotes(sceneNumber, totalScenes, characters);

        // Generate next scene setup
        const nextSceneSetup = generateNextSceneSetup(sceneNumber, totalScenes, template);

        scenes.push({
            sceneNumber,
            purpose,
            emotionalTone,
            characterFocus,
            plotDevelopment,
            visualTransition,
            audioTransition,
            continuityNotes,
            nextSceneSetup
        });
    }

    return scenes;
}

// Determine scene purpose based on progress
function determineScenePurpose(progress: number, structure: string[]): string {
    if (progress < 0.33) {
        return structure[0] || 'Setup';
    } else if (progress < 0.66) {
        return structure[1] || 'Development';
    } else {
        return structure[2] || 'Resolution';
    }
}

// Determine emotional tone based on progress
function determineEmotionalTone(progress: number, emotionalFlow: string[]): string {
    if (progress < 0.33) {
        return emotionalFlow[0] || 'Curiosity';
    } else if (progress < 0.66) {
        return emotionalFlow[1] || 'Tension';
    } else {
        return emotionalFlow[2] || 'Catharsis';
    }
}

// Determine character focus
function determineCharacterFocus(
    sceneNumber: number,
    characters: CharacterProfile[]
): string[] {
    // Rotate character focus throughout the story
    const focusIndex = (sceneNumber - 1) % characters.length;
    const primaryCharacter = characters[focusIndex];

    // Include secondary characters for interaction
    const secondaryCharacters = characters.filter((_, index) => index !== focusIndex);
    const secondaryFocus = secondaryCharacters.slice(0, 2); // Max 2 secondary characters

    return [primaryCharacter.name, ...secondaryFocus.map(c => c.name)];
}

// Determine plot development
function determinePlotDevelopment(
    sceneNumber: number,
    totalScenes: number,
    theme: string
): string {
    const progress = (sceneNumber - 1) / (totalScenes - 1);

    if (progress < 0.33) {
        return `Introducing ${theme} and establishing the world`;
    } else if (progress < 0.66) {
        return `Developing ${theme} and building tension`;
    } else {
        return `Resolving ${theme} and concluding the story`;
    }
}

// Generate visual transition
function generateVisualTransition(
    sceneNumber: number,
    totalScenes: number,
    visualStyle: string[]
): string {
    const progress = (sceneNumber - 1) / (totalScenes - 1);

    if (progress < 0.33) {
        return visualStyle[0] || 'Establishing shot with wide angle';
    } else if (progress < 0.66) {
        return visualStyle[1] || 'Medium shots with dynamic movement';
    } else {
        return visualStyle[2] || 'Close-ups with emotional focus';
    }
}

// Generate audio transition
function generateAudioTransition(
    sceneNumber: number,
    totalScenes: number,
    emotionalFlow: string[]
): string {
    const progress = (sceneNumber - 1) / (totalScenes - 1);

    if (progress < 0.33) {
        return `Ambient music building ${emotionalFlow[0] || 'curiosity'}`;
    } else if (progress < 0.66) {
        return `Escalating music creating ${emotionalFlow[1] || 'tension'}`;
    } else {
        return `Resolving music providing ${emotionalFlow[2] || 'catharsis'}`;
    }
}

// Generate continuity notes
function generateContinuityNotes(
    sceneNumber: number,
    totalScenes: number,
    characters: CharacterProfile[]
): string {
    const notes: string[] = [];

    // Character continuity
    characters.forEach(character => {
        notes.push(`${character.name}: ${character.emotionalState} - ${character.development}`);
    });

    // Scene continuity
    if (sceneNumber > 1) {
        notes.push('Maintain visual continuity from previous scene');
        notes.push('Continue character emotional states');
    }

    if (sceneNumber < totalScenes) {
        notes.push('Set up elements for next scene');
        notes.push('Maintain story momentum');
    }

    return notes.join('; ');
}

// Generate next scene setup
function generateNextSceneSetup(
    sceneNumber: number,
    totalScenes: number,
    template: Record<string, string[]>
): string {
    if (sceneNumber >= totalScenes) {
        return 'Story conclusion - no next scene';
    }

    const nextProgress = sceneNumber / (totalScenes - 1);
    const nextPurpose = determineScenePurpose(nextProgress, template.structure);
    const nextTone = determineEmotionalTone(nextProgress, template.emotionalFlow);

    return `Prepare for ${nextPurpose} with ${nextTone} emotional tone`;
}

// Generate character arcs
function generateCharacterArcs(characters: CharacterProfile[], totalScenes: number): { [key: string]: string } {
    const arcs: { [key: string]: string } = {};

    characters.forEach(character => {
        const arc = generateCharacterArc(character, totalScenes);
        arcs[character.name] = arc;
    });

    return arcs;
}

// Generate individual character arc
function generateCharacterArc(character: CharacterProfile, totalScenes: number): string {
    const arcStages = [
        'Introduction and establishment',
        'Development and growth',
        'Climax and revelation',
        'Resolution and conclusion'
    ];

    const stageIndex = Math.min(Math.floor(totalScenes / 4), arcStages.length - 1);
    return `${character.role}: ${arcStages[stageIndex]} - ${character.arc}`;
}

// Generate visual continuity
function generateVisualContinuity(scenes: SceneFlow[], template: Record<string, string[]>): string[] {
    return scenes.map((scene, index) => {
        const continuity: string[] = [];

        // Lighting continuity
        continuity.push(`Maintain consistent lighting style: ${template.visualStyle[0] || 'natural'}`);

        // Color continuity
        continuity.push('Maintain consistent color palette throughout');

        // Camera continuity
        if (index > 0) {
            continuity.push(`Smooth transition from scene ${index} to scene ${index + 1}`);
        }

        // Character continuity
        continuity.push('Maintain character appearance and positioning');

        return continuity.join('; ');
    });
}

// Generate audio continuity
function generateAudioContinuity(scenes: SceneFlow[], template: Record<string, string[]>): string[] {
    return scenes.map((scene, index) => {
        const continuity: string[] = [];

        // Music continuity
        continuity.push(`Maintain musical theme: ${template.emotionalFlow[0] || 'curiosity'}`);

        // Sound continuity
        continuity.push('Maintain consistent ambient sound levels');

        // Dialogue continuity
        continuity.push('Maintain character voice characteristics');

        // Transition continuity
        if (index > 0) {
            continuity.push(`Smooth audio transition from scene ${index} to scene ${index + 1}`);
        }

        return continuity.join('; ');
    });
}

// Enhanced story flow optimization
export function optimizeStoryFlow(storyFlow: StoryFlow): StoryFlow {
    // Optimize scene transitions
    storyFlow.scenes = optimizeSceneTransitions(storyFlow.scenes);

    // Optimize character arcs
    storyFlow.characterArcs = optimizeCharacterArcs(storyFlow.characterArcs, storyFlow.scenes);

    // Optimize visual continuity
    storyFlow.visualContinuity = optimizeVisualContinuity(storyFlow.visualContinuity);

    // Optimize audio continuity
    storyFlow.audioContinuity = optimizeAudioContinuity(storyFlow.audioContinuity);

    return storyFlow;
}

// Optimize scene transitions
function optimizeSceneTransitions(scenes: SceneFlow[]): SceneFlow[] {
    return scenes.map((scene, index) => {
        if (index > 0) {
            const previousScene = scenes[index - 1];

            // Ensure smooth emotional transition
            if (previousScene.emotionalTone !== scene.emotionalTone) {
                scene.visualTransition = `Smooth transition from ${previousScene.emotionalTone} to ${scene.emotionalTone}`;
                scene.audioTransition = `Gradual shift from ${previousScene.emotionalTone} to ${scene.emotionalTone}`;
            }

            // Ensure character continuity
            const commonCharacters = scene.characterFocus.filter(char =>
                previousScene.characterFocus.includes(char)
            );

            if (commonCharacters.length > 0) {
                scene.continuityNotes += `; Maintain focus on ${commonCharacters.join(', ')}`;
            }
        }

        return scene;
    });
}

// Optimize character arcs
function optimizeCharacterArcs(
    characterArcs: { [key: string]: string },
    scenes: SceneFlow[]
): { [key: string]: string } {
    const optimizedArcs: { [key: string]: string } = {};

    Object.entries(characterArcs).forEach(([characterName, arc]) => {
        // Count character appearances
        const appearances = scenes.filter(scene =>
            scene.characterFocus.includes(characterName)
        ).length;

        // Adjust arc based on appearances
        if (appearances < 2) {
            optimizedArcs[characterName] = `${arc} (limited role)`;
        } else if (appearances > 4) {
            optimizedArcs[characterName] = `${arc} (major role)`;
        } else {
            optimizedArcs[characterName] = arc;
        }
    });

    return optimizedArcs;
}

// Optimize visual continuity
function optimizeVisualContinuity(visualContinuity: string[]): string[] {
    return visualContinuity.map(continuity => {
        // Add specific continuity instructions
        return `${continuity}; Ensure consistent aspect ratio and frame rate`;
    });
}

// Optimize audio continuity
function optimizeAudioContinuity(audioContinuity: string[]): string[] {
    return audioContinuity.map(continuity => {
        // Add specific audio continuity instructions
        return `${continuity}; Maintain consistent audio levels and quality`;
    });
}

// Generate story flow summary
export function generateStoryFlowSummary(storyFlow: StoryFlow): string {
    const summary = [
        `Story Arc: ${storyFlow.overallArc}`,
        `Total Scenes: ${storyFlow.scenes.length}`,
        `Emotional Journey: ${storyFlow.emotionalJourney.join(' → ')}`,
        `Character Arcs: ${Object.entries(storyFlow.characterArcs).map(([name, arc]) => `${name}: ${arc}`).join(', ')}`,
        `Visual Style: ${storyFlow.visualContinuity[0] || 'Consistent throughout'}`,
        `Audio Style: ${storyFlow.audioContinuity[0] || 'Consistent throughout'}`
    ];

    return summary.join('\n');
}

// Validate story flow
export function validateStoryFlow(storyFlow: StoryFlow): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check scene count
    if (storyFlow.scenes.length === 0) {
        issues.push('No scenes generated');
    }

    // Check character arcs
    if (Object.keys(storyFlow.characterArcs).length === 0) {
        issues.push('No character arcs defined');
    }

    // Check emotional journey
    if (storyFlow.emotionalJourney.length === 0) {
        issues.push('No emotional journey defined');
    }

    // Check scene continuity
    storyFlow.scenes.forEach((scene) => {
        if (!scene.purpose) {
            issues.push(`Scene ${scene.sceneNumber}: No purpose defined`);
        }
        if (!scene.emotionalTone) {
            issues.push(`Scene ${scene.sceneNumber}: No emotional tone defined`);
        }
        if (scene.characterFocus.length === 0) {
            issues.push(`Scene ${scene.sceneNumber}: No character focus defined`);
        }
    });

    return {
        isValid: issues.length === 0,
        issues
    };
}
