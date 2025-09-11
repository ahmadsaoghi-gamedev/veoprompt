// Professional Dialogue System for Veo3
// Enhanced dialogue generation with actor-level quality and natural conversation flow

export interface ProfessionalDialogueConfig {
    characters: CharacterProfile[];
    sceneContext: string;
    genre: string;
    language: string;
    duration: number;
    emotionalArc: string;
    previousDialogue?: string[];
}

export interface CharacterProfile {
    name: string;
    age: string;
    personality: string;
    speakingStyle: string;
    emotionalState: string;
    backstory: string;
    relationships: { [key: string]: string };
    characterArc: string;
    voiceCharacteristics: string;
}

export interface ProfessionalDialogue {
    dialogue: string[];
    timing: string[];
    emotions: string[];
    actions: string[];
    cameraInstructions: string[];
    audioInstructions: string[];
    characterDevelopment: string;
    scenePurpose: string;
    characters?: CharacterProfile[];
}

// Professional dialogue templates for different genres
export const PROFESSIONAL_DIALOGUE_TEMPLATES = {
    DRAMA: {
        OPENING: [
            "Subtle tension in the air, characters sizing each other up",
            "Emotional subtext beneath surface conversation",
            "Character motivations revealed through dialogue",
            "Building towards emotional climax"
        ],
        DEVELOPMENT: [
            "Escalating emotional intensity",
            "Character conflicts coming to surface",
            "Revelations and plot developments",
            "Emotional turning points"
        ],
        CLIMAX: [
            "Peak emotional intensity",
            "Character confrontations",
            "Major revelations",
            "Emotional catharsis"
        ]
    },

    COMEDY: {
        OPENING: [
            "Light, playful banter",
            "Character quirks and humor",
            "Setup for comedic moments",
            "Building comedic rhythm"
        ],
        DEVELOPMENT: [
            "Escalating comedic situations",
            "Character misunderstandings",
            "Comedic timing and delivery",
            "Building to punchline"
        ],
        CLIMAX: [
            "Peak comedic moment",
            "Punchline delivery",
            "Comedic resolution",
            "Satisfying comedic payoff"
        ]
    },

    THRILLER: {
        OPENING: [
            "Building tension and suspense",
            "Characters on edge",
            "Mysterious undertones",
            "Setting up danger"
        ],
        DEVELOPMENT: [
            "Escalating tension",
            "Revealing threats",
            "Character paranoia",
            "Building to climax"
        ],
        CLIMAX: [
            "Peak suspense moment",
            "Confrontation with danger",
            "Resolution of tension",
            "Aftermath and relief"
        ]
    }
};

// Enhanced dialogue generation with professional quality
export function generateProfessionalDialogue(config: ProfessionalDialogueConfig): ProfessionalDialogue {
    const { characters, sceneContext, genre, language, duration, emotionalArc } = config;

    // Determine scene purpose based on emotional arc
    const scenePurpose = determineScenePurpose(emotionalArc);

    // Generate character-appropriate dialogue
    const dialogue = generateCharacterDialogue(characters, sceneContext, genre, language, scenePurpose);

    // Create professional timing
    const timing = generateProfessionalTiming(dialogue, duration);

    // Add emotional depth
    const emotions = generateEmotionalDepth(dialogue, characters, scenePurpose);

    // Create character actions
    const actions = generateCharacterActions(dialogue, characters, genre);

    // Generate camera instructions
    const cameraInstructions = generateCameraInstructions(dialogue, emotions);

    // Generate audio instructions
    const audioInstructions = generateAudioInstructions(dialogue, emotions);

    // Determine character development
    const characterDevelopment = generateCharacterDevelopment(characters, scenePurpose);

    return {
        dialogue,
        timing,
        emotions,
        actions,
        cameraInstructions,
        audioInstructions,
        characterDevelopment,
        scenePurpose
    };
}

// Determine scene purpose based on emotional arc
function determineScenePurpose(emotionalArc: string): string {
    const arcMap: { [key: string]: string } = {
        'opening': 'Establish characters and setting',
        'development': 'Develop plot and character relationships',
        'climax': 'Peak emotional moment',
        'resolution': 'Resolve conflicts and provide closure',
        'transition': 'Bridge between major story beats'
    };

    return arcMap[emotionalArc] || 'Advance story and character development';
}

