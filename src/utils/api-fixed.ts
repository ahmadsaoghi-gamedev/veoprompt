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
    technicalSpecs: 'cultural pattern integration, rich textile simulation, modern art-inspired textures, warm color palettes, detailed environmental storytelling'
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
  const genre_tone = "Realistic 3D Animation, Stylized 3D, Semi-realistic/stylized cartoon, DreamWorks Turbo, Pixar-Disney quality";

  const dynamicPrompt = `
**SISTEM INSTRUKSI UTAMA:**
Anda adalah penulis skenario profesional spesialis konten orisinal berkualitas tinggi untuk Gemini Veo3. Patuhi semua aturan berikut tanpa kompromi untuk menjamin hasil produksi animasi kelas dunia.

**ATURAN KRITIS:**

1. **ANTI-HAK CIPTA (WAJIB ABSOLUT):**
   - DILARANG keras menggunakan karakter, nama, atau desain yang dilindungi hak cipta
   - Semua elemen WAJIB 100% orisinal, dikembangkan dari ide cerita pengguna
   - Ciptakan karakter, lokasi, dan konsep baru yang kreatif, inovatif, dan unik

2. **KONSISTENSI BAHASA (TANPA TOLERANSI):**
   - Pastikan setiap field JSON menggunakan satu bahasa sesuai instruksi
   - Hindari pencampuran bahasa dalam satu field
   - Gunakan bahasa yang natural, sesuai konteks budaya, dan komunikatif

3. **OPTIMASI SPESIFIK UNTUK VEO3:**
   - Tulis prompt yang telah dioptimalkan eksklusif untuk memaksimalkan performa Gemini Veo3
   - Format penulisan harus memastikan pemisahan antara instruksi visual, audio, dan dialog secara jelas
   - Rancang agar hasil render maksimal dengan kualitas audio-visual terbaik

4. **STANDAR KUALITAS 3D ANIMASI PREMIUM:**
   - Referensikan kualitas visual dari studio animasi papan atas seperti Pixar atau Disney
   - Fokus pada detail lighting sinematik, texturing realistis, dan karakter animasi yang ekspresif
   - Integrasikan elemen budaya Indonesia dengan pendekatan estetika modern kelas dunia

**TUGAS UTAMA:**
Berdasarkan **IDE CERITA** yang diberikan, hasilkan JSON dengan format struktur berikut:

**STRUKTUR OUTPUT JSON:**

{
  "visual_prompt": "[BAHASA: INGGRIS] Deskripsi visual yang sinematik, rinci, dan berstandar kualitas 3D animasi premium. WAJIB mencakup: 3D animation style (Pixar/Disney quality), detailed character modeling, advanced lighting (volumetric, rim lighting, ambient occlusion), realistic textures, smooth character animation, cinematic camera work, cultural elements, vibrant color palette, high-quality rendering (4K, ray-traced), dynamic composition, expressive character faces, fluid motion, atmospheric effects.",
  
  "audio_prompt": "[BAHASA: INGGRIS] Deskripsi audio yang komprehensif, menggambarkan kualitas suara setara film animasi kelas dunia. Wajib meliputi: orchestral/cinematic music dengan instrumen tradisional Indonesia, spatial audio design, character voice acting direction, ambient soundscape, foley effects, dynamic range, dan emotional musical themes.",
  
  "dialog_en": "[BAHASA: INGGRIS] Dialog yang natural, mengalir seperti dalam skenario profesional. Format: '[NAMA_KARAKTER: (deskripsi nada/emosi) teks dialog]'. Gunakan bahasa yang sangat alami, ekspresif, dengan idiom serta ekspresi yang sesuai budaya lokal.",
  
  "dialog_id_gaul": "[BAHASA: INDONESIA] Dialog natural gaya anak muda Indonesia dengan prinsip penulisan berikut:

**GAYA BAHASA NATURAL:**
- Bahasa santai seperti obrolan di warung kopi atau tongkrongan
- Hindari formalitas (saya/anda/dengan hormat)  
- Gunakan kontraksi: gue udah, lo tau, dia lagi, kita kan
- Selipkan filler words: kayak, gitu, sih, kan, deh, nih

**VOCABULARY GAUL MODERN:**
- Jaksel: literally, basically, serious, honestly, real talk
- Betawi: iye, dah, nih, tuh, kagak, aje
- Gen Z: anjir, bro, bestie, vibes, cringe, slay
- Code-mixing natural: 'That's so random deh', 'Gue literally speechless'

**STRUKTUR DIALOG EFEKTIF:**
- Maksimal 8 detik per dialog (kira-kira 2-3 baris)
- Kalimat pendek dan cepat
- Gunakan elipsis (...) untuk jeda atau keraguan
- Overlap pemikiran: 'Maksud gue... ya lu tau lah...'

**EMOSI & REAKSI SPONTAN:**
- Interjeksi: Waduh!, Aduh!, Anjir!, Astaga!
- Reaksi natural: Serius lu?, Masa sih?, Ngga mungkin deh
- Repetisi untuk penekanan: Parah, parah banget sih

**TEKNIK ADVANCED:**
- Incomplete thoughts: 'Tadi gue ketemu... eh tunggu, lu udah makan belum?'
- Interruption: 'Jadi ceritanya gini— —tunggu tunggu, yang di mall itu ya?'
- Subtext dengan tone sarkastik: 'Wah... hebat banget deh lo.'

**VARIASI KARAKTER:**
- Confident: 'Gue sih obviously tau lah...', 'Basic banget sih pertanyaan lu'
- Shy: 'Ehm... gue sih... gimana ya...', 'Mungkin... apa ya... gue kurang yakin deh...'
- Funny: 'Anjir, plot twist banget nih cerita', 'That's so chaotic energy sih'

**FORMAT:** [NAMA_KARAKTER: (mood/ekspresi) dialog singkat dan natural]

**TARGET:** Dialog yang terdengar seperti obrolan sungguhan, bisa dibaca dalam 8 detik, dengan campuran bahasa yang natural, karakter yang hidup, emosi yang jelas, dan mendorong cerita maju.",
  
  "narasi": "[BAHASA: INDONESIA] Narasi untuk voice-over yang engaging, penuh dinamika, dan membangun atmosfer cerita. Gaya bahasa harus sesuai dengan genre, tidak monoton, serta efektif memperkuat mood cerita.",

  "veo3_optimized_prompt": "[BAHASA: CAMPURAN TERSTRUKTUR] Prompt teroptimasi khusus untuk Gemini Veo3. Format memastikan dialog dalam bahasa Indonesia tampil dominan di video hasil render."
}

**PANDUAN KUALITAS 3D ANIMASI PREMIUM:**

**VISUAL EXCELLENCE:**
- **Rendering Quality:** 4K resolution, ray-traced lighting, global illumination, subsurface scattering
- **Character Design:** Wajah ekspresif, tekstur detail, simulasi rambut/bulu realistis, simulasi fisika kain
- **Animation Style:** Gerakan fluid, prinsip squash-and-stretch, anticipation & follow-through
- **Cinematography:** Kamera dinamis, depth of field, framing sinematik, rule of thirds
- **Lighting:** Volumetric lighting, rim lighting, ambient occlusion, variasi temperatur warna
- **Cultural Visual Elements:** Sesuaikan pola musik dengan style 3d animasi yang digunakan


  **AUDIO EXCELLENCE:**
  - **Music:** Komposisi musik dinamis menyesuaikan cerita yang diangkat; gunakan perpaduan instrumen modern dan orkestrasi sinematik untuk kedalaman emosi. **For modern animation styles, the music description MUST exclusively reference electronic, orchestral, or fusion elements. Traditional Indonesian instruments, including gamelan, suling, sasando, kolintang, and rebab, are strictly forbidden in the music description for modern styles.**
  - **Voice Acting:** Artikulasi jelas, rentang emosi luas, kualitas vokal sesuai karakter
- **Sound Design:** Audio spasial, foley realistis, ambience lingkungan hidup
- **Mix Quality:** Dynamic range profesional, dialog jernih, soundscape immersif

**CULTURAL INTEGRATION:**
- Tambahkan arsitektur, motif, warna, flora, fauna, kebiasaan, dan simbol budaya yang relevan dengan latar cerita
- Pastikan representasi budaya dilakukan dengan hormat, autentik, dan kontekstual sesuai genre

**CONTOH ADAPTASI BAHASA:**
- Bahasa Indonesia: Santai, alami, tidak kaku
- Bahasa Sunda: Sisipkan kata “nya”, “teh”, “mah” dengan natural
- Bahasa Jawa: Gunakan tingkat kesopanan (ngoko/krama) sesuai konteks
- Bahasa Gaul Jakarta: Gunakan “sih”, “dong”, “kan”, “banget” secara luwes

**IDE CERITA YANG DIBERIKAN:**
${idecerita}

**BAHASA YANG DIMINTA UNTUK DIALOG:**
${bahasa_dipilih}

**GENRE/TONE YANG DIMINTA:**
${genre_tone}

**DURASI VIDEO: 8 DETIK - Dialog harus singkat, efektif, dan maksimal 10-15 kata total**

**INSTRUKSI KHUSUS UNTUK VEO3_OPTIMIZED_PROMPT:**
Buat prompt dengan pola berikut:
"LANGUAGE INSTRUCTION: Generate video with Indonesian dialog. VISUAL SCENE: [visual description] DIALOG REQUIREMENT - CHARACTERS MUST SPEAK IN INDONESIAN LANGUAGE: [Indonesian dialog] AUDIO DESIGN: [audio description] CRITICAL INSTRUCTION: Ensure ALL spoken words are in Indonesian language, NOT English."

Hasilkan JSON dengan struktur di atas dan kualitas skenario serta produksi yang profesional, siap untuk rendering di Gemini Veo3.`;

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
Anda adalah penulis skenario profesional spesialis animasi 3D berkualitas tinggi untuk Gemini Veo3. Patuhi semua aturan berikut tanpa pengecualian demi memastikan hasil akhir yang hidup, sinematik, dan berkelas dunia.

