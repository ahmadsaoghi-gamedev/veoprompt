import { APISettings, VideoPromptWithOptimization } from '../types';

interface AnomalyCharacter {
  nama: string;
  deskripsi_fisik: string;
}

interface AnomalyStoryResponse {
  judul: string;
  sinopsis_per_adegan: string[];
}

interface StoryContext {
  judul: string;
  sinopsis_per_adegan: string[];
}

interface LanguageOptions {
  Language: string;
  Accent: string;
}


// Animation Style Definitions
const ANIMATION_STYLES = {
  'hyper-realistic-cgi': {
    name: 'Hyper-Realistic CGI (Avatar Style)',
    description: 'Photorealistic CGI with hyper-detailed skin textures, water simulation, environmental realism approaching live-action quality',
    technicalSpecs: 'subsurface scattering, advanced water physics, photogrammetry textures, volumetric lighting, realistic hair/fur simulation, micro-detail surface imperfections'
  },
  'stylized-comic-cel': {
    name: 'Stylized Comic-Cel Shading (Spider-Verse Style)',
    description: '3D cel-shading combined with 2D frame-by-frame effects, comic book aesthetic with dynamic visual storytelling',
    technicalSpecs: 'cel-shading, halftone patterns, comic book line art, dynamic camera angles, mixed frame rates, stylized motion blur, pop-art color palette'
  },
  'pixar-stylized-realism': {
    name: 'Pixar Stylized Realism (Toy Story Style)',
    description: 'Cartoon characters with exaggerated proportions but realistic materials and textures',
    technicalSpecs: 'stylized character design, realistic fabric simulation, advanced material shaders, soft lighting, exaggerated facial expressions, detailed texture work'
  },
  'dreamworks-cartoonish-realism': {
    name: 'DreamWorks Cartoonish Realism (HTTYD Style)',
    description: 'Fluid dynamic animation with vibrant colors and semi-realistic anatomy, especially for creatures and action sequences',
    technicalSpecs: 'dynamic fluid simulation, vibrant color grading, semi-realistic anatomy, advanced particle effects, dynamic lighting, expressive character animation'
  },
  'photorealistic-cgi': {
    name: 'Photorealistic CGI Animation (Lion King Style)',
    description: 'Documentary-level realism for animals and landscapes while maintaining dramatic storytelling direction',
    technicalSpecs: 'photorealistic animal fur, natural lighting, realistic animal behavior, environmental accuracy, documentary cinematography, natural color palette'
  },
  'abstract-mixed-media': {
    name: 'Abstract Mixed-Media (Soul Style)',
    description: '3D realistic elements combined with 2D abstract artistic elements for spiritual/emotional sequences',
    technicalSpecs: 'mixed 2D/3D rendering, abstract particle effects, stylized lighting transitions, artistic color palettes, non-photorealistic rendering techniques'
  },
  'textured-stylization': {
    name: 'Textured Stylization (Coco Style)',
    description: '3D animation with cultural folk art inspiration and rich textural details',
    technicalSpecs: 'cultural pattern integration, rich textile simulation, modern art-inspired textures, warm color palettes, detailed environmental storytelling'
  }
};

// NEW FUNCTION: Get Animation Style Technical Specs
function getAnimationStyleSpecs(styleKey: keyof typeof ANIMATION_STYLES): string {
  const style = ANIMATION_STYLES[styleKey];
  return `${style.name}: ${style.description}. Technical specifications: ${style.technicalSpecs}`;
}

// NEW FUNCTION: Generate Animation Style Prompt Enhancement
export function generateAnimationStylePrompt(
  basePrompt: string,
  animationStyle: keyof typeof ANIMATION_STYLES,
  culturalTheme?: string
): string {
  const styleSpecs = getAnimationStyleSpecs(animationStyle);
  const culturalIntegration = culturalTheme ? ` with ${culturalTheme} cultural elements` : '';

  return `${basePrompt}

**ANIMATION STYLE SPECIFICATION:**
${styleSpecs}${culturalIntegration}

**STYLE-SPECIFIC VISUAL ENHANCEMENTS:**
${getStyleSpecificEnhancements(animationStyle, culturalTheme)}`;
}

// Helper function for style-specific enhancements with international cultural support
function getStyleSpecificEnhancements(
  styleKey: keyof typeof ANIMATION_STYLES,
  culturalTheme?: string
): string {
  const enhancements: Record<keyof typeof ANIMATION_STYLES, string> = {
    'hyper-realistic-cgi': `
- Photorealistic skin textures with subsurface scattering
- Advanced water and fluid simulation
- Micro-detail environmental elements
- Realistic lighting with global illumination
- High-fidelity material properties`,

    'stylized-comic-cel': `
- Bold cel-shading with comic book line art
- Dynamic halftone patterns and pop-art colors
- Mixed frame rates for stylistic effect
- Exaggerated perspective and camera angles
- Comic book panel-inspired compositions`,

    'pixar-stylized-realism': `
- Exaggerated character proportions with realistic materials
- Advanced fabric and hair simulation
- Soft, warm lighting with emotional depth
- Detailed texture work on surfaces
- Expressive facial animation with squash-and-stretch`,

    'dreamworks-cartoonish-realism': `
- Vibrant, saturated color palette
- Fluid dynamic animation for action sequences
- Semi-realistic anatomy with cartoon expressiveness
- Advanced particle effects and atmospheric elements
- Dynamic lighting that supports storytelling`,

    'photorealistic-cgi': `
- Documentary-level animal and environmental realism
- Natural lighting and color grading
- Realistic animal behavior and movement
- Environmental accuracy and detail
- Cinematic composition with natural camera work`,

    'abstract-mixed-media': `
- Seamless blend of 2D and 3D elements
- Abstract particle effects and artistic transitions
- Non-photorealistic rendering techniques
- Stylized color palettes for emotional impact
- Mixed media textures and artistic overlays`,

    'textured-stylization': `
- Rich cultural pattern integration
- Detailed textile and fabric simulation
- modern art-inspired textures and materials
- Warm, culturally-appropriate color palettes
- Environmental storytelling through cultural details`
  };

  let enhancement = enhancements[styleKey];

  if (culturalTheme) {
    enhancement += `\n\n**CULTURAL INTEGRATION (${culturalTheme.toUpperCase()}):**
${getCulturalIntegrationSpecs(culturalTheme)}`;
  }

  return enhancement;
}

// NEW FUNCTION: International Cultural Integration Support
function getIndonesianInstruments(isModern: boolean): string {
  if (isModern) {
    return 'modern orchestral arrangements, electronic beats, synthesizer layers, hybrid cinematic scoring — creating a contemporary film soundscape';
  }
  return 'subtle cultural motifs integrated with cinematic orchestration, modern film scoring techniques, emotional string arrangements';
}