// Generate character-appropriate dialogue optimized for short scenes
function generateCharacterDialogue(
    characters: CharacterProfile[],
    sceneContext: string,
    genre: string,
    language: string,
    scenePurpose: string
): string[] {
    const dialogue: string[] = [];
    const template = PROFESSIONAL_DIALOGUE_TEMPLATES[genre.toUpperCase() as keyof typeof PROFESSIONAL_DIALOGUE_TEMPLATES];

    if (!template) {
        return generateGenericDialogue(characters, sceneContext, language);
    }

    // Generate dialogue based on scene purpose
    const purposeKey = getPurposeKey(scenePurpose);
    const dialogueGuidelines = template[purposeKey as keyof typeof template] || template.OPENING;

    // Limit to 2-3 characters for 8-second scenes
    const maxCharacters = Math.min(characters.length, 3);
    const selectedCharacters = characters.slice(0, maxCharacters);

    // Create dialogue for selected characters only
    selectedCharacters.forEach((character) => {
        const characterDialogue = generateCharacterSpecificDialogue(
            character,
            sceneContext,
            dialogueGuidelines,
            language
        );
        dialogue.push(characterDialogue);
    });

    return dialogue;
}

// Generate character-specific dialogue
function generateCharacterSpecificDialogue(
    character: CharacterProfile,
    sceneContext: string,
    guidelines: string[],
    language: string
): string {
    const speakingStyle = character.speakingStyle.toLowerCase();
    const emotionalState = character.emotionalState.toLowerCase();
    const personality = character.personality.toLowerCase();

    // Base dialogue structure
    let dialogue = `${character.name}: `;

    // Apply character-specific speaking style
    switch (speakingStyle) {
        case 'formal':
            dialogue += generateFormalDialogue(character, sceneContext, language);
            break;
        case 'casual':
            dialogue += generateCasualDialogue(character, sceneContext, language);
            break;
        case 'dramatic':
            dialogue += generateDramaticDialogue(character, sceneContext, language);
            break;
        case 'comedic':
            dialogue += generateComedicDialogue(character, sceneContext, language);
            break;
        case 'poetic':
            dialogue += generatePoeticDialogue(character, sceneContext, language);
            break;
        case 'technical':
            dialogue += generateTechnicalDialogue(character, sceneContext, language);
            break;
        default:
            dialogue += generateNaturalDialogue(character, sceneContext, language);
    }

    // Apply emotional state
    dialogue = applyEmotionalState(dialogue, emotionalState);

    // Apply personality traits
    dialogue = applyPersonalityTraits(dialogue, personality);

    return dialogue;
}

// Generate formal dialogue (optimized for short scenes)
function generateFormalDialogue(character: CharacterProfile, sceneContext: string, language: string): string {
    const formalPhrases = {
        indonesian: [
            "Ini serius!",
            "Kita harus bertindak!",
            "Saya yakin ini benar.",
            "Mari kita lakukan!",
            "Ini penting!"
        ],
        english: [
            "This is serious!",
            "We must act!",
            "I'm sure this is right.",
            "Let's do this!",
            "This is important!"
        ]
    };

    const phrases = formalPhrases[language as keyof typeof formalPhrases] || formalPhrases.english;
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    return `"${randomPhrase}"`;
}

// Generate casual dialogue (optimized for short scenes)
function generateCasualDialogue(character: CharacterProfile, sceneContext: string, language: string): string {
    const casualPhrases = {
        indonesian: [
            "Eh, gue nemu sesuatu!",
            "Kayaknya ada masalah nih!",
            "Gue rasa kita harus lari!",
            "Coba liat nih!",
            "Gue gak percaya!"
        ],
        english: [
            "Hey, I found something!",
            "I think there's trouble!",
            "I feel we should run!",
            "Check this out!",
            "I can't believe it!"
        ]
    };

    const phrases = casualPhrases[language as keyof typeof casualPhrases] || casualPhrases.english;
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    return `"${randomPhrase}"`;
}

