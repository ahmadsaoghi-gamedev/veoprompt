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
    return 'saxophone, electric guitar, cinematic percussion, synthesizer layers — creating a vibrant, modern soundscape';
  }
  return 'sasando, suling Bali, kolintang, rebab — fused with cinematic strings and percussion for dynamic storytelling';
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

// PERBAIKAN UNTUK DIALOG GENERATION
export async function generateAnomalyScenePrompt(
  storyContext: StoryContext,
  characters: { karakter_1: AnomalyCharacter; karakter_2: AnomalyCharacter },
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
  const userIdea = `${storyContext.judul} - Scene ${sceneNumber}: ${storyContext.sinopsis_per_adegan[sceneNumber - 1]}. Characters: ${characters.karakter_1.nama} (${characters.karakter_1.deskripsi_fisik}) and ${characters.karakter_2.nama} (${characters.karakter_2.deskripsi_fisik})`;
  const bahasa_dipilih = languageOptions.bahasa;
  const genre_tone = "Realistic 3D Animation, Stylized 3D, Semi-realistic/stylized cartoon, DreamWorks Turbo, Pixar-Disney quality";

  const dynamicPrompt = `
**PERINTAH SISTEM (SANGAT PENTING):**
"Anda adalah seorang penulis skenario profesional. Tugas Anda adalah membuat output JSON berdasarkan **TUGAS UTAMA**. Gunakan **CONTOH REFERENSI GAYA** di bawah ini sebagai panduan utama untuk gaya visual dan kualitas deskripsi."

**CONTOH REFERENSI GAYA (PELAJARI INI):**
"${referencePrompt}"

**TUGAS UTAMA (KERJAKAN INI):**
"Berdasarkan **Ide Cerita** dari pengguna: '${userIdea}', buatlah sebuah objek JSON baru yang meniru format dan kualitas kreatif dari **CONTOH REFERENSI GAYA** di atas."

**KARAKTER YANG HARUS BERBICARA:**
- KARAKTER 1: ${characters.karakter_1.nama} - ${characters.karakter_1.deskripsi_fisik}
- KARAKTER 2: ${characters.karakter_2.nama} - ${characters.karakter_2.deskripsi_fisik}

**ATURAN KRITIS:**

1. **ANTI-HAK CIPTA (WAJIB ABSOLUT):**
   - DILARANG keras menggunakan karakter, nama, atau desain yang dilindungi hak cipta
   - Semua elemen WAJIB 100% orisinal, dikembangkan dari ide cerita pengguna
   - Ciptakan karakter, lokasi, dan konsep baru yang kreatif, inovatif, dan unik

2. **KONSISTENSI DIALOG DAN KARAKTER (TANPA TOLERANSI):**
   - WAJIB ada pergantian dialog antara ${characters.karakter_1.nama} dan ${characters.karakter_2.nama}
   - Setiap karakter HARUS berbicara minimal 1 kali dalam scene ini
   - Format dialog HARUS konsisten: "NAMA_KARAKTER: (ekspresi/emosi) dialog"
   - TIDAK BOLEH ada dialog tanpa nama karakter yang jelas

3. **OPTIMASI SPESIFIK UNTUK VEO3:**
   - Tulis prompt yang telah dioptimalkan eksklusif untuk memaksimalkan performa Gemini Veo3
   - Format penulisan harus memastikan pemisahan antara instruksi visual, audio, dan dialog secara jelas
   - Rancang agar hasil render maksimal dengan kualitas audio-visual terbaik

4. **GAYA VISUAL BERDASARKAN REFERENSI:**
   - Gunakan **CONTOH REFERENSI GAYA** sebagai panduan utama untuk kualitas visual dan deskripsi
   - Tiru gaya penulisan, detail, dan pendekatan kreatif dari contoh referensi
   - Adaptasi elemen-elemen visual yang kuat dari referensi ke dalam cerita pengguna

**PERINTAH PEMBUATAN DIALOG (IKUTI SECARA BERURUTAN):**

**Langkah 1: Ciptakan Dialog Master (Bahasa Inggris)**
* **Peran AI:** "Anda adalah seorang penulis skenario film profesional. Tulis sebuah dialog yang natural, cerdas, dan penuh subteks dalam Bahasa Inggris."
* **Tugas:** Buat sebuah dialog dalam format skenario standar. Dialog ini akan menjadi "sumber kebenaran" (source of truth).
* **Format:** '${characters.karakter_1.nama}: (deskripsi nada/emosi) teks dialog' dan '${characters.karakter_2.nama}: (deskripsi nada/emosi) teks dialog'
* **Aturan:** Kedua karakter HARUS berbicara dengan pergantian yang jelas. Maksimal 8 detik total durasi dialog.

**Langkah 2: Adaptasi Kreatif ke Bahasa Indonesia Gaul**
* **Peran AI:** "Sekarang, Anda adalah seorang penerjemah dan penulis skenario untuk sitkom pergaulan anak muda Jakarta. Tugas Anda BUKAN menerjemahkan secara harfiah, tetapi **mengadaptasi** dialog dari Langkah 1."
* **Tugas:** Ambil dialog Bahasa Inggris yang baru saja Anda buat, dan tulis ulang ke dalam Bahasa Indonesia Gaul yang 100% natural, seperti obrolan di tongkrongan.
* **ATURAN SINKRONISASI (SANGAT PENTING):**
    * Urutan karakter yang berbicara HARUS SAMA PERSIS dengan versi Bahasa Inggris.
    * Jumlah baris dialog HARUS SAMA PERSIS.
    * Logika percakapan (siapa yang bertanya, siapa yang menjawab, siapa yang menyindir) HARUS SAMA PERSIS.
* **Gaya Bahasa:** Gunakan bahasa gaul Jakarta yang natural (gue, lo, anjir, parah, kayak, gitu, sih, kan, deh).

**STRUKTUR OUTPUT JSON YANG WAJIB DIIKUTI:**

{
  "visual_prompt": "[String] TULIS BAGIAN INI HANYA DALAM BAHASA INGGRIS. Deskripsikan semua elemen visual dengan format: Mulai dengan 'A cinematic, heartwarming 3D animated scene in the style of **${visualStyle}**.' Lanjutkan dengan deskripsi setting dan aksi karakter dalam format skenario profesional yang detail, termasuk kapan ${characters.karakter_1.nama} berbicara (mouth movement, facial expressions) dan kapan ${characters.karakter_2.nama} berbicara. Di akhir paragraf, tambahkan: 'Cinematography: [minta AI untuk menentukan gerakan kamera, sudut, dan pencahayaan yang sesuai dengan gaya]. Aspect Ratio: **${aspectRatio}**.'",
  
  "audio_prompt": "[BAHASA: INGGRIS] Deskripsi audio yang komprehensif, menggambarkan kualitas suara setara film animasi kelas dunia yang selaras dengan gaya referensi. Wajib meliputi: orchestral/cinematic music dengan instrumen tradisional Indonesia, spatial audio design, character voice acting direction untuk ${characters.karakter_1.nama} (jelaskan karakteristik suara) dan ${characters.karakter_2.nama} (jelaskan karakteristik suara berbeda), ambient soundscape, foley effects, dynamic range, dan emotional musical themes.",
  
      "dialog_en": "[String] Hasil dari **Langkah 1** (Dialog Master Bahasa Inggris). Format: '[${characters.karakter_1.nama}: (emotion), dialog]' dan '[${characters.karakter_2.nama}: (emotion), dialog]'.",
      
      "dialogue": "[String] Hasil dari **Langkah 2** (Adaptasi Kreatif Bahasa Indonesia Gaul). Format HARUS identik dengan dialog_en dalam hal urutan speaker dan jumlah baris. Contoh: '[Karakter: (ekspresi), dialog]'",
  
  "narasi": "[BAHASA: INDONESIA] Narasi untuk voice-over yang engaging, penuh dinamika, dan membangun atmosfer cerita. Gaya bahasa harus sesuai dengan genre, tidak monoton, serta efektif memperkuat mood cerita.",

  "veo3_optimized_prompt": "[BAHASA: CAMPURAN TERSTRUKTUR] Prompt teroptimasi khusus untuk Gemini Veo3 dengan instruksi yang sangat spesifik tentang siapa yang berbicara kapan, mengintegrasikan elemen-elemen gaya dari **CONTOH REFERENSI GAYA**."
}

**INSTRUKSI KHUSUS UNTUK VEO3_OPTIMIZED_PROMPT:**
Buat prompt dengan pola berikut yang SANGAT SPESIFIK tentang character speaking dan mengintegrasikan gaya visual dari referensi:

"LANGUAGE INSTRUCTION: Generate video with Indonesian dialog featuring alternating conversation between ${characters.karakter_1.nama} and ${characters.karakter_2.nama}.

VISUAL SCENE: [visual description dengan detail kapan masing-masing karakter berbicara, mengadaptasi gaya visual dari **CONTOH REFERENSI GAYA**]

CHARACTER SPEAKING INSTRUCTION:
- FIRST SPEAKER: ${characters.karakter_1.nama} speaks with [karakteristik visual dan ekspresi]
- SECOND SPEAKER: ${characters.karakter_2.nama} responds with [karakteristik visual dan ekspresi berbeda]

DIALOG REQUIREMENT - CHARACTERS MUST SPEAK IN INDONESIAN LANGUAGE:
${characters.karakter_1.nama}: [Indonesian dialog line 1]
${characters.karakter_2.nama}: [Indonesian dialog line 2]

AUDIO DESIGN: [audio description dengan voice characteristic untuk masing-masing karakter]

CRITICAL INSTRUCTION: Ensure ${characters.karakter_1.nama} and ${characters.karakter_2.nama} take turns speaking. Show clear mouth movements and facial expressions for each character when they speak. ALL spoken words must be in Indonesian language, NOT English."

**IDE CERITA YANG DIBERIKAN:**
${userIdea}

**BAHASA YANG DIMINTA UNTUK DIALOG:**
${bahasa_dipilih}

**GENRE/TONE YANG DIMINTA:**
${genre_tone}

**DURASI VIDEO: 8 DETIK - Dialog harus singkat, efektif, dan memastikan kedua karakter berbicara**

Hasilkan JSON dengan struktur di atas dan kualitas skenario serta produksi yang profesional, siap untuk rendering di Gemini Veo3.`;

  const response = await callGeminiAPI(dynamicPrompt, undefined, apiSettings);
  try {
    // Use enhanced JSON parsing with fallback mechanisms
    const result = extractAndParseJson(response);
    
    // Generate optimized Veo3 prompt dengan character-specific instructions
    if (!result.veo3_optimized_prompt) {
      result.veo3_optimized_prompt = generateEnhancedVeo3OptimizedPrompt(
        result.visual_prompt as string,
        result.audio_prompt as string,
        result.dialog_id_gaul as string,
        bahasa_dipilih,
        characters
      );
    }
    
    // Map dialogue to dialog_id_gaul for backward compatibility
    if (result.dialogue && !result.dialog_id_gaul) {
      result.dialog_id_gaul = result.dialogue;
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
  indonesianDialog: string,
  language: string,
  characters: { karakter_1: AnomalyCharacter; karakter_2: AnomalyCharacter }
): string {
  // Clean prompts
  const cleanVisual = visualPrompt.replace(/\[BAHASA:.*?\]/g, '').trim();
  const cleanAudio = audioPrompt.replace(/\[BAHASA:.*?\]/g, '').trim();
  const cleanDialog = indonesianDialog.replace(/\[BAHASA:.*?\]/g, '').trim();
  
  // Parse dialog untuk mengidentifikasi siapa yang berbicara
  const dialogLines = cleanDialog.split('\n').filter(line => line.trim());
  const characterSpeakingInstructions = dialogLines.map(line => {
    if (line.includes(characters.karakter_1.nama)) {
      return `${characters.karakter_1.nama} speaks: Show ${characters.karakter_1.nama} with mouth movements, facial expressions, and body language matching the dialog.`;
    } else if (line.includes(characters.karakter_2.nama)) {
      return `${characters.karakter_2.nama} speaks: Show ${characters.karakter_2.nama} with mouth movements, facial expressions, and body language matching the dialog.`;
    }
    return '';
  }).filter(instruction => instruction);

  return `LANGUAGE INSTRUCTION: Generate video with ${language} dialog featuring conversation between ${characters.karakter_1.nama} and ${characters.karakter_2.nama}.

VISUAL SCENE:
${cleanVisual}

CHARACTER ANIMATION REQUIREMENTS:
${characterSpeakingInstructions.join('\n')}

SPECIFIC CHARACTER VISUAL CUES:
- ${characters.karakter_1.nama}: ${characters.karakter_1.deskripsi_fisik}
- ${characters.karakter_2.nama}: ${characters.karakter_2.deskripsi_fisik}

DIALOG REQUIREMENT - CHARACTERS MUST SPEAK IN ${language.toUpperCase()} LANGUAGE:
${cleanDialog}

AUDIO DESIGN:
${cleanAudio}
- Distinct voice characteristics for ${characters.karakter_1.nama} and ${characters.karakter_2.nama}
- Clear audio separation when each character speaks

CRITICAL INSTRUCTIONS: 
1. Show ONLY the speaking character with mouth movements when they deliver their lines
2. The non-speaking character should show listening expressions/reactions
3. Ensure ALL spoken words are in ${language} language, NOT English
4. Display clear turn-taking between ${characters.karakter_1.nama} and ${characters.karakter_2.nama}
5. Each character must have distinct facial expressions and voice when speaking`;
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
  const bahasa_dipilih = languageOptions.bahasa;
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
   - Dialog dalam bahasa Indonesia harus menggunakan format yang sama dengan dialog English

**PERINTAH PEMBUATAN DIALOG (IKUTI SECARA BERURUTAN):**

**Langkah 1: Ciptakan Dialog Master (Bahasa Inggris)**
* **Peran AI:** "Anda adalah seorang penulis skenario film profesional. Tulis sebuah dialog yang natural, cerdas, dan penuh subteks dalam Bahasa Inggris."
* **Tugas:** Buat sebuah dialog dalam format skenario standar. Dialog ini akan menjadi "sumber kebenaran" (source of truth).
* **Format:** 'KARAKTER_A: (deskripsi nada/emosi) teks dialog' dan 'KARAKTER_B: (deskripsi nada/emosi) teks dialog'
* **Aturan:** Minimal 2 karakter HARUS berbicara dengan pergantian yang jelas.

**Langkah 2: Adaptasi Kreatif ke Bahasa Indonesia Gaul**
* **Peran AI:** "Sekarang, Anda adalah seorang penerjemah dan penulis skenario untuk sitkom pergaulan anak muda Jakarta. Tugas Anda BUKAN menerjemahkan secara harfiah, tetapi **mengadaptasi** dialog dari Langkah 1."
* **Tugas:** Ambil dialog Bahasa Inggris yang baru saja Anda buat, dan tulis ulang ke dalam Bahasa Indonesia Gaul yang 100% natural, seperti obrolan di tongkrongan.
* **ATURAN SINKRONISASI (SANGAT PENTING):**
    * Urutan karakter yang berbicara HARUS SAMA PERSIS dengan versi Bahasa Inggris.
    * Jumlah baris dialog HARUS SAMA PERSIS.
    * Logika percakapan (siapa yang bertanya, siapa yang menjawab, siapa yang menyindir) HARUS SAMA PERSIS.
* **Gaya Bahasa:** Gunakan bahasa gaul Jakarta yang natural (gue, lo, anjir, parah, kayak, gitu, sih, kan, deh).

**TUGAS UTAMA:**
Generate JSON dengan 8 scene prompts dengan dialog yang jelas antar karakter.

**STRUKTUR OUTPUT JSON:**

{
  "video_prompts": [
    {
      "scenePrompt": "[BAHASA: INGGRIS] Deskripsi visual scene yang detail. WAJIB mencakup: setting, komposisi shot, pencahayaan, gerakan kamera, aksi karakter, dan PENTING: jelaskan dengan detail kapan setiap karakter berbicara dengan mouth movement dan facial expressions.",
      
      "narasi": "[BAHASA: INDONESIA] Narasi voice-over yang engaging.",
      
      "dialog_en": "[String] Hasil dari **Langkah 1** (Dialog Master Bahasa Inggris). Format: '[KARAKTER_A: (emotion), dialog]' dan '[KARAKTER_B: (emotion), dialog]'.",
      
      "dialog_id": "[String] Hasil dari **Langkah 2** (Adaptasi Kreatif Bahasa Indonesia Gaul). Format HARUS identik dengan dialog_en dalam hal urutan speaker dan jumlah baris. Contoh: '[Karakter: (ekspresi), dialog]'",
      
      "veo3_optimized_prompt": "[BAHASA: CAMPURAN TERSTRUKTUR] Prompt teroptimasi untuk Veo3 dengan instruksi spesifik tentang character speaking assignment."
    }
    // ... total 8 scenes
  ]
}

**INSTRUKSI UNTUK VEO3_OPTIMIZED_PROMPT:**
Setiap scene WAJIB memiliki prompt dengan character assignment yang jelas:

"LANGUAGE INSTRUCTION: Generate video with Indonesian dialog featuring conversation between [KARAKTER_A] and [KARAKTER_B].

VISUAL SCENE: [scene description dengan detail mouth movement untuk setiap karakter]

CHARACTER SPEAKING SEQUENCE:
1. [KARAKTER_A] speaks first: [visual cues]
2. [KARAKTER_B] responds: [visual cues]

DIALOG REQUIREMENT: [Indonesian dialog dengan nama karakter jelas]

CRITICAL INSTRUCTION: Show clear turn-taking between characters with distinct mouth movements and facial expressions for each speaker."

**IDE CERITA:**
${userIdea}

**BAHASA DIALOG:**
${bahasa_dipilih}

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
        bahasa_dipilih,
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
}> {
  const prompt = `Kamu adalah seorang desainer konsep karakter profesional untuk film animasi 3D berkualitas tinggi. Berdasarkan ide cerita berikut: '${userIdea}'

**INSTRUKSI PENTING:**
- DILARANG menggunakan karakter generik, klise, atau tanpa jiwa seperti "Rice Cooker" atau "Spons"
- HARUS menciptakan karakter yang relevan dengan tema dan alur cerita yang diberikan
- Karakter WAJIB memiliki ciri fisik yang unik, orisinal, dan penuh imajinasi yang bisa divisualisasikan secara sinematik

**TUGAS:**
1. Identifikasi dan pilih 2 karakter utama yang paling ikonik dan potensial dari cerita yang diberikan
2. Buat deskripsi fisik karakter yang detail, surealis namun tetap fungsional untuk animasi, mencakup bentuk tubuh, tekstur, warna dominan, hingga ekspresi wajah yang mencolok dan khas
3. Berikan nama panggilan yang kreatif, mudah diingat, dan mencerminkan kepribadian karakter sesuai cerita
4. Pastikan hasil dalam format JSON yang rapi dan siap digunakan oleh tim modeling & animasi

**FORMAT OUTPUT:**
{"karakter_1": {"nama": "[Nama karakter pertama]", "deskripsi_fisik": "[Deskripsi surealis dan ekspresif]"}, "karakter_2": {"nama": "[Nama karakter kedua]", "deskripsi_fisik": "[Deskripsi surealis dan ekspresif]"}}

**CONTOH:**
Jika cerita tentang "Kentongan tua yang bijaksana dan Tiang Listrik yang pendiam", maka hasil harus menggunakan "Kentongan" dan "Tiang Listrik" dengan deskripsi yang memperkaya visual seperti tekstur kayu tua penuh ukiran, atau kabel-kabel yang membentuk ekspresi wajah.

Analisis dalam-dalam ide cerita dan ciptakan karakter dengan fisik, mimik, dan aura yang kuat, seolah-olah mereka siap tampil dalam film animasi 3D kelas dunia.`;

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
  const genre_tone = "Modern, surreal, creative";

  const dynamicPrompt = `
**SISTEM INSTRUKSI UTAMA:**
Anda adalah penulis skenario profesional spesialis film pendek animasi 3D yang unik dan memikat. Patuhi semua aturan berikut tanpa pengecualian.

**ATURAN KRITIS:**

1. **ANTI-HAK CIPTA:** 
   - DILARANG menggunakan karakter/nama/desain dari IP yang ada.
   - Semua elemen wajib 100% orisinal dari ide pengguna.
   - Ciptakan nama karakter, lokasi, dan konsep yang benar-benar baru.

2. **KONSISTENSI BAHASA:** 
   - Gunakan bahasa Indonesia yang natural, hidup, dan penuh imajinasi.
   - Hindari bahasa yang terlalu kaku atau formal.

3. **GAYA CERITA:** 
   - Sesuaikan tone dengan genre modern, surealis, dan kreatif.
   - Premis harus menarik dengan hook kuat dan sentuhan visual sinematik.

**TUGAS UTAMA:**
Berdasarkan **ELEMEN CERITA** berikut:
${idecerita}

Buatlah premis cerita film pendek yang orisinal, modern, surealis, dan terasa sinematik. Hanya kembalikan satu paragraf singkat tanpa teks tambahan.

**GENRE/TONE YANG DIMINTA:**
${genre_tone}`;

const response = await callGeminiAPI(dynamicPrompt, undefined, apiSettings);
return response.trim();
}