export function getCulturalIntegrationSpecs(
  culturalTheme: string,
  animationStyle?: string
): string {
  const isModern = animationStyle?.toLowerCase().includes('modern') ?? false;

  const culturalSpecs: Record<string, string> = {
    'indonesian': `
- Architecture: joglo, rumah adat, candi elements, modernized for contemporary visuals
- Cultural patterns: batik, songket, ikat textiles
- Musical instruments: ${getIndonesianInstruments(isModern)}
- Flora/fauna: komodo, orangutan, rafflesia, tropical landscapes
- Color palette: earth tones, modern batik-inspired hues`,

    'japanese': `
- Architecture: pagoda, torii gates, shoji screens
- Cultural patterns: sakura, wave motifs, geometric designs
- Musical instruments: shamisen, taiko drums, koto, shakuhachi flute — blended with cinematic strings for emotional depth
- Flora/fauna: cherry blossoms, koi fish, bamboo forests
- Color palette: red, white, gold, natural wood tones`,

    // Add other cultures here as previously defined...

    'modern-international': `
- Architecture: glass, steel, futuristic minimalism
- Cultural patterns: global fusion, digital art aesthetics
- Musical instruments: modular synths, electronic beats, world fusion ensembles
- Flora/fauna: urban parks, global species diversity
- Color palette: modern neutrals, metallics, tech-inspired palettes`,

    'fantasy': `
- Architecture: enchanted castles, floating cities
- Cultural patterns: magical glyphs, celestial runes
- Musical instruments: ethereal choirs, crystal harp, celestial bells — layered with deep cinematic strings and soundscapes
- Flora/fauna: mythical beasts, enchanted forests
- Color palette: purples, ethereal blues, shimmering golds`
  };

  return culturalSpecs[culturalTheme.toLowerCase()] || `
- Architecture: representative of ${culturalTheme} heritage, adapted for modern or classic styles
- Patterns: traditional motifs and design elements
- Musical instruments: authentic instruments fused with orchestral or modern sounds as appropriate
- Flora/fauna: iconic species and natural elements
- Color palette: inspired by ${culturalTheme} cultural aesthetics`;
}

export function getAvailableCulturalThemes(): string[] {
  return [
    'Indonesian', 'Japanese', 'Chinese', 'Korean', 'Indian',
    'Arabic', 'Persian',
    'European', 'Scandinavian',
    'African',
    'Latin-American', 'Native-American',
    'Polynesian',
    'Modern-International', 'Fantasy'
  ];
}

// Helper function to get dialog style based on accent
function getDialogStyleByAccent(accent: string): string {
  const accentStyles: Record<string, string> = {
    'Betawi': '- Use natural Jakarta slang (gue, lo, anjir, parah, kayak, gitu, sih, kan, deh)\n- Add Betawi dialect words like "iye", "kagak", "ape", "nih", "dah"\n- Use typical Betawi sentence structures',
    'Jawa': '- Use natural Javanese language with appropriate politeness level (ngoko for peers, krama for elders)\n- Include typical Javanese words like "mas", "mbak", "pak", "bu", "iki", "kuwi", "opo", "piye"\n- Add Javanese particles like "to", "ta", "kok", "lho"',
    'Sunda': '- Use natural and gentle Sundanese language\n- Include Sundanese words like "teh", "mah", "nya", "euy", "atuh", "yeuh"\n- Follow Sundanese sentence patterns',
    'US': '- Use natural American English with contemporary slang and idioms\n- Include contractions and casual expressions\n- Reflect modern American speech patterns',
    'British': '- Use British English with appropriate vocabulary and expressions\n- Include British slang and idioms where appropriate\n- Reflect British speech patterns and politeness conventions'
  };

  return accentStyles[accent] || '- Use natural language appropriate to the selected Accent';
}

// Helper function to get dialog language based on accent
function getDialogLanguageByAccent(accent: string): string {
  const languageMap: Record<string, string> = {
    'Betawi': 'Casual Indonesian with Betawi Dialect',
    'Jawa': 'Javanese',
    'Sunda': 'Sundanese',
    'US': 'American English',
    'British': 'British English'
  };

  return languageMap[accent] || 'Indonesian';
}


// Helper function to get correct language reference for instructions
function getCorrectLanguageReference(language: string, accent: string): string {
  if (language === 'Inggris' && accent === 'British') {
    return 'British English with authentic British accent';
  }
  if (language === 'Inggris' && accent === 'US') {
    return 'American English with authentic American accent';
  }
  if (language === 'Indonesia' && accent === 'Betawi') {
    return 'Indonesian with authentic Betawi accent';
  }
  if (language === 'Indonesia' && accent === 'Sunda') {
    return 'Indonesian with authentic Sundanese accent';
  }
  if (language === 'Indonesia' && accent === 'Jawa') {
    return 'Indonesian with authentic Javanese accent';
  }
  return `${language} with authentic ${accent} accent`;
}


// Helper function to detect existing dialogue in text
function detectExistingDialogue(text: string): { hasDialogue: boolean; dialogues: Array<{ speaker: string; emotion?: string; text: string; fullMatch: string }> } {
  const dialogues: Array<{ speaker: string; emotion?: string; text: string; fullMatch: string }> = [];

  // Pattern 1: **Character:** "dialogue"
  const pattern1 = /\*\*([^:*]+):\*\*\s*"([^"]+)"/g;
  let match;
  while ((match = pattern1.exec(text)) !== null) {
    dialogues.push({
      speaker: match[1].trim(),
      text: match[2].trim(),
      fullMatch: match[0]
    });
  }

  // Pattern 2: Character: "dialogue"
  const pattern2 = /^([^:*\n]+):\s*"([^"]+)"/gm;
  while ((match = pattern2.exec(text)) !== null) {
    if (!match[0].includes('**')) {
      dialogues.push({
        speaker: match[1].trim(),
        text: match[2].trim(),
        fullMatch: match[0]
      });
    }
  }

  // Pattern 3: [Character: (emotion), dialogue]
  const pattern3 = /\[([^:]+):\s*\(([^)]+)\),\s*([^\]]+)\]/g;
  while ((match = pattern3.exec(text)) !== null) {
    dialogues.push({
      speaker: match[1].trim(),
      emotion: match[2].trim(),
      text: match[3].trim(),
      fullMatch: match[0]
    });
  }

  // Pattern 4: Character (emotion): "dialogue"
  const pattern4 = /([^(\n]+)\s*\(([^)]+)\):\s*"([^"]+)"/g;
  while ((match = pattern4.exec(text)) !== null) {
    dialogues.push({
      speaker: match[1].trim(),
      emotion: match[2].trim(),
      text: match[3].trim(),
      fullMatch: match[0]
    });
  }

  return {
    hasDialogue: dialogues.length > 0,
    dialogues: dialogues
  };
}