// Generate dramatic dialogue (optimized for short scenes)
function generateDramaticDialogue(character: CharacterProfile, sceneContext: string, language: string): string {
    const dramaticPhrases = {
        indonesian: [
            "Saya tidak bisa menahan ini!",
            "Ini momen menentukan!",
            "Saya sudah menunggu!",
            "Tidak ada yang bisa menghentikan saya!",
            "Ini kebenaran!"
        ],
        english: [
            "I can't hold this back!",
            "This is the moment!",
            "I've been waiting!",
            "Nothing can stop me!",
            "This is the truth!"
        ]
    };

    const phrases = dramaticPhrases[language as keyof typeof dramaticPhrases] || dramaticPhrases.english;
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    return `"${randomPhrase}"`;
}

// Generate comedic dialogue (optimized for short scenes)
function generateComedicDialogue(character: CharacterProfile, sceneContext: string, language: string): string {
    const comedicPhrases = {
        indonesian: [
            "Eh, ini lucu banget!",
            "Kamu tau gak?",
            "Gue nemu hal aneh!",
            "Ini gak masuk akal!",
            "Gue gak percaya!"
        ],
        english: [
            "Hey, this is funny!",
            "You know what?",
            "I found something weird!",
            "This is ridiculous!",
            "I can't believe it!"
        ]
    };

    const phrases = comedicPhrases[language as keyof typeof comedicPhrases] || comedicPhrases.english;
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    return `"${randomPhrase}"`;
}

// Generate poetic dialogue (optimized for short scenes)
function generatePoeticDialogue(character: CharacterProfile, sceneContext: string, language: string): string {
    const poeticPhrases = {
        indonesian: [
            "Seperti embun pagi...",
            "Dalam keheningan...",
            "Hati berbisik...",
            "Angin membawa pesan...",
            "Cahaya menerangi..."
        ],
        english: [
            "Like morning dew...",
            "In the silence...",
            "The heart whispers...",
            "Wind carries a message...",
            "Light illuminates..."
        ]
    };

    const phrases = poeticPhrases[language as keyof typeof poeticPhrases] || poeticPhrases.english;
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    return `"${randomPhrase}"`;
}

// Generate technical dialogue (optimized for short scenes)
function generateTechnicalDialogue(character: CharacterProfile, sceneContext: string, language: string): string {
    const technicalPhrases = {
        indonesian: [
            "Data menunjukkan masalah!",
            "Parameter error!",
            "Sistem bermasalah!",
            "Proses gagal!",
            "Konfigurasi salah!"
        ],
        english: [
            "Data shows problems!",
            "Parameter error!",
            "System malfunction!",
            "Process failed!",
            "Wrong configuration!"
        ]
    };

    const phrases = technicalPhrases[language as keyof typeof technicalPhrases] || technicalPhrases.english;
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    return `"${randomPhrase}"`;
}

// Generate natural dialogue (optimized for short scenes)
function generateNaturalDialogue(character: CharacterProfile, sceneContext: string, language: string): string {
    const naturalPhrases = {
        indonesian: [
            "Saya ingin bicara!",
            "Ada yang perlu dibahas!",
            "Saya punya sesuatu!",
            "Mari diskusikan!",
            "Saya perlu jelaskan!"
        ],
        english: [
            "I want to talk!",
            "We need to discuss!",
            "I have something!",
            "Let's discuss!",
            "I need to explain!"
        ]
    };

    const phrases = naturalPhrases[language as keyof typeof naturalPhrases] || naturalPhrases.english;
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    return `"${randomPhrase}"`;
}

// Apply emotional state to dialogue
function applyEmotionalState(dialogue: string, emotionalState: string): string {
    switch (emotionalState.toLowerCase()) {
        case 'angry':
            return dialogue.replace(/\./g, '!').replace(/\b(saya|gue|i)\b/gi, match => match.toUpperCase());
        case 'sad':
            return dialogue.replace(/\./g, '...').replace(/\b(sangat|very|really)\b/gi, 'sangat');
        case 'excited':
            return dialogue.replace(/\./g, '!').replace(/\b(bagus|good|great)\b/gi, 'luar biasa');
        case 'nervous':
            return dialogue.replace(/\b(saya|gue|i)\b/gi, match => match + '...');
        case 'confident':
            return dialogue.replace(/\b(mungkin|maybe|perhaps)\b/gi, 'pasti');
        default:
            return dialogue;
    }
}

