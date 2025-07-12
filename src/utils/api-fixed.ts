import { APISettings } from '../types';

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
  bahasa: string;
  aksen: string;
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
    technicalSpecs: 'cultural pattern integration, rich textile simulation, traditional art-inspired textures, warm color palettes, detailed environmental storytelling'
  }
};

// NEW FUNCTION: Get Animation Style Technical Specs
function getAnimationStyleSpecs(styleKey: keyof typeof ANIMATION_STYLES): string {
  const style = ANIMATION_STYLES[styleKey];
  return `${style.name}: ${style.description}. Technical specifications: ${style.technicalSpecs}`;
}

// NEW FUNCTION: Generate Veo3 Optimized Prompt - IMPROVED VERSION with Animation Styles
function generateVeo3OptimizedPrompt(
  visualPrompt: string,
  audioPrompt: string,
  indonesianDialog: string,
  language: string,
  animationStyle?: keyof typeof ANIMATION_STYLES
): string {
  // Remove language tags from prompts
  const cleanVisual = visualPrompt.replace(/\[BAHASA:.*?\]/g, '').trim();
  const cleanAudio = audioPrompt.replace(/\[BAHASA:.*?\]/g, '').trim();
  const cleanDialog = indonesianDialog.replace(/\[BAHASA:.*?\]/g, '').trim();
  
  // Add animation style specifications if provided
  const styleSpecs = animationStyle ? `\n\nANIMATION STYLE: ${getAnimationStyleSpecs(animationStyle)}` : '';
  
  // Enhanced format with better structure and emphasis
  return `LANGUAGE INSTRUCTION: Generate video with ${language} dialog. All character speech must be in ${language} language.

VISUAL SCENE:
${cleanVisual}${styleSpecs}

DIALOG REQUIREMENT - CHARACTERS MUST SPEAK IN ${language.toUpperCase()} LANGUAGE:
${cleanDialog}

AUDIO DESIGN:
${cleanAudio}

CRITICAL INSTRUCTION: Ensure ALL spoken words in the generated video are in ${language} language, NOT English. The characters must speak exactly as written in the dialog section above.`;
}