// Helper function to translate character names to English
function translateCharacterName(name: string, toEnglish: boolean): string {
  if (!toEnglish) return name;

  const translations: Record<string, string> = {
    'ibu': 'Mother',
    'mom': 'Mother',
    'mama': 'Mother',
    'bunda': 'Mother',
    'anak': 'Child',
    'brian': 'Brian',
    'ayah': 'Father',
    'papa': 'Father',
    'bapak': 'Father',
    'kakak': 'Sibling',
    'adik': 'Younger Sibling',
    'nenek': 'Grandmother',
    'kakek': 'Grandfather',
    'paman': 'Uncle',
    'bibi': 'Aunt',
    'pekerja': 'Worker',
    'pekerja lapangan': 'Field Worker',
    'field worker': 'Field Worker'
  };

  const lowerName = name.toLowerCase();
  return translations[lowerName] || name;
}

// PERBAIKAN UNTUK DIALOG GENERATION
export async function generateAnomalyScenePrompt(
  storyContext: StoryContext,
  characters: { karakter_1: AnomalyCharacter; karakter_2: AnomalyCharacter; karakter_3: AnomalyCharacter },
  sceneNumber: number,
  totalScenes: number,
  languageOptions: LanguageOptions,
  referencePrompt: string,
  visualStyle: string,
  aspectRatio: string,
  apiSettings?: APISettings
): Promise<{
  visual_prompt: string;
  audio_prompt: string;
  dialog_en: string;
  dialog_id_gaul: string;
  narasi: string;
  veo3_optimized_prompt: string;
}> {
  const userIdea = `${storyContext.judul} - Scene ${sceneNumber}: ${storyContext.sinopsis_per_adegan[sceneNumber - 1]}. Characters: ${characters.karakter_1.nama} (${characters.karakter_1.deskripsi_fisik}), ${characters.karakter_2.nama} (${characters.karakter_2.deskripsi_fisik}), and ${characters.karakter_3.nama} (${characters.karakter_3.deskripsi_fisik})`;
  const Language_dipilih = languageOptions.Language;
  const genre_tone = "Realistic 3D Animation, Stylized 3D, Semi-realistic/stylized cartoon, DreamWorks Turbo, Pixar-Disney quality";

  // Check if dialogue already exists in the scene
  const existingDialogue = detectExistingDialogue(storyContext.sinopsis_per_adegan[sceneNumber - 1]);

  const dialogueInstructions = existingDialogue.hasDialogue ? `
**ABSOLUTE DIALOG PRESERVATION MANDATE:**
"The scene description ALREADY CONTAINS DIALOGUE. You MUST:
1. COPY the existing dialogue EXACTLY as written - ZERO TOLERANCE FOR MODIFICATION
2. DO NOT change any words, punctuation, or sentence structure
3. DO NOT fix apparent inconsistencies (like [Son] vs [Brian])
4. DO NOT translate or rephrase any dialogue
5. DO NOT add or remove any dialogue lines
6. DO NOT translate character names - keep them EXACTLY as provided in brackets
7. PRESERVE the original character labels in the dialog brackets

EXISTING DIALOGUE TO PRESERVE EXACTLY:
${storyContext.sinopsis_per_adegan[sceneNumber - 1]}

CHARACTER NAME MAPPING FOR VISUAL DESCRIPTIONS ONLY:
- [Mom] = ${characters.karakter_1.nama} (use in visual/audio descriptions)
- [Brian]/[Son] = ${characters.karakter_2.nama} (use in visual/audio descriptions)
- [beggar] = ${characters.karakter_3.nama} (use in visual/audio descriptions)

YOU ARE FORBIDDEN FROM MODIFYING THE DIALOGUE. COPY-PASTE IT EXACTLY."` : `
**DIALOGUE CREATION RULE:**
"No existing dialogue was found in the scene description. You should CREATE appropriate dialogue for the characters based on the scene context."`;

  const dynamicPrompt = `
**SYSTEM COMMAND (MAIN RULE):**
"You are a professional film director and screenwriter. Your task is to read the scene description and handle dialogue appropriately."

${dialogueInstructions}

**RULE 1: ANTI-COPYRIGHT (VERY IMPORTANT):**
"DO NOT use copyrighted characters. All characters MUST be 100% original."

**RULE 2: 8-SECOND DURATION WITH BRACKET FORMAT (CRITICAL):**
"The total duration is ONLY 8 SECONDS. Follow these strict rules:
- Each character can speak approximately 2-3 words per second
- Total word count for ALL dialogue combined: 15-25 words maximum
- Each character should speak 1-2 short sentences (5-15 words per character)
- MANDATORY FORMAT: Each character's line MUST be wrapped in brackets
- Multiple character lines MUST be separated by NEWLINES (\\n)
- MUST use the exact character names provided: ${characters.karakter_1.nama}, ${characters.karakter_2.nama}, ${characters.karakter_3.nama}
- Example format: '[${characters.karakter_1.nama}: (excited), Dialogue here!]\\n[${characters.karakter_2.nama}: (amazed), Response here!]\\n[${characters.karakter_3.nama}: (happy), Another response!]'"

**MAIN TASK:**
"Based on the user's **Story Idea**: '${userIdea}', create a new JSON object that follows the structure below:"

**REFERENCE STYLE:**
"${referencePrompt}"

**MAIN CHARACTERS PROVIDED:**
- CHARACTER 1: ${characters.karakter_1.nama} - ${characters.karakter_1.deskripsi_fisik}
- CHARACTER 2: ${characters.karakter_2.nama} - ${characters.karakter_2.deskripsi_fisik}
- CHARACTER 3: ${characters.karakter_3.nama} - ${characters.karakter_3.deskripsi_fisik}

**MUST FOLLOW JSON OUTPUT STRUCTURE:**

{
  "visual_prompt": "[String] WRITE IN ENGLISH ONLY. Start with 'A ${visualStyle} 3D animated scene.' Description of visuals, cinematography, setting, and character actions. In this description, name all the characters present in the scene (e.g., '${characters.karakter_1.nama}, ${characters.karakter_2.nama}, and ${characters.karakter_3.nama} are...' and use their initials for consistent character traits such as body, face, hair, height, and accessories). End with: 'Cinematography: [describe camera movement, angles, and lighting appropriate to the style]. Aspect Ratio: ${aspectRatio}.'",
  
  "audio_prompt": "[String] WRITE IN ENGLISH ONLY. Description of background music and sound effects. Include: modern cinematic orchestral music (avoid traditional instruments unless specifically requested), spatial audio design, character voice acting direction for all characters (describe voice characteristics), ambient soundscape, foley effects, dynamic range, and emotional musical themes. For modern 3D animation, use contemporary film scoring with electronic elements, hybrid orchestral arrangements, and modern sound design.",
  
  "dialogue": "[String] ${existingDialogue.hasDialogue ? 'EXACT COPY OF PROVIDED DIALOG - NO MODIFICATIONS ALLOWED. Copy the dialogue EXACTLY as it appears in the scene, preserving all character names in brackets, punctuation, and line breaks. DO NOT translate character names or modify any words.' : `WRITE IN ${getDialogLanguageByAccent(languageOptions.Accent)} ONLY. Create dialogue with MANDATORY bracket format. Each character's line in brackets, SEPARATED BY NEWLINES (\\n). Example for ${languageOptions.Accent === 'US' || languageOptions.Accent === 'British' ? 'English' : 'Indonesian'}: ${languageOptions.Accent === 'US' || languageOptions.Accent === 'British' ? "'[${characters.karakter_1.nama}: (excited), This is amazing!]\\n[${characters.karakter_2.nama}: (surprised), I can\\'t believe it!]\\n[${characters.karakter_3.nama}: (happy), Let\\'s do this together!]'" : "'[${characters.karakter_1.nama}: (senang), Wah, keren banget!]\\n[${characters.karakter_2.nama}: (terkejut), Gila, gak nyangka!]\\n[${characters.karakter_3.nama}: (semangat), Yuk, kita lakukan bareng!]'"} Total 8 seconds - approximately 15-25 words total. MUST use character names: ${characters.karakter_1.nama}, ${characters.karakter_2.nama}, ${characters.karakter_3.nama}. Style: ${getDialogStyleByAccent(languageOptions.Accent)}`}",
  
  "narration": "[String] WRITE IN INDONESIAN ONLY. Script for the narrator. Engaging, dynamic narration that builds the story atmosphere. The language style should match the genre, not monotonous, and effectively strengthen the story mood.",
  
  "veo3_optimized_prompt": "[String] MIXED STRUCTURED LANGUAGE. Optimized prompt specifically for Gemini Veo3 with very specific instructions about who speaks when, integrating style elements from the reference."
}