// Apply personality traits to dialogue
function applyPersonalityTraits(dialogue: string, personality: string): string {
    if (personality.includes('shy')) {
        return dialogue.replace(/\b(saya|gue|i)\b/gi, match => match + '...');
    }
    if (personality.includes('bold')) {
        return dialogue.replace(/\./g, '!');
    }
    if (personality.includes('wise')) {
        return dialogue.replace(/\b(saya|gue|i)\b/gi, 'saya yakin');
    }
    if (personality.includes('funny')) {
        return dialogue.replace(/\b(serius|serious)\b/gi, 'serius banget');
    }

    return dialogue;
}

// Generate professional timing optimized for short scenes
function generateProfessionalTiming(dialogue: string[], duration: number): string[] {
    // For 8-second scenes, limit to 2-3 characters max
    const maxCharacters = Math.min(dialogue.length, 3);
    const effectiveDialogue = dialogue.slice(0, maxCharacters);

    // Calculate timing: 2-3 seconds per character for natural speech
    const timingPerLine = Math.floor((duration * 1000) / effectiveDialogue.length);
    const minTiming = 2000; // Minimum 2 seconds per line
    const actualTiming = Math.max(timingPerLine, minTiming);

    return effectiveDialogue.map((_, index) => {
        const startTime = index * actualTiming;
        const endTime = Math.min((index + 1) * actualTiming, duration * 1000);
        return `[${startTime}-${endTime}ms]`;
    });
}

// Generate emotional depth
function generateEmotionalDepth(dialogue: string[], characters: CharacterProfile[], scenePurpose: string): string[] {
    return dialogue.map((line, index) => {
        const character = characters[index];
        if (!character) return 'neutral';

        // Determine emotion based on scene purpose and character state
        if (scenePurpose.includes('climax')) {
            return character.emotionalState || 'intense';
        }
        if (scenePurpose.includes('opening')) {
            return 'curious';
        }
        if (scenePurpose.includes('development')) {
            return 'focused';
        }

        return character.emotionalState || 'neutral';
    });
}

// Generate character actions
function generateCharacterActions(dialogue: string[], characters: CharacterProfile[], _genre: string): string[] {
    return dialogue.map((line, index) => {
        const character = characters[index];
        if (!character) return 'standing';

        // Generate actions based on genre and character
        const actions = getGenreActions(_genre);
        const randomAction = actions[Math.floor(Math.random() * actions.length)];

        return `${character.name} ${randomAction}`;
    });
}

// Get genre-specific actions
function getGenreActions(genre: string): string[] {
    const actionMap: { [key: string]: string[] } = {
        drama: ['looks intently', 'gestures thoughtfully', 'leans forward', 'maintains eye contact'],
        comedy: ['grins widely', 'waves hands', 'does a double take', 'laughs'],
        thriller: ['glances around', 'speaks in hushed tones', 'moves cautiously', 'maintains alert posture'],
        romance: ['smiles warmly', 'moves closer', 'touches gently', 'maintains soft eye contact'],
        action: ['moves quickly', 'gestures decisively', 'maintains ready stance', 'speaks with urgency']
    };

    return actionMap[genre.toLowerCase()] || actionMap.drama;
}

// Generate camera instructions
function generateCameraInstructions(dialogue: string[], emotions: string[]): string[] {
    return dialogue.map((_, index) => {
        const emotion = emotions[index];

        switch (emotion) {
            case 'intense':
                return 'Close-up on face, dramatic lighting';
            case 'curious':
                return 'Medium shot, slight tilt';
            case 'focused':
                return 'Over-shoulder shot, steady focus';
            case 'angry':
                return 'Low angle, harsh lighting';
            case 'sad':
                return 'High angle, soft lighting';
            default:
                return 'Medium shot, natural lighting';
        }
    });
}

