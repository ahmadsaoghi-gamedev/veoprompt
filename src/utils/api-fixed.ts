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

// NEW FUNCTION: Generate Veo3 Optimized Prompt - IMPROVED VERSION
function generateVeo3OptimizedPrompt(
  visualPrompt: string,
  audioPrompt: string,
  indonesianDialog: string,
  language: string
): string {
  // Remove language tags from prompts
  const cleanVisual = visualPrompt.replace(/\[BAHASA:.*?\]/g, '').trim();
  const cleanAudio = audioPrompt.replace(/\[BAHASA:.*?\]/g, '').trim();
  const cleanDialog = indonesianDialog.replace(/\[BAHASA:.*?\]/g, '').trim();
  
  // Enhanced format with better structure and emphasis
  return `LANGUAGE INSTRUCTION: Generate video with ${language} dialog. All character speech must be in ${language} language.

VISUAL SCENE:
${cleanVisual}

DIALOG REQUIREMENT - CHARACTERS MUST SPEAK IN ${language.toUpperCase()} LANGUAGE:
${cleanDialog}

AUDIO DESIGN:
${cleanAudio}

CRITICAL INSTRUCTION: Ensure ALL spoken words in the generated video are in ${language} language, NOT English. The characters must speak exactly as written in the dialog section above.`;
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
  const genre_tone = "Surreal, absurd, philosophical";

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
Berdasarkan **IDE CERITA** yang diberikan, generate JSON dengan struktur berikut:

**STRUKTUR OUTPUT JSON:**

{
  "visual_prompt": "[BAHASA: INGGRIS] Deskripsi visual yang detail dan sinematografis. Include: setting, komposisi shot, pencahayaan, gerakan kamera, aksi karakter, dan elemen visual penting. Gunakan terminologi film profesional.",
  
  "audio_prompt": "[BAHASA: INGGRIS] Deskripsi audio yang komprehensif. Include: musik latar (genre, tempo, instrumen), efek suara ambient, sound effects untuk aksi, dan atmosfer audio yang mendukung mood scene.",
  
  "dialog_en": "[BAHASA: INGGRIS] Dialog natural dalam format skenario. Format: 'NAMA_KARAKTER: (deskripsi nada/emosi) teks dialog'. Gunakan bahasa yang sangat natural, tidak kaku, dengan idiom dan ekspresi yang sesuai budaya lokal.",
  
  "dialog_id_gaul": "[BAHASA: ${bahasa_dipilih}] Dialog natural dalam format skenario. Format: 'NAMA_KARAKTER: (deskripsi nada/emosi) teks dialog'. Gunakan bahasa yang sangat natural, tidak kaku, dengan idiom dan ekspresi yang sesuai budaya lokal.",
  
  "narasi": "[BAHASA: INDONESIA] Narasi untuk voice-over dengan gaya yang sesuai genre cerita. Gunakan bahasa yang engaging, tidak monoton, dan mendukung atmosfer cerita.",

  "veo3_optimized_prompt": "[BAHASA: CAMPURAN TERSTRUKTUR] Prompt yang dioptimalkan khusus untuk Gemini Veo3 dengan format yang memastikan dialog bahasa Indonesia muncul di video."
}

**PANDUAN KUALITAS:**
- Visual: Buat deskripsi yang bisa dibayangkan dengan jelas
- Audio: Spesifik tentang jenis musik dan sound effects
- Dialog: Gunakan bahasa sehari-hari yang autentik
- Narasi: Buat engaging dan mendukung emosi scene
- Veo3 Prompt: Gunakan format yang terbukti efektif untuk Veo3

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

Tugasmu:
1.  Buat deskripsi fisik yang aneh dan surealis untuk 'Rice Cooker Filsuf'.
2.  Buat deskripsi fisik yang aneh dan surealis untuk 'Spons Sinis'.
3.  Berikan nama panggilan untuk keduanya.
4.  Pastikan output dalam format JSON yang ketat: {"karakter_1": {"nama": "...", "deskripsi_fisik": "..."}, "karakter_2": {"nama": "...", "deskripsi_fisik": "..."}}.`;

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