**ENHANCED SPECIAL INSTRUCTIONS FOR VEO3_OPTIMIZED_PROMPT:**
Create a prompt with the following ADVANCED SPECIFIC pattern for character speaking integration and visual style adaptation:

"${existingDialogue.hasDialogue ?
      `ABSOLUTE DIALOG PRESERVATION MANDATE: Utilize the EXACT provided dialog maintaining complete textual integrity without modifications, additions, or deletions.

IMMERSIVE VISUAL SCENE CONSTRUCTION: [Engineer comprehensive visual narrative that seamlessly SUPPORTS and enhances the existing dialog - craft detailed scenes where ${characters.karakter_1.nama} embodies the maternal/nurturing character role, ${characters.karakter_2.nama} portrays the curious/energetic child character, ${characters.karakter_3.nama} represents the third-party/stranger character, with dynamic actions, environmental settings, character positioning, and emotional expressions that organically complement and validate the provided dialog flow]

PRECISION CHARACTER VISUAL MAPPING:
- Dialog reference [Mom]/[Mother] → Visual representation: ${characters.karakter_1.nama} with maternal characteristics and nurturing body language
- Dialog reference [Brian]/[Son]/[Child] → Visual representation: ${characters.karakter_2.nama} with youthful energy and curious expressions
- Dialog reference [beggar]/[Stranger]/[Third Party] → Visual representation: ${characters.karakter_3.nama} with appropriate contextual appearance

DIALOG EXECUTION REQUIREMENT - ABSOLUTE PRESERVATION PROTOCOL:
[Execute complete copy-paste transfer of the exact dialog sequence from source material, maintaining original character naming conventions within brackets, preserving punctuation, emotional indicators, and conversational flow]

COMPREHENSIVE AUDIO ARCHITECTURE: [Design sophisticated audio landscape supporting the preserved dialog integrity, incorporating character-specific voice characteristics that authentically match visual character representations, environmental soundscape enhancement, emotional musical scoring, and spatial audio positioning]

PRODUCTION EXCELLENCE DIRECTIVE: The dialog content represents immutable source material requiring ABSOLUTE preservation. Construct ALL visual, auditory, and narrative elements to harmoniously support and enhance the existing conversational framework without compromising textual authenticity.`
      :
      `ADVANCED LANGUAGE EXECUTION MANDATE: Generate premium video content featuring authentic ${getCorrectLanguageReference(Language_dipilih, languageOptions.Accent)} linguistic delivery with cultural accuracy and natural conversational flow.

DYNAMIC VISUAL SCENE ORCHESTRATION: [Develop rich visual narrative incorporating detailed environmental context, character interaction choreography, emotional expression mapping, lighting transitions, camera movement patterns, and style-appropriate aesthetic elements that enhance storytelling impact while accommodating character speaking sequences]

COMPREHENSIVE CHARACTER PERFORMANCE INSTRUCTION:
${characters.karakter_1.nama}: [Detailed speaking visual cues, facial animation requirements, body language synchronization, emotional expression timing, voice delivery characteristics, and scene positioning]
${characters.karakter_2.nama}: [Comprehensive speaking performance guidelines, lip-sync precision, gestural coordination, personality expression markers, vocal tone characteristics, and interaction dynamics]
${characters.karakter_3.nama}: [Complete speaking direction including facial movement precision, character-specific mannerisms, emotional authenticity, voice characteristics alignment, and scene integration]

LINGUISTIC AUTHENTICITY REQUIREMENT - MANDATORY ${getCorrectLanguageReference(Language_dipilih, languageOptions.Accent).toUpperCase()} EXECUTION:
[${characters.karakter_1.nama}: (precise_emotional_descriptor), culturally_authentic_dialogue_delivery]
[${characters.karakter_2.nama}: (detailed_emotional_state), linguistically_accurate_speech_content]
[${characters.karakter_3.nama}: (specific_emotional_context), accent_appropriate_dialogue_expression]

SOPHISTICATED AUDIO DESIGN ARCHITECTURE: [Engineer multi-layered audio environment featuring character-specific voice profiling with accent authenticity, environmental soundscape design, emotional musical scoring with genre-appropriate instrumentation, spatial audio positioning, foley effects integration, and dynamic range optimization]

PRODUCTION EXCELLENCE PROTOCOL: ALL verbal communication must demonstrate ${getCorrectLanguageReference(Language_dipilih, languageOptions.Accent)} linguistic precision with zero cross-language contamination. CHARACTER NAMING COMPLIANCE: Utilize EXCLUSIVELY these exact character designations: ${characters.karakter_1.nama}, ${characters.karakter_2.nama}, ${characters.karakter_3.nama} throughout all content generation phases.`}"