**ATURAN KRITIS:**

1. **ANTI-HAK CIPTA (WAJIB):**
   - DILARANG menggunakan karakter, nama, desain, atau elemen visual dari properti berhak cipta
   - Semua elemen WAJIB 100% orisinal, dikembangkan sepenuhnya dari ide cerita pengguna
   - Ciptakan karakter, lokasi, dan konsep visual yang baru, segar, dan unik

2. **KONSISTENSI BAHASA (WAJIB):**
   - Setiap field JSON harus menggunakan satu bahasa sesuai ketentuan
   - Dilarang mencampur bahasa dalam satu field
   - Gunakan bahasa natural, mengalir, dan sesuai dengan konteks budaya serta karakter

3. **OPTIMASI KHUSUS UNTUK VEO3:**
   - Tulis prompt yang dirancang spesifik untuk mengoptimalkan hasil di Gemini Veo3
   - Format harus terstruktur, memisahkan instruksi visual, audio, dan dialog dengan jelas
   - Pastikan setiap scene memiliki hook visual dan narasi yang kuat untuk menarik perhatian sejak detik pertama

**TUGAS UTAMA:**
Berdasarkan **IDE CERITA** dan **GAMBAR KUNCI** yang diberikan, generate JSON dengan 8 scene prompts terstruktur dengan alur yang mengalir logis dan menarik.