// NEW FUNCTION: Generate Animation Style Prompt Enhancement
export function generateAnimationStylePrompt(
  basePrompt: string,
  animationStyle: keyof typeof ANIMATION_STYLES,
  culturalTheme?: string
): string {
  const style = ANIMATION_STYLES[animationStyle];
  const culturalIntegration = culturalTheme ? ` with ${culturalTheme} cultural elements` : '';
  
  return `${basePrompt}

**ANIMATION STYLE SPECIFICATION:**
Style: ${style.name}${culturalIntegration}
Description: ${style.description}
Technical Requirements: ${style.technicalSpecs}

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
- Traditional art-inspired textures and materials
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
function getCulturalIntegrationSpecs(culturalTheme: string): string {
  const culturalSpecs: Record<string, string> = {
    // ASIA
    'indonesian': `
- Traditional architecture: joglo, rumah adat, candi elements
- Cultural patterns: batik, songket, ikat textiles
- Musical instruments: gamelan, angklung, sasando
- Flora/fauna: komodo, orangutan, rafflesia, tropical landscapes
- Color palette: earth tones, traditional batik colors`,
    
    'japanese': `
- Traditional architecture: pagoda, torii gates, shoji screens
- Cultural patterns: sakura, wave motifs, geometric designs
- Musical instruments: shamisen, taiko drums, koto
- Flora/fauna: cherry blossoms, koi fish, bamboo forests
- Color palette: red, white, gold, natural wood tones`,
    
    'chinese': `
- Traditional architecture: pagoda, courtyard houses, feng shui elements
- Cultural patterns: dragon motifs, cloud patterns, calligraphy
- Musical instruments: erhu, guzheng, traditional drums
- Flora/fauna: pandas, lotus flowers, pine trees
- Color palette: red, gold, jade green, imperial colors`,
    
    'korean': `
- Traditional architecture: hanok, dancheong colors, curved rooflines
- Cultural patterns: hanji paper art, traditional pottery designs
- Musical instruments: gayageum, janggu, traditional flutes
- Flora/fauna: tigers, cranes, pine trees, cherry blossoms
- Color palette: dancheong colors (red, blue, yellow, green)`,
    
    'indian': `
- Traditional architecture: temples, mandala patterns, intricate carvings
- Cultural patterns: paisley, lotus motifs, geometric designs
- Musical instruments: sitar, tabla, flute
- Flora/fauna: elephants, peacocks, lotus flowers, banyan trees
- Color palette: vibrant saffron, deep blues, rich reds, gold`,
    
    // MIDDLE EAST
    'arabic': `
- Traditional architecture: domes, minarets, geometric patterns
- Cultural patterns: arabesque, calligraphy, tile work
- Musical instruments: oud, qanun, traditional drums
- Flora/fauna: palm trees, desert landscapes, Arabian horses
- Color palette: deep blues, gold, turquoise, desert tones`,
    
    'persian': `
- Traditional architecture: Isfahan tiles, garden courtyards, arches
- Cultural patterns: Persian carpets, miniature art, poetry motifs
- Musical instruments: santur, tar, ney flute
- Flora/fauna: roses, cypress trees, Persian cats
- Color palette: Persian blue, rose, gold, turquoise`,
    
    // EUROPE
    'european': `
- Traditional architecture: Gothic, Renaissance, Baroque elements
- Cultural patterns: Celtic knots, medieval heraldry, classical motifs
- Musical instruments: violin, piano, organ, traditional folk instruments
- Flora/fauna: oak trees, roses, European wildlife
- Color palette: royal blues, deep reds, gold, stone grays`,
    
    'scandinavian': `
- Traditional architecture: wooden stave churches, minimalist design
- Cultural patterns: Nordic runes, folk art, geometric designs
- Musical instruments: hardanger fiddle, nyckelharpa
- Flora/fauna: pine forests, reindeer, northern lights
- Color palette: cool blues, whites, natural wood tones`,
    
    // AFRICA
    'african': `
- Traditional architecture: mud brick, thatched roofs, tribal designs
- Cultural patterns: tribal masks, geometric patterns, textile designs
- Musical instruments: djembe, kora, mbira
- Flora/fauna: baobab trees, savanna animals, acacia trees
- Color palette: earth tones, vibrant oranges, deep browns`,
    
    // AMERICAS
    'latin-american': `
- Traditional architecture: colonial, indigenous, colorful facades
- Cultural patterns: Aztec/Mayan motifs, Day of the Dead art
- Musical instruments: guitar, maracas, pan flute
- Flora/fauna: tropical birds, jaguars, rainforest vegetation
- Color palette: vibrant colors, tropical hues, festive tones`,
    
    'native-american': `
- Traditional architecture: pueblos, longhouses, teepees
- Cultural patterns: dreamcatchers, tribal symbols, nature motifs
- Musical instruments: drums, flutes, rattles
- Flora/fauna: eagles, wolves, buffalo, sacred plants
- Color palette: earth tones, turquoise, red ochre, natural pigments`,
    
    // OCEANIA
    'polynesian': `
- Traditional architecture: thatched huts, carved totems
- Cultural patterns: tribal tattoos, ocean wave motifs
- Musical instruments: ukulele, drums, conch shells
- Flora/fauna: palm trees, tropical fish, ocean life
- Color palette: ocean blues, tropical greens, sunset colors`,
    
    // UNIVERSAL/MODERN
    'modern-international': `
- Contemporary architecture: glass, steel, minimalist design
- Cultural patterns: global fusion, digital art influences
- Musical instruments: electronic, world music fusion
- Flora/fauna: urban environments, global diversity
- Color palette: modern neutrals, tech-inspired colors`,
    
    'fantasy': `
- Fantastical architecture: magical castles, floating cities
- Cultural patterns: mystical symbols, magical runes
- Musical instruments: ethereal, otherworldly sounds
- Flora/fauna: mythical creatures, magical forests
- Color palette: mystical purples, ethereal blues, magical golds`
  };
  
  // Return specific cultural specs or generic international support
  return culturalSpecs[culturalTheme.toLowerCase()] || `
- Traditional architectural elements and patterns from ${culturalTheme} culture
- Culturally-appropriate color schemes and materials
- Local flora, fauna, and environmental details
- Respectful representation of cultural symbols
- Integration of traditional art styles and motifs from ${culturalTheme} heritage`;
}

// NEW FUNCTION: Get Available Cultural Themes
export function getAvailableCulturalThemes(): string[] {
  return [
    // Asia
    'Indonesian', 'Japanese', 'Chinese', 'Korean', 'Indian',
    // Middle East
    'Arabic', 'Persian',
    // Europe
    'European', 'Scandinavian',
    // Africa
    'African',
    // Americas
    'Latin-American', 'Native-American',
    // Oceania
    'Polynesian',
    // Universal
    'Modern-International', 'Fantasy'
  ];
}

export async function generateAnomalyScenePrompt(
  storyContext: StoryContext,
  characters: { karakter_1: AnomalyCharacter; karakter_2: AnomalyCharacter },
  sceneNumber: number,
  totalScenes: number,
  languageOptions: LanguageOptions,
  apiSettings?: APISettings
): Promise<{
  visual_prompt: string;
  audio_prompt: string;
  dialog_en: string;
  dialog_id_gaul: string;
  narasi: string;
  veo3_optimized_prompt: string; // NEW: Optimized prompt for Veo3
}> {
  const idecerita = `${storyContext.judul} - Scene ${sceneNumber}: ${storyContext.sinopsis_per_adegan[sceneNumber - 1]}. Characters: ${characters.karakter_1.nama} (${characters.karakter_1.deskripsi_fisik}) and ${characters.karakter_2.nama} (${characters.karakter_2.deskripsi_fisik})`;
  const bahasa_dipilih = languageOptions.bahasa;
  const genre_tone = "3D Animated, Pixar-Disney quality, Indonesian cultural elements";

  const dynamicPrompt = `
**SISTEM INSTRUKSI UTAMA:**
Anda adalah penulis skenario profesional yang menciptakan konten 100% orisinal untuk Gemini Veo3. Patuhi semua aturan berikut tanpa pengecualian.

**ATURAN KRITIS:**

1. **ANTI-HAK CIPTA (MUTLAK):**
   - DILARANG menggunakan karakter/nama/desain dari properti yang dilindungi hak cipta
   - Semua elemen HARUS 100% orisinal berdasarkan ide cerita pengguna
   - Ciptakan nama karakter, lokasi, dan konsep yang benar-benar baru dan unik

2. **KONSISTENSI BAHASA (MUTLAK):**
   - Setiap field JSON menggunakan bahasa yang telah ditentukan
   - JANGAN mencampur bahasa dalam satu field
   - Gunakan bahasa yang natural dan sesuai konteks

3. **OPTIMASI VEO3:**
   - Buat prompt yang dioptimalkan khusus untuk Gemini Veo3
   - Gunakan format yang memastikan dialog dalam bahasa yang benar
   - Pisahkan instruksi visual dan dialog dengan jelas

4. **KUALITAS 3D ANIMASI PREMIUM:**
   - Gunakan referensi visual dari film animasi berkualitas tinggi
   - Fokus pada detail lighting, texturing, dan character animation
   - Integrasikan elemen budaya Indonesia dengan estetika modern

**TUGAS UTAMA:**
Berdasarkan **IDE CERITA** yang diberikan, generate JSON dengan struktur berikut:

**STRUKTUR OUTPUT JSON:**

{
  "visual_prompt": "[BAHASA: INGGRIS] Deskripsi visual yang detail dan sinematografis dengan kualitas 3D animasi premium. WAJIB include: 3D animation style (Pixar/Disney quality), detailed character modeling, advanced lighting (volumetric, rim lighting, ambient occlusion), realistic textures, smooth character animation, cinematic camera work, Indonesian cultural elements, vibrant color palette, high-quality rendering (4K, ray-traced), dynamic composition, expressive character faces, fluid motion, atmospheric effects.",
  
  "audio_prompt": "[BAHASA: INGGRIS] Deskripsi audio yang komprehensif dengan kualitas film animasi premium. Include: orchestral/cinematic music dengan instrumen tradisional Indonesia, spatial audio design, character voice acting direction, ambient soundscape, foley effects, dynamic range, emotional musical themes.",
  
  "dialog_en": "[BAHASA: INGGRIS] Dialog natural dalam format skenario. Format: 'NAMA_KARAKTER: (deskripsi nada/emosi) teks dialog'. Gunakan bahasa yang sangat natural, tidak kaku, dengan idiom dan ekspresi yang sesuai budaya lokal.",
  
  "dialog_id_gaul": "[BAHASA: ${bahasa_dipilih}] Dialog natural dalam format skenario. Format: 'NAMA_KARAKTER: (deskripsi nada/emosi) teks dialog'. Gunakan bahasa yang sangat natural, tidak kaku, dengan idiom dan ekspresi yang sesuai budaya lokal.",
  
  "narasi": "[BAHASA: INDONESIA] Narasi untuk voice-over dengan gaya yang sesuai genre cerita. Gunakan bahasa yang engaging, tidak monoton, dan mendukung atmosfer cerita.",

  "veo3_optimized_prompt": "[BAHASA: CAMPURAN TERSTRUKTUR] Prompt yang dioptimalkan khusus untuk Gemini Veo3 dengan format yang memastikan dialog bahasa Indonesia muncul di video."
}

**PANDUAN KUALITAS 3D ANIMASI PREMIUM:**

**VISUAL EXCELLENCE:**
- **Rendering Quality:** 4K resolution, ray-traced lighting, global illumination, subsurface scattering
- **Character Design:** Expressive faces, detailed textures, realistic hair/fur simulation, cloth physics
- **Animation Style:** Fluid motion, squash-and-stretch principles, anticipation and follow-through
- **Cinematography:** Dynamic camera movements, depth of field, cinematic framing, rule of thirds
- **Lighting:** Volumetric lighting, rim lighting, ambient occlusion, color temperature variation
- **Indonesian Elements:** Traditional patterns, architecture, clothing, natural landscapes, cultural symbols

**AUDIO EXCELLENCE:**
- **Music:** Orchestral arrangements with gamelan, angklung, traditional percussion, naruto percussion
- **Voice Acting:** Clear articulation, emotional range, character-specific vocal qualities
- **Sound Design:** Spatial audio, realistic foley, environmental ambience
- **Mix Quality:** Professional dynamic range, clear dialogue, immersive soundscape

**CULTURAL INTEGRATION:**
- Incorporate Indonesian architectural elements (joglo, rumah adat)
- Use traditional color palettes (earth tones, batik patterns)
- Include Indonesian flora and fauna
- Reference local customs and traditions respectfully

**CONTOH ADAPTASI BAHASA:**
- Bahasa Indonesia: Natural, tidak formal berlebihan
- Bahasa Sunda: Gunakan "nya", "teh", "mah" secara natural
- Bahasa Jawa: Sesuaikan dengan tingkat kesopanan (ngoko/krama)
- Bahasa Gaul Jakarta: Gunakan "sih", "dong", "kan", "banget"

**IDE CERITA YANG DIBERIKAN:**
${idecerita}

**BAHASA YANG DIMINTA UNTUK DIALOG:**
${bahasa_dipilih}

**GENRE/TONE YANG DIMINTA:**
${genre_tone}

**DURASI VIDEO: 8 DETIK - Dialog harus singkat dan padat (maksimal 10-15 kata total)**

**INSTRUKSI KHUSUS UNTUK VEO3_OPTIMIZED_PROMPT:**
Buat prompt yang mengikuti format ini:
"LANGUAGE INSTRUCTION: Generate video with Indonesian dialog. VISUAL SCENE: [visual description] DIALOG REQUIREMENT - CHARACTERS MUST SPEAK IN INDONESIAN LANGUAGE: [Indonesian dialog] AUDIO DESIGN: [audio description] CRITICAL INSTRUCTION: Ensure ALL spoken words are in Indonesian language, NOT English."

Hasilkan JSON yang mengikuti struktur di atas dengan kualitas profesional.`;

  const response = await callGeminiAPI(dynamicPrompt, undefined, apiSettings);
  try {
    const result = JSON.parse(response);
    
    // Generate optimized Veo3 prompt if not provided by AI
    if (!result.veo3_optimized_prompt) {
      result.veo3_optimized_prompt = generateVeo3OptimizedPrompt(
        result.visual_prompt,
        result.audio_prompt,
        result.dialog_id_gaul,
        bahasa_dipilih
      );
    }
    
    return result;
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    throw new Error('Invalid JSON response from API');
  }
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
    veo3_optimized_prompt: string; // NEW: Add optimized prompt
  }[]
}> {
  const bahasa_dipilih = languageOptions.bahasa;
  const genre_tone = "Cinematic, narrative-driven";

  const dynamicPrompt = `
**SISTEM INSTRUKSI UTAMA:**
Anda adalah penulis skenario profesional yang menciptakan konten 100% orisinal untuk Gemini Veo3. Patuhi semua aturan berikut tanpa pengecualian.

**ATURAN KRITIS:**

1. **ANTI-HAK CIPTA (MUTLAK):**
   - DILARANG menggunakan karakter/nama/desain dari properti yang dilindungi hak cipta
   - Semua elemen HARUS 100% orisinal berdasarkan ide cerita pengguna
   - Ciptakan nama karakter, lokasi, dan konsep yang benar-benar baru

2. **KONSISTENSI BAHASA (MUTLAK):**
   - Setiap field JSON menggunakan bahasa yang telah ditentukan
   - JANGAN mencampur bahasa dalam satu field
   - Gunakan bahasa yang natural dan sesuai konteks

3. **OPTIMASI VEO3:**
   - Buat prompt yang dioptimalkan khusus untuk Gemini Veo3
   - Gunakan format yang memastikan dialog dalam bahasa yang benar
   - Pisahkan instruksi visual dan dialog dengan jelas

**TUGAS UTAMA:**
Berdasarkan **IDE CERITA** dan **GAMBAR KUNCI** yang diberikan, generate JSON dengan 8 scene prompts:

**STRUKTUR OUTPUT JSON:**

{
  "video_prompts": [
    {
      "scenePrompt": "[BAHASA: INGGRIS] Deskripsi visual scene yang detail dan sinematografis. Include: setting, komposisi shot, pencahayaan, gerakan kamera, aksi karakter, dan elemen visual penting.",
      "narasi": "[BAHASA: INDONESIA] Narasi voice-over yang engaging dan mendukung atmosfer cerita.",
      "dialog_en": "[BAHASA: INGGRIS] Dialog natural dalam format skenario.",
      "dialog_id": "[BAHASA: ${bahasa_dipilih}] Dialog natural yang sama dalam bahasa lokal yang autentik.",
      "veo3_optimized_prompt": "[BAHASA: CAMPURAN TERSTRUKTUR] Prompt yang dioptimalkan khusus untuk Gemini Veo3 dengan format yang memastikan dialog bahasa Indonesia muncul di video."
    }
    // ... 8 scenes total
  ]
}

**PANDUAN KUALITAS:**
- Visual: Konsisten dengan gaya gambar kunci
- Dialog: Natural dan sesuai karakter
- Narasi: Engaging dan mendukung emosi
- Alur: 8 scene yang mengalir logis
- Veo3 Prompt: Gunakan format yang terbukti efektif untuk Veo3

**IDE CERITA YANG DIBERIKAN:**
${userIdea}

**BAHASA YANG DIMINTA UNTUK DIALOG:**
${bahasa_dipilih}

**GENRE/TONE YANG DIMINTA:**
${genre_tone}

**INSTRUKSI KHUSUS UNTUK VEO3_OPTIMIZED_PROMPT:**
Setiap scene harus memiliki prompt yang mengikuti format ini:
"LANGUAGE INSTRUCTION: Generate video with Indonesian dialog. VISUAL SCENE: [visual description] DIALOG REQUIREMENT - CHARACTERS MUST SPEAK IN INDONESIAN LANGUAGE: [Indonesian dialog] AUDIO DESIGN: [audio description] CRITICAL INSTRUCTION: Ensure ALL spoken words are in Indonesian language, NOT English."

Hasilkan JSON dengan 8 scene prompts yang mengikuti struktur di atas dengan kualitas profesional.`;

  const response = await callGeminiAPI(dynamicPrompt, keyImage, apiSettings);
  const result = JSON.parse(response);
  
  // Generate optimized Veo3 prompts if not provided by AI
  result.video_prompts = result.video_prompts.map((prompt: {
    scenePrompt: string;
    narasi: string;
    dialog_en: string;
    dialog_id: string;
    veo3_optimized_prompt?: string;
  }) => {
    if (!prompt.veo3_optimized_prompt) {
      prompt.veo3_optimized_prompt = generateVeo3OptimizedPrompt(
        prompt.scenePrompt,
        '', // No separate audio prompt in this function
        prompt.dialog_id,
        bahasa_dipilih
      );
    }
    return prompt;
  });
  
  return result;
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

  const parts: Array<{text: string} | {inlineData: {mimeType: string, data: string}}> = [{ text: prompt }];
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

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = errorData.error?.message || 'API request failed';
    
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
    // Clean up markdown formatting for clean output
    text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold markdown
    text = text.replace(/###\s*(.*?)$/gm, '$1'); // Remove heading markdown
    text = text.replace(/^\s*[-*]\s*/gm, ''); // Remove bullet points
    text = text.replace(/^```json\s*|```\s*$/g, '').trim(); // Remove code blocks
    text = text.replace(/^```\s*|```\s*$/g, '').trim();
    return text;
  } else {
    throw new Error('Unexpected API response format');
  }
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
}> {
  const prompt = `Kamu adalah seorang desainer konsep. Berdasarkan ide cerita spesifik ini: '${userIdea}'

**INSTRUKSI PENTING:**
- JANGAN gunakan karakter generik seperti "Rice Cooker" atau "Spons"
- HARUS menggunakan karakter yang sesuai dengan cerita yang diberikan
- Ekstrak karakter utama dari cerita dan buat deskripsi fisik yang surealis

**TUGAS:**
1. Identifikasi 2 karakter utama dari cerita yang diberikan
2. Buat deskripsi fisik yang aneh dan surealis untuk masing-masing karakter
3. Berikan nama panggilan yang sesuai dengan karakter dalam cerita
4. Pastikan output dalam format JSON yang ketat

**FORMAT OUTPUT:**
{"karakter_1": {"nama": "[Nama karakter pertama dari cerita]", "deskripsi_fisik": "[Deskripsi surealis]"}, "karakter_2": {"nama": "[Nama karakter kedua dari cerita]", "deskripsi_fisik": "[Deskripsi surealis]"}}

**CONTOH:**
Jika cerita tentang "Kentongan tua yang bijaksana dan Tiang Listrik yang pendiam", maka output harus menggunakan "Kentongan" dan "Tiang Listrik", BUKAN "Rice Cooker" atau "Spons".

Analisis cerita dan buat karakter yang sesuai:`;

  const response = await callGeminiAPI(prompt, undefined, apiSettings);
  return JSON.parse(response);
}

export async function generateAnomalyStory(
  characters: { karakter_1: AnomalyCharacter; karakter_2: AnomalyCharacter },
  userIdea: string,
  apiSettings?: APISettings
): Promise<AnomalyStoryResponse> {
  const prompt = `Given these two surreal characters:
    Character 1: ${characters.karakter_1.nama} - ${characters.karakter_1.deskripsi_fisik}
    Character 2: ${characters.karakter_2.nama} - ${characters.karakter_2.deskripsi_fisik}

    And this original story idea: "${userIdea}"

    Create a movie title and an 8-scene synopsis that combines these characters with the original idea.
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
  const prompt = `Act as an expert AI text-to-image prompt engineer. Create a highly descriptive image prompt based on this idea: "${userIdea}"

The prompt must include these elements:
1. Main Subject: Detailed description of the main character/object and its pose
2. Setting & Background: The environment around the subject
3. Art Style: Choose an appropriate style (e.g., 'cinematic digital painting', 'hyperrealistic 3D render', 'surreal concept art')
4. Lighting: Describe the lighting (e.g., 'dramatic rim lighting', 'soft volumetric light')
5. Technical Parameters: Include common parameters like '4k, ultra-detailed, photorealistic, --ar 16:9'

Return ONLY the final image prompt text with no additional commentary or formatting.

**ATURAN TAMBAHAN YANG SANGAT PENTING:**
"Hasil akhir dari prompt gambar yang kamu buat HARUS kurang dari 800 karakter. Gunakan bahasa yang padat, deskriptif, dan efisien. Fokus pada kata kunci yang paling berdampak secara visual."`;

  return await callGeminiAPI(prompt, undefined, apiSettings);
}