**CREATIVE FOUNDATION PARAMETERS:**
${userIdea}

**LINGUISTIC TARGET SPECIFICATION:**
${Language_dipilih}

**CULTURAL ACCENT AUTHENTICATION:**
${languageOptions.Accent}

**NARRATIVE GENRE/TONAL DIRECTION:**
${genre_tone}

**PRODUCTION DURATION CONSTRAINT: 1 MINUTE - Dialog development must be comprehensive, character-driven, with strategic multi-character speaking distribution and natural conversational pacing**

Execute JSON generation with enhanced structure specifications and cinema-grade scenario development with production-ready optimization for Gemini Veo3 rendering capabilities.`;


  const response = await callGeminiAPI(dynamicPrompt, undefined, apiSettings);
  try {
    // Use enhanced JSON parsing with fallback mechanisms
    const result = extractAndParseJson(response);

    // Ensure dialogue field exists and is properly formatted
    if (result.dialogue) {
      // Ensure newlines are properly formatted
      result.dialogue = (result.dialogue as string).replace(/\]\s*\[/g, ']\n[');
    }

    // Generate optimized Veo3 prompt dengan character-specific instructions
    if (!result.veo3_optimized_prompt) {
      result.veo3_optimized_prompt = generateEnhancedVeo3OptimizedPrompt(
        result.visual_prompt as string,
        result.audio_prompt as string,
        result.dialogue as string || '',
        Language_dipilih,
        characters,
        languageOptions
      );
    }

    // Map dialogue based on language selection for backward compatibility
    const isEnglishLanguage = languageOptions.Accent === 'US' || languageOptions.Accent === 'British';

    // Set dialog_en and dialog_id_gaul based on language selection
    if (isEnglishLanguage) {
      result.dialog_en = result.dialogue || '';
      result.dialog_id_gaul = ''; // Empty for English
    } else {
      result.dialog_id_gaul = result.dialogue || '';
      result.dialog_en = ''; // Empty for Indonesian
    }

    return result as {
      visual_prompt: string;
      audio_prompt: string;
      dialog_en: string;
      dialog_id_gaul: string;
      narasi: string;
      veo3_optimized_prompt: string;
    };
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    throw new Error('Invalid JSON response from API');
  }
}

// FUNGSI BARU: Enhanced Veo3 Prompt dengan Character-Specific Instructions
function generateEnhancedVeo3OptimizedPrompt(
  visualPrompt: string,
  audioPrompt: string,
  dialogue: string,
  language: string,
  characters: { karakter_1: AnomalyCharacter; karakter_2: AnomalyCharacter; karakter_3: AnomalyCharacter },
  languageOptions?: LanguageOptions
): string {
  // Clean prompts
  const cleanVisual = visualPrompt.replace(/\[Language:.*?\]/g, '').trim();
  const cleanAudio = audioPrompt.replace(/\[Language:.*?\]/g, '').trim();
  const cleanDialog = dialogue.replace(/\[Language:.*?\]/g, '').trim();

  // Ensure proper newline formatting in dialog
  const formattedDialog = cleanDialog.replace(/\]\s*\[/g, ']\n[');

  // Parse dialog untuk mengidentifikasi siapa yang berbicara dengan lebih akurat
  const dialogLines = formattedDialog.split('\n').filter(line => line.trim());

  // Create detailed speaking order with explicit instructions
  const characterDialogueMap: { character: string; line: string; order: number; emotion?: string; dialogText?: string }[] = [];

  dialogLines.forEach((line, index) => {
    // Extract character name, emotion, and dialogue text more accurately
    const match = line.match(/\[([^:]+):\s*(?:\(([^)]+)\),)?\s*([^\]]+)\]/);
    if (match) {
      const speakerName = match[1].trim();
      const emotion = match[2]?.trim();
      const dialogText = match[3]?.trim();

      // Determine which character is speaking
      let characterIdentified = '';
      if (speakerName === characters.karakter_1.nama || line.includes(characters.karakter_1.nama)) {
        characterIdentified = characters.karakter_1.nama;
      } else if (speakerName === characters.karakter_2.nama || line.includes(characters.karakter_2.nama)) {
        characterIdentified = characters.karakter_2.nama;
      } else if (speakerName === characters.karakter_3.nama || line.includes(characters.karakter_3.nama)) {
        characterIdentified = characters.karakter_3.nama;
      }

      if (characterIdentified) {
        characterDialogueMap.push({
          character: characterIdentified,
          line: line,
          order: index + 1,
          emotion: emotion,
          dialogText: dialogText
        });
      }
    }
  });

  // Calculate timing for 8-second scene
  const totalDuration = 8; // seconds
  const dialogueCount = characterDialogueMap.length;
  const timePerDialogue = dialogueCount > 0 ? totalDuration / dialogueCount : totalDuration;

  // Generate explicit speaking order instructions with professional film terminology
  const orderWords = ['FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'SIXTH', 'SEVENTH', 'EIGHTH'];
  const professionalTimingInstructions: string[] = [];

  characterDialogueMap.forEach((item, index) => {
    const orderWord = orderWords[index] || `LINE ${index + 1}`;
    const otherCharacters = [characters.karakter_1.nama, characters.karakter_2.nama, characters.karakter_3.nama]
      .filter(name => name !== item.character);

    const startTime = (index * timePerDialogue).toFixed(1);
    const endTime = ((index + 1) * timePerDialogue).toFixed(1);
    const emotionDirection = item.emotion ? ` with ${item.emotion.toUpperCase()} emotion` : '';

    professionalTimingInstructions.push(`
🎬 ${orderWord} SHOT (${startTime}s - ${endTime}s):
SPEAKING CHARACTER: ${item.character}${emotionDirection}
DIALOGUE: "${item.dialogText || item.line}"

CINEMATOGRAPHY DIRECTION:
- CAMERA: ${index === 0 ? 'ESTABLISHING SHOT then PUSH IN' : index % 2 === 0 ? 'MEDIUM CLOSE-UP' : 'OVER-THE-SHOULDER'} on ${item.character}
- FOCUS: RACK FOCUS to ${item.character}, soft bokeh on background
- LIGHTING: KEY LIGHT emphasizes ${item.character}'s face, practical motivated lighting