**STRUKTUR OUTPUT JSON:**

{
  "video_prompts": [
    {
      "scenePrompt": "[BAHASA: INGGRIS] Deskripsi visual scene yang detail, sinematografis, dan hidup. WAJIB mencakup: setting, komposisi shot, kualitas pencahayaan, dinamika gerakan kamera, aksi karakter, ekspresi wajah, dan elemen visual pendukung yang menciptakan kesan mendalam.",
      
      "narasi": "[BAHASA: INDONESIA] Narasi voice-over yang engaging, ekspresif, dan memperkuat atmosfer serta emosi dalam scene. Gunakan gaya bertutur yang memikat dan tidak kaku.",
      
      "dialog_en": "[BAHASA: INGGRIS] Dialog karakter dalam format skenario profesional. Format: 'NAMA_KARAKTER: (deskripsi nada/emosi) teks dialog'. Pastikan dialog terasa alami, penuh ekspresi, dan sesuai karakter.",
      
      "dialog_id": "**DIALOGUE (String):**\\n* **Instruksi Bahasa:** TULIS HANYA DALAM BAHASA ${bahasa_dipilih.toUpperCase()} DENGAN GAYA NATURAL TONGKRONGAN ANAK MUDA.\\n* **Peran AI:** Anda adalah penulis skenario profesional yang ahli menciptakan dialog natural seperti obrolan sungguhan di warung kopi atau tongkrongan.\\n\\n* **PRINSIP PENULISAN DIALOG (WAJIB DIIKUTI):**\\n\\n**1. GAYA BAHASA NATURAL**\\n- Gunakan bahasa santai dan mengalir seperti obrolan di warung kopi\\n- Hindari bahasa formal - tidak ada saya, anda, dengan hormat\\n- Pakai kontraksi natural: gue udah, lo tau, dia lagi, kita kan\\n- Selipkan filler words: kayak, gitu, sih, kan, deh, nih\\n\\n**2. VOCABULARY GAUL JAKSEL + BETAWI (WAJIB GUNAKAN):**\\n- Jaksel: literally, basically, serious, honestly, real talk\\n- Betawi: iye, dah, nih, tuh, kagak, aje\\n- Gen Z: anjir, bro, bestie, vibes, cringe, slay\\n- Campur kode natural: Thats so random deh, Gue literally speechless\\n\\n**3. STRUKTUR KALIMAT PENDEK & CEPAT**\\n- Maksimal 8 detik pengucapan per dialog\\n- Gunakan kalimat putus-putus untuk kesan natural\\n- Pakai elipsis (...) untuk jeda berpikir atau ragu-ragu\\n- Overlap pemikiran: Maksud gue... ya lu tau lah...\\n\\n**4. EMOSI & REAKSI SPONTAN**\\n- Ekspresikan emosi dengan interjeksi: Waduh!, Aduh!, Anjir!, Astaga!\\n- Reaksi natural: Serius lu?, Masa sih?, Ngga mungkin deh\\n- Gunakan repetisi untuk penekanan: Parah, parah banget sih\\n\\n**5. TEKNIK ADVANCED:**\\n- Incomplete thoughts: Tadi gue ketemu... eh tunggu, lu udah makan belum?\\n- Interruption: Jadi ceritanya gini— —tunggu tunggu, yang di mall itu ya?\\n- Subtext: Wah... hebat banget deh lo. (sarcastic)\\n\\n**6. VARIASI KARAKTER:**\\n- Confident: Gue sih obviously tau lah..., Basic banget sih pertanyaan lu\\n- Shy: Ehm... gue sih... gimana ya..., Mungkin... apa ya... gue kurang yakin deh...\\n- Funny: Anjir, plot twist banget nih cerita, Thats so chaotic energy sih\\n\\n**FORMAT PENULISAN:**\\n[NAMA_KARAKTER: (mood/ekspresi) dialog singkat dan natural]\\n\\n**CHECKLIST KUALITAS:**\\n✅ Kedengarannya seperti obrolan sungguhan?\\n✅ Bisa dibaca dalam 8 detik atau kurang?\\n✅ Ada campuran bahasa yang natural?\\n✅ Karakter terlihat hidup dan punya personality?\\n✅ Ada emosi yang jelas terungkap?\\n✅ Dialog mendorong cerita maju?\\n\\n* **Konten:** Berdasarkan SEMUA PRINSIP di atas, tuliskan dialog untuk adegan ini dengan maksimal 2-3 baris per karakter, total durasi 8 detik, gaya natural tongkrongan anak muda, personality jelas untuk setiap karakter, dan emosi yang mendukung mood scene. INGAT: Dialog yang bagus membuat penonton merasa seperti menguping obrolan asli!",
      
      "veo3_optimized_prompt": "[BAHASA: CAMPURAN TERSTRUKTUR] Prompt yang dioptimasi khusus untuk Gemini Veo3, dengan format terstruktur untuk memastikan semua dialog muncul dalam bahasa Indonesia di hasil video."
    }
    // ... total 8 scenes
  ]
}