export async function generateTwistedStoryIdea(inputs: { karakter: string; situasi: string; elemenAneh: string; }, apiSettings?: APISettings): Promise<string> {
  const idecerita = `Karakter: ${inputs.karakter}, Situasi: ${inputs.situasi}, Elemen Aneh: ${inputs.elemenAneh}`;
  const genre_tone = "Modern, surreal, creative";

  const dynamicPrompt = `
**SISTEM INSTRUKSI UTAMA:**
Anda adalah penulis skenario profesional yang menciptakan konten 100% orisinal. Patuhi semua aturan berikut tanpa pengecualian.

**ATURAN KRITIS:**

1. **ANTI-HAK CIPTA (MUTLAK):**
   - DILARANG menggunakan karakter/nama/desain dari properti yang dilindungi hak cipta
   - Semua elemen HARUS 100% orisinal berdasarkan ide cerita pengguna
   - Ciptakan nama karakter, lokasi, dan konsep yang benar-benar baru

2. **KONSISTENSI BAHASA (MUTLAK):**
   - Output dalam bahasa Indonesia yang natural
   - Gunakan bahasa yang tidak formal berlebihan

3. **ADAPTASI DINAMIS:**
   - Sesuaikan tone dan gaya dengan genre yang diminta
   - Buat premis yang unik dan menarik

**TUGAS UTAMA:**
Berdasarkan **ELEMEN CERITA** yang diberikan, buat premis cerita film pendek yang modern dan surealis dalam satu paragraf singkat.

**ELEMEN CERITA YANG DIBERIKAN:**
${idecerita}

**GENRE/TONE YANG DIMINTA:**
${genre_tone}

Gabungkan ketiga elemen menjadi premis cerita yang orisinal, modern, dan surealis. Kembalikan HANYA premis cerita dalam satu paragraf, tanpa teks tambahan.`;

  const response = await callGeminiAPI(dynamicPrompt, undefined, apiSettings);
  return response.trim();
}