CHARACTER BLOCKING:
- ${item.character}: CENTER FRAME, animated speaking with clear lip-sync, ${item.emotion || 'engaged'} facial expression
- ${otherCharacters[0]}: ${index % 2 === 0 ? 'FRAME LEFT' : 'FRAME RIGHT'}, reactive listening, subtle head nods
- ${otherCharacters[1] || 'Background'}: ${otherCharacters[1] ? 'BACKGROUND or OFF-FRAME, environmental presence' : 'Environmental elements only'}

AUDIO MIX:
- DIALOGUE: ${item.character} voice PROMINENT (0dB), room tone ambience
- FOLEY: Subtle cloth rustles, breathing, environmental sounds
- MUSIC: Underscore at -12dB, emotional support without overwhelming dialogue`);
  });

  // Get the correct language reference based on the original language options
  const languageRef = languageOptions
    ? getCorrectLanguageReference(languageOptions.Language, languageOptions.Accent)
    : getCorrectLanguageReference(language, characters.karakter_1.nama.includes('Mother') || characters.karakter_1.nama.includes('Father') ? 'British' : 'Betawi');

  return `🎥 PROFESSIONAL FILM PRODUCTION DIRECTIVE 🎥
LANGUAGE EXECUTION: ${languageRef} with authentic accent and natural delivery

📋 SCENE BREAKDOWN:
${cleanVisual}

⏱️ TIMING SHEET - 8 SECOND SCENE ⏱️
${professionalTimingInstructions.join('\n')}

🎭 CAST SHEET:
- LEAD: ${characters.karakter_1.nama} - ${characters.karakter_1.deskripsi_fisik}
- SUPPORTING: ${characters.karakter_2.nama} - ${characters.karakter_2.deskripsi_fisik}
- FEATURED: ${characters.karakter_3.nama} - ${characters.karakter_3.deskripsi_fisik}

📝 DIALOGUE SCRIPT (LOCKED):
${formattedDialog}

🎵 AUDIO POST-PRODUCTION:
${cleanAudio}

🎬 DIRECTOR'S CRITICAL NOTES FOR VEO3:
1. CHARACTER VOICE CASTING: Each character MUST have distinct voice timbre, age-appropriate, matching physical description
2. LIP-SYNC PRECISION: Frame-accurate mouth movements ONLY during character's dialogue delivery
3. REACTION SHOTS: Non-speaking characters maintain scene continuity with appropriate reactions
4. DIALOGUE PACING: Natural conversation rhythm with micro-pauses between speakers
5. SCENE CONTINUITY: Maintain 180-degree rule, consistent eye-lines, motivated blocking
6. PERFORMANCE AUTHENTICITY: ${languageRef} delivery must sound native, not translated
7. TECHNICAL SPECS: 24fps minimum, professional color grading, cinematic aspect ratio

✅ FINAL QUALITY CHECK:
□ ${characters.karakter_1.nama} delivers ONLY their scripted lines at designated times
□ ${characters.karakter_2.nama} delivers ONLY their scripted lines at designated times
□ ${characters.karakter_3.nama} delivers ONLY their scripted lines at designated times
□ NO dialogue overlap or character voice confusion
□ ALL dialogue in ${languageRef} with proper accent
□ Professional film production quality matching industry standards`;
}

// FUNGSI UNTUK VIDEO PROMPTS FROM IMAGE - JUGA DIPERBAIKI
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

  // Check if dialogue already exists in the user idea
  const existingDialogue = detectExistingDialogue(userIdea);

  // Format existing dialogue for better preservation
  const formattedExistingDialogue = existingDialogue.dialogues.map(d => {
    const translatedSpeaker = translateCharacterName(d.speaker, languageOptions.Accent === 'British' || languageOptions.Accent === 'US');
    return {
      original: d.fullMatch,
      formatted: `[${translatedSpeaker}${d.emotion ? ` (${d.emotion})` : ''}: "${d.text}"]`
    };
  });

  const dialogueInstructions = existingDialogue.hasDialogue ? `
**CRITICAL DIALOGUE PRESERVATION RULE:**
"The story idea ALREADY CONTAINS DIALOGUE. You MUST:
1. EXTRACT the existing dialogue EXACTLY as written from the story
2. DO NOT create any new dialogue
3. USE ONLY the dialogue found in the story idea
4. Distribute the existing dialogue across the 8 scenes appropriately
5. If a scene has no dialogue from the original, leave dialogue fields empty for that scene
6. When using British or US accent, translate character names (e.g., "Ibu" → "Mother", "Anak" → "Child")

EXISTING DIALOGUE DETECTED (USE THESE EXACT DIALOGUES):
${formattedExistingDialogue.map(d => d.formatted).join('\n')}

MAPPING FOR YOUR REFERENCE:
${formattedExistingDialogue.map(d => `Original: ${d.original} → Use: ${d.formatted}`).join('\n')}

YOU ARE FORBIDDEN FROM CREATING NEW DIALOGUE. USE ONLY WHAT EXISTS ABOVE.
DISTRIBUTE THESE DIALOGUES ACROSS THE 8 SCENES AS APPROPRIATE TO THE STORY FLOW."` : `
**DIALOGUE CREATION RULE:**
"No existing dialogue was found in the story idea. You should CREATE appropriate dialogue for the characters based on the story context."

**DIALOGUE CREATION COMMANDS (FOLLOW IN SEQUENCE):**

**Step 1: Create Master Dialogue (English Language)**
* **AI Role:** "You are a professional film screenwriter. Write natural, intelligent dialogue with rich subtext in English Language."
* **Task:** Create dialogue in standard screenplay format. This will serve as the "source of truth".
* **Format:** 'CHARACTER_A: (tone/emotion description) dialogue text' and 'CHARACTER_B: (tone/emotion description) dialogue text'
* **Rules:** Minimum 2 characters MUST speak with clear turn-taking.

**Step 2: Creative Adaptation to Indonesian Slang**
* **AI Role:** "Now you are a translator and screenwriter for Jakarta youth sitcoms. Your task is NOT literal translation, but creative adaptation of Step 1 dialogue."
* **Task:** Take the English dialogue you just created and rewrite it in 100% natural Jakartan slang, like casual hangout talk.
* **SYNC RULES (CRITICAL):**
    * Speaking character order MUST MATCH EXACTLY the English version.
    * Number of dialogue lines MUST MATCH EXACTLY.
    * Conversation logic (who asks, who answers, who sarcastically remarks) MUST MATCH EXACTLY.
* **Language Style:** Use natural Jakartan slang (gue, lo, anjir, parah, kayak, gitu, sih, kan, deh).`;

  const dynamicPrompt = `