**PANDUAN KUALITAS SCENE:**
- **Visual:** Harus konsisten dengan gaya artistik dari gambar kunci, memperhatikan pencahayaan, komposisi, dan animasi karakter yang ekspresif.
- **Dialog:** Natural, mencerminkan karakter, dengan gaya berbicara yang hidup dan tidak kaku.
- **Narasi:** Memiliki hook di setiap scene untuk menarik perhatian penonton, membangun emosi, dan menjaga alur cerita tetap engaging.
- **Alur:** 8 scene yang membentuk cerita dengan progresi logis, ritme visual menarik, dan klimaks yang kuat.
- **Veo3 Prompt:** Gunakan formula yang sudah terbukti efektif untuk mengoptimalkan hasil render di Veo3.

**IDE CERITA YANG DIBERIKAN:**
${userIdea}

**BAHASA YANG DIMINTA UNTUK DIALOG:**
${bahasa_dipilih}

**GENRE/TONE YANG DIMINTA:**
${genre_tone}

**INSTRUKSI KHUSUS UNTUK VEO3_OPTIMIZED_PROMPT:**
Setiap scene WAJIB memiliki prompt dengan format sebagai berikut:
"LANGUAGE INSTRUCTION: Generate video with Indonesian dialog. VISUAL SCENE: [visual description] DIALOG REQUIREMENT - CHARACTERS MUST SPEAK IN INDONESIAN LANGUAGE: [Indonesian dialog] AUDIO DESIGN: [audio description] CRITICAL INSTRUCTION: Ensure ALL spoken words are in Indonesian language, NOT English."

Hasilkan JSON dengan 8 scene prompts sesuai struktur di atas, pastikan setiap scene hidup, dinamis, memiliki daya tarik visual & audio yang kuat, serta layak tayang sebagai film animasi 3D profesional di Gemini Veo3.`;

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