// Generate audio instructions
function generateAudioInstructions(dialogue: string[], emotions: string[]): string[] {
    return dialogue.map((_, index) => {
        const emotion = emotions[index];

        switch (emotion) {
            case 'intense':
                return 'Volume up, dramatic music';
            case 'curious':
                return 'Normal volume, ambient sounds';
            case 'focused':
                return 'Clear dialogue, minimal music';
            case 'angry':
                return 'Volume up, tense music';
            case 'sad':
                return 'Soft volume, melancholic music';
            default:
                return 'Balanced audio, background music';
        }
    });
}

// Generate character development
function generateCharacterDevelopment(characters: CharacterProfile[], scenePurpose: string): string {
    return characters.map(character => {
        const development = getCharacterDevelopment(character, scenePurpose);
        return `${character.name}: ${development}`;
    }).join(', ');
}

// Get character development based on scene purpose
function getCharacterDevelopment(character: CharacterProfile, scenePurpose: string): string {
    if (scenePurpose.includes('climax')) {
        return 'Reaches emotional peak, major character moment';
    }
    if (scenePurpose.includes('opening')) {
        return 'Establishes personality and motivations';
    }
    if (scenePurpose.includes('development')) {
        return 'Shows growth and change';
    }
    if (scenePurpose.includes('resolution')) {
        return 'Completes character arc';
    }

    return 'Maintains character consistency';
}

// Helper function to get purpose key
function getPurposeKey(scenePurpose: string): string {
    if (scenePurpose.includes('opening') || scenePurpose.includes('establish')) {
        return 'OPENING';
    }
    if (scenePurpose.includes('climax') || scenePurpose.includes('peak')) {
        return 'CLIMAX';
    }
    if (scenePurpose.includes('development') || scenePurpose.includes('develop')) {
        return 'DEVELOPMENT';
    }

    return 'OPENING';
}

// Generate generic dialogue fallback (optimized for short scenes)
function generateGenericDialogue(characters: CharacterProfile[], sceneContext: string, language: string): string[] {
    // Limit to 2-3 characters for 8-second scenes
    const maxCharacters = Math.min(characters.length, 3);
    const selectedCharacters = characters.slice(0, maxCharacters);

    return selectedCharacters.map(character => {
        const genericPhrases = {
            indonesian: "Saya ingin bicara!",
            english: "I want to talk!"
        };

        const phrase = genericPhrases[language as keyof typeof genericPhrases] || genericPhrases.english;
        return `${character.name}: "${phrase}"`;
    });
}

// Enhanced dialogue flow optimization
export function optimizeDialogueFlow(dialogues: ProfessionalDialogue[]): ProfessionalDialogue[] {
    return dialogues.map((dialogue, index) => {
        const previousDialogue = index > 0 ? dialogues[index - 1] : null;

        if (previousDialogue) {
            // Ensure emotional continuity
            dialogue.emotions = ensureEmotionalContinuity(
                dialogue.emotions,
                previousDialogue.emotions,
                dialogue.characters || []
            );

            // Ensure character development progression
            dialogue.characterDevelopment = ensureCharacterProgression(
                dialogue.characterDevelopment,
                previousDialogue.characterDevelopment
            );
        }

        return dialogue;
    });
}

// Ensure emotional continuity between scenes
function ensureEmotionalContinuity(
    currentEmotions: string[],
    previousEmotions: string[],
    characters: CharacterProfile[]
): string[] {
    return currentEmotions.map((emotion, index) => {
        const previousEmotion = previousEmotions[index];
        const character = characters[index];

        if (!previousEmotion || !character) return emotion;

        // Ensure logical emotional progression
        if (previousEmotion === 'angry' && emotion === 'happy') {
            return 'calming down';
        }
        if (previousEmotion === 'sad' && emotion === 'excited') {
            return 'finding hope';
        }
        if (previousEmotion === 'nervous' && emotion === 'confident') {
            return 'gaining confidence';
        }

        return emotion;
    });
}

// Ensure character progression
function ensureCharacterProgression(
    currentDevelopment: string,
    previousDevelopment: string
): string {
    // Add progression indicators
    if (previousDevelopment && currentDevelopment) {
        return `${currentDevelopment} (building on previous development)`;
    }

    return currentDevelopment;
}