**MAIN SYSTEM INSTRUCTION:**
You are a professional screenwriter specializing in high-quality 3D animation for Gemini Veo3.

**CRITICAL RULES:**

1. **COPYRIGHT-FREE (MANDATORY):**
   - DO NOT use characters, names, designs, or visual elements from copyrighted properties
   - All elements MUST be 100% original

2. **DIALOG CONSISTENCY:**
   - Each scene MUST have at least 2 speaking characters
   - Dialogue format must be consistent: "CHARACTER_NAME: (expression) dialogue"
   - Indonesian language dialogues must use the same format as English dialogues"

${dialogueInstructions}

**MAIN TASK:**
Generate JSON with 8 scene prompts containing clear character dialogue.

**STRUKTUR OUTPUT JSON:**

{
  "video_prompts": [
    {
      "scenePrompt": "[Language: ENGLISH] Detailed visual scene description. MUST include: setting, shot composition, lighting, camera movement, character action, and IMPORTANT: describe in detail when each character speaks with mouth movement and facial expressions.",

"narasi": "[Language: INDONESIAN] Engaging voice-over narration.",

"dialog_en": "[String] Result from **Step 1** (Master Language Dialogue in English). Format: '[CHARACTER_A: (emotion), dialogue]' and '[CHARACTER_B: (emotion), dialogue]'.",

"dialog_id": "[String] Result from **Step 2** (Creative Adaptation in Slang Indonesian Language). Format MUST be identical to dialog_en in terms of speaker order and number of lines. Example: '[Character: (expression), dialogue]'",

"veo3_optimized_prompt": "[Language: STRUCTURED MIX] Optimized prompt for Veo3 with specific instructions about character speaking assignment."
    }
    // ... total 8 scenes
  ]
}

**INSTRUCTION FOR VEO3_OPTIMIZED_PROMPT:**
Each scene MUST include a prompt with clear character assignment:

"LANGUAGE INSTRUCTION: Generate video with Indonesian dialog featuring conversation between [KARAKTER_A] and [KARAKTER_B].

VISUAL SCENE: [scene description with detailed mouth movement for each character]

CHARACTER SPEAKING SEQUENCE:
1. [KARAKTER_A] speaks first: [visual cues]
2. [KARAKTER_B] responds: [visual cues]
3. [KARAKTER_C] responds: [visual cues]

DIALOG REQUIREMENT: [Indonesian dialog with clear character names]

CRITICAL INSTRUCTION: Show clear turn-taking between characters with distinct mouth movements and facial expressions for each speaker."

**STORY IDEA:**
${userIdea}

**SELECTED LANGUAGE FOR DIALOGUE:**
${Language_dipilih}

**REQUESTED GENRE/TONE:**
${genre_tone}

Generate JSON with 8 scene prompts ensuring clear multi-character dialogue with synchronized dialog system.`;

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

// Enhanced JSON cleaning and parsing utilities
function cleanJsonString(text: string): string {
  // Remove common problematic characters and patterns
  let cleaned = text.trim();

  // Remove markdown code blocks more aggressively
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/gm, '');
  cleaned = cleaned.replace(/\n?```\s*$/gm, '');

  // Remove markdown formatting
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold markdown
  cleaned = cleaned.replace(/###\s*(.*?)$/gm, '$1'); // Remove heading markdown
  cleaned = cleaned.replace(/^\s*[-*]\s*/gm, ''); // Remove bullet points

  // Fix common JSON issues - use proper Unicode ranges to avoid ESLint errors
  // eslint-disable-next-line no-control-regex
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters
  cleaned = cleaned.replace(/\n/g, '\\n'); // Escape newlines in strings
  cleaned = cleaned.replace(/\r/g, '\\r'); // Escape carriage returns
  cleaned = cleaned.replace(/\t/g, '\\t'); // Escape tabs
  cleaned = cleaned.replace(/\\/g, '\\\\'); // Escape backslashes
  cleaned = cleaned.replace(/"/g, '\\"'); // Escape quotes

  // Try to extract JSON if the response contains other text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  return cleaned;
}

function extractAndParseJson(text: string): Record<string, unknown> {
  // First attempt: direct parsing
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    console.warn('Direct JSON parsing failed, attempting cleanup...');
  }

  // Second attempt: with basic cleaning
  try {
    const cleaned = cleanJsonString(text);
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    console.warn('Cleaned JSON parsing failed, attempting manual extraction...');
  }

  // Third attempt: manual JSON extraction and reconstruction
  try {
    // Find JSON boundaries
    const startIndex = text.indexOf('{');
    const lastIndex = text.lastIndexOf('}');

    if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
      let jsonStr = text.substring(startIndex, lastIndex + 1);

      // Clean up the extracted JSON string - use proper Unicode ranges
      // eslint-disable-next-line no-control-regex
      jsonStr = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters
      jsonStr = jsonStr.replace(/\n/g, ' '); // Replace newlines with spaces
      jsonStr = jsonStr.replace(/\r/g, ' '); // Replace carriage returns with spaces
      jsonStr = jsonStr.replace(/\t/g, ' '); // Replace tabs with spaces
      jsonStr = jsonStr.replace(/\s+/g, ' '); // Normalize whitespace

      return JSON.parse(jsonStr) as Record<string, unknown>;
    }
  } catch {
    console.warn('Manual JSON extraction failed...');
  }

  // Fourth attempt: try to reconstruct basic JSON structure
  try {
    // Look for key-value patterns and reconstruct
    const result: Record<string, string> = {};

    // Extract visual_prompt
    const visualMatch = text.match(/"visual_prompt"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
    if (visualMatch) result.visual_prompt = visualMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');

    // Extract audio_prompt
    const audioMatch = text.match(/"audio_prompt"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
    if (audioMatch) result.audio_prompt = audioMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');

    // Extract dialog_en
    const dialogEnMatch = text.match(/"dialog_en"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
    if (dialogEnMatch) result.dialog_en = dialogEnMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');

    // Extract dialog_id_gaul
    const dialogIdMatch = text.match(/"dialog_id_gaul"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
    if (dialogIdMatch) result.dialog_id_gaul = dialogIdMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');

    // Extract narasi
    const narasiMatch = text.match(/"narasi"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
    if (narasiMatch) result.narasi = narasiMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');

    // Extract veo3_optimized_prompt
    const veo3Match = text.match(/"veo3_optimized_prompt"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
    if (veo3Match) result.veo3_optimized_prompt = veo3Match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');

    if (Object.keys(result).length > 0) {
      return result;
    }
  } catch {
    console.warn('JSON reconstruction failed...');
  }

  throw new Error('Unable to parse JSON response after multiple attempts');
}

// Keep all other existing functions unchanged...
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

export async function generateVideo(prompt: string, apiSettings?: APISettings): Promise<string> {
  // This would integrate with Veo 3 API for actual video generation
  // For now, we'll simulate the process
  const apiKey = apiSettings?.privateKey;

  if (!apiKey || !apiKey.trim()) {
    throw new Error('API key is required for video generation. Please configure your API key in the settings.');
  }

  // Simulate video generation delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Return a mock video URL - in production this would be the actual video URL from Veo 3
  return `data:video/mp4;base64,${btoa('mock-video-data-' + Date.now())}`;
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  // Simple translation using Google Translate API simulation
  // In production, you'd use the actual Google Translate API
  // Translation placeholder - would use actual API in production

  // For now, return the original text with a language indicator
  return `[${targetLanguage.toUpperCase()}] ${text}`;
}

export async function generateAnomalyCharacters(userIdea: string, apiSettings?: APISettings): Promise<{
  karakter_1: { nama: string; deskripsi_fisik: string };
  karakter_2: { nama: string; deskripsi_fisik: string };
  karakter_3: { nama: string; deskripsi_fisik: string };
}> {
  const prompt = `You are a professional character concept designer for high-quality 3D animated films. Based on the following story idea: '${userIdea}'

**IMPORTANT INSTRUCTIONS:**
- DO NOT use generic, clichéd, or soulless characters like "Rice Cooker" or "Sponge"
- MUST create characters that are relevant to the given theme and storyline
- Characters MUST have unique, original, and highly imaginative physical features that can be visualized cinematically

**TASKS:**
1. Identify and select the 3 most iconic and potential main characters from the given story
2. Provide a detailed physical description of each character, surreal yet functional for animation, including body shape, texture, dominant colors, and distinctive facial expressions
3. Assign a creative and memorable nickname that reflects the character's personality in the story
4. Ensure the output is in clean JSON format, ready for the modeling & animation team

**OUTPUT FORMAT:**
{"character_1": {"name": "[First character name]", "physical_description": "[Surreal and expressive description]"}, "character_2": {"name": "[Second character name]", "physical_description": "[Surreal and expressive description]"}, "character_3": {"name": "[Third character name]", "physical_description": "[Surreal and expressive description]"}}

**EXAMPLE:**
If the story is about "A wise old wooden drum, a quiet Electric Pole, and a cheerful Street Lamp," the output must use these three characters with enriched visual descriptions like aged wood textures with intricate carvings, cables forming facial expressions, or flickering lights creating a smiling face.

Analyze the story idea deeply and create 3 characters with strong physicality, expressions, and aura, as if they are ready to star in a world-class 3D animated film.`;

  const response = await callGeminiAPI(prompt, undefined, apiSettings);
  return JSON.parse(response);
}

export async function generateAnomalyStory(
  characters: { karakter_1: AnomalyCharacter; karakter_2: AnomalyCharacter; karakter_3: AnomalyCharacter },
  userIdea: string,
  apiSettings?: APISettings
): Promise<AnomalyStoryResponse> {
  // Check if dialogue already exists in the user idea
  const existingDialogue = detectExistingDialogue(userIdea);

  const dialogueInstructions = existingDialogue.hasDialogue ? `
**CRITICAL DIALOGUE PRESERVATION RULE:**
The story idea ALREADY CONTAINS DIALOGUE. You MUST:
1. PRESERVE all existing dialogue EXACTLY as written
2. Include the dialogue in appropriate scenes within the synopsis
3. DO NOT create any new dialogue
4. DO NOT modify the existing dialogue
5. Distribute the dialogue naturally across the 8 scenes

EXISTING DIALOGUE TO PRESERVE:
${existingDialogue.dialogues.map(d => `${d.speaker}${d.emotion ? ` (${d.emotion})` : ''}: "${d.text}"`).join('\n')}
` : '';

  const prompt = `Given these three surreal characters:
    Character 1: ${characters.karakter_1.nama} - ${characters.karakter_1.deskripsi_fisik}
    Character 2: ${characters.karakter_2.nama} - ${characters.karakter_2.deskripsi_fisik}
    Character 3: ${characters.karakter_3.nama} - ${characters.karakter_3.deskripsi_fisik}

    And this original story idea: "${userIdea}"

    ${dialogueInstructions}

    Create a movie title and an 8-scene synopsis that combines these characters with the original idea.
    
    IMPORTANT: 
    - If dialogue exists in the story idea, you MUST include it in the appropriate scenes
    - Each scene description should be detailed and cinematic
    - Preserve any existing dialogue EXACTLY as provided
    
    Return ONLY a JSON object in this exact format, with no additional text:
    {
      "judul": "...",
      "sinopsis_per_adegan": [
        "Scene 1...",
        "Scene 2...",
        "Scene 3...",
        "Scene 4...",
        "Scene 5...",
        "Scene 6...",
        "Scene 7...",
        "Scene 8..."
      ]
    }`;

  const response = await callGeminiAPI(prompt, undefined, apiSettings);
  return JSON.parse(response);
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

export async function generateTwistedStoryIdea(inputs: { karakter: string; situasi: string; elemenAneh: string; }, apiSettings?: APISettings): Promise<string> {
  const idecerita = `Karakter: ${inputs.karakter}, Situasi: ${inputs.situasi}, Elemen Aneh: ${inputs.elemenAneh}`;
  const genre_tone = "Modern, Surreal, Creative, Sci-fi, Dark Comedy, Mystery, Steampunk, Fantasy, Philosophical, Psychological Thriller";

  const dynamicPrompt = `
**MAIN SYSTEM INSTRUCTION:**  
You are a professional screenwriter specializing in unique and captivating 3D animated short films. Follow all the rules below without exception.  

**CRITICAL RULES:**  

1. **ANTI-COPYRIGHT:**  
   - DO NOT use characters/names/designs from existing IPs.  
   - All elements must be 100% original from the user's idea.  
   - Create completely new character names, locations, and concepts.  

2. **LANGUAGE CONSISTENCY:**  
   - Use natural, lively, and imaginative Indonesian language.  
   - Avoid overly rigid or formal language.  

3. **STORY STYLE:**  
   - Match the tone to a modern, surreal, and creative genre.  
   - The premise must be engaging with a strong hook and cinematic visual touches.  

**MAIN TASK:**  
Based on the following **STORY ELEMENTS**:  
${idecerita}  

Create an original, modern, surreal, and cinematic short film premise. Return only one concise paragraph without additional text.  

**REQUESTED GENRE/TONE:**  
${genre_tone}`;

  const response = await callGeminiAPI(dynamicPrompt, undefined, apiSettings);
  return response.trim();
}
