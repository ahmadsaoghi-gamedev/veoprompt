import { APISettings } from '../types';

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

// New function specifically for JSON responses
export async function callGeminiAPIForJSON(
  prompt: string,
  imageBase64?: string,
  apiSettings?: APISettings
): Promise<Record<string, unknown>> {
  const response = await callGeminiAPI(prompt, imageBase64, apiSettings);

  try {
    // Try to parse as JSON directly
    const jsonResponse = JSON.parse(response);
    return jsonResponse;
  } catch {
    console.log('Initial JSON parse failed, attempting extraction...');

    // If parsing fails, try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        let jsonString = jsonMatch[0];
        console.log('Extracted JSON string:', jsonString.substring(0, 200) + '...');

        // Clean up common JSON issues
        jsonString = jsonString
          .replace(/\n\s*\n/g, '\n') // Remove empty lines
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/([^\\])\\([^"\\/bfnrt])/g, '$1\\\\$2') // Fix unescaped backslashes
          .replace(/\n/g, '\\n') // Escape newlines
          .replace(/\r/g, '\\r') // Escape carriage returns
          .replace(/\t/g, '\\t'); // Escape tabs

        console.log('Cleaned JSON string:', jsonString.substring(0, 200) + '...');
        return JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse extracted JSON:', parseError);
        console.error('Raw response length:', response.length);
        console.error('Raw response preview:', response.substring(0, 500));
        console.error('Extracted JSON preview:', jsonMatch[0].substring(0, 500));

        // Try a more aggressive cleanup
        try {
          const aggressiveClean = jsonMatch[0]
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
            .replace(/([^\\])\\([^"\\/bfnrt])/g, '$1\\\\$2') // Fix unescaped backslashes
            .trim();

          console.log('Aggressive cleanup attempt...');
          return JSON.parse(aggressiveClean);
        } catch (aggressiveError) {
          console.error('Aggressive cleanup also failed:', aggressiveError);

          // Last resort: try to create a minimal valid JSON
          try {
            const fallbackJson = {
              id: `scene_${Date.now()}`,
              sceneNumber: 1,
              duration: 8,
              prompt: "Scene generation failed - please retry",
              characters: [],
              objects: [],
              location: "Unknown",
              timeOfDay: "day",
              weather: "clear",
              mood: "neutral",
              cinematography: {
                cameraWork: "Standard shot",
                lighting: "Natural lighting",
                colorPalette: "Neutral colors",
                visualEffects: []
              },
              audio: {
                dialogue: [],
                ambientSounds: [],
                music: "Background music",
                soundEffects: []
              },
              storyBeat: "Scene generation failed",
              characterDevelopment: "None",
              visualMetaphors: [],
              antiMainstreamElements: [],
              continuityNotes: "Generation failed",
              nextSceneSetup: "Please retry"
            };

            console.log('Using fallback JSON due to parsing failure');
            return fallbackJson;
          } catch (fallbackError) {
            console.error('Even fallback failed:', fallbackError);
            throw new Error('Invalid JSON response from API. Please try again.');
          }
        }
      }
    }

    // If no JSON found, try to create a fallback response
    console.log('No JSON pattern found in response, creating fallback...');
    const fallbackJson = {
      id: `scene_${Date.now()}`,
      sceneNumber: 1,
      duration: 8,
      prompt: "Scene generation failed - please retry",
      characters: [],
      objects: [],
      location: "Unknown",
      timeOfDay: "day",
      weather: "clear",
      mood: "neutral",
      cinematography: {
        cameraWork: "Standard shot",
        lighting: "Natural lighting",
        colorPalette: "Neutral colors",
        visualEffects: []
      },
      audio: {
        dialogue: [],
        ambientSounds: [],
        music: "Background music",
        soundEffects: []
      },
      storyBeat: "Scene generation failed",
      characterDevelopment: "None",
      visualMetaphors: [],
      antiMainstreamElements: [],
      continuityNotes: "Generation failed",
      nextSceneSetup: "Please retry"
    };

    return fallbackJson;
  }
}

// Standardized JSON response types
export interface StandardVideoPromptResponse {
  videoPrompt: string;
  sceneType?: string;
  duration: number;
  characters: string[];
  objects: string[];
  location: string;
  timeOfDay: string;
  weather: string;
  cameraWork: string;
  lighting: string;
  audioElements: string[];
  visualStyle: string;
  metadata?: {
    [key: string]: unknown;
  };
}

export interface StandardSceneResponse {
  title: string;
  mainDescription: string;
  scenes: Array<{
    sceneNumber: number;
    prompt: string;
    duration: number;
    characters: string[];
    objects: string[];
  }>;
}

export interface StandardMarketingResponse {
  videoPrompt: string;
  marketingMessage: string;
  targetAudience: string;
  callToAction: string;
  visualElements: string[];
  audioElements: string[];
  duration: number;
  style: string;
  tone: string;
}

// Helper function to ensure JSON response format
export function ensureJSONResponse(response: unknown, expectedKeys: string[]): Record<string, unknown> {
  if (typeof response !== 'object' || response === null) {
    throw new Error('Response is not a valid JSON object');
  }

  const responseObj = response as Record<string, unknown>;
  const missingKeys = expectedKeys.filter(key => !(key in responseObj));
  if (missingKeys.length > 0) {
    console.warn(`Missing expected keys in response: ${missingKeys.join(', ')}`);
  }

  return responseObj;
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
  const prompt = `Kamu adalah seorang desainer konsep. Berdasarkan ide cerita spesifik ini: '${userIdea}'

Tugasmu:
1.  Buat deskripsi fisik yang aneh dan surealis untuk 3 karakter unik.
2.  Berikan nama panggilan yang kreatif untuk ketiganya.
3.  Pastikan setiap karakter memiliki ciri khas yang berbeda dan memorable.
4.  Pastikan output dalam format JSON yang ketat: {"karakter_1": {"nama": "...", "deskripsi_fisik": "..."}, "karakter_2": {"nama": "...", "deskripsi_fisik": "..."}, "karakter_3": {"nama": "...", "deskripsi_fisik": "..."}}.`;

  const response = await callGeminiAPI(prompt, undefined, apiSettings);
  return JSON.parse(response);
}

interface AnomalyCharacter {
  nama: string;
  deskripsi_fisik: string;
}

interface AnomalyStoryResponse {
  judul: string;
  sinopsis_per_adegan: string[];
}

export async function generateAnomalyStory(
  characters: { karakter_1: AnomalyCharacter; karakter_2: AnomalyCharacter; karakter_3: AnomalyCharacter },
  userIdea: string,
  apiSettings?: APISettings
): Promise<AnomalyStoryResponse> {
  const prompt = `Given these three surreal characters:
    Character 1: ${characters.karakter_1.nama} - ${characters.karakter_1.deskripsi_fisik}
    Character 2: ${characters.karakter_2.nama} - ${characters.karakter_2.deskripsi_fisik}
    Character 3: ${characters.karakter_3.nama} - ${characters.karakter_3.deskripsi_fisik}

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

interface StoryContext {
  judul: string;
  sinopsis_per_adegan: string[];
}

interface LanguageOptions {
  Language: string;
  Accent: string;
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

export async function generateAnomalyScenePrompt(
  storyContext: StoryContext,
  characters: { karakter_1: AnomalyCharacter; karakter_2: AnomalyCharacter; karakter_3: AnomalyCharacter },
  sceneNumber: number,
  totalScenes: number,
  languageOptions: LanguageOptions,
  referencePrompt: string,
  selectedStyle: string,
  aspectRatio: string,
  apiSettings?: APISettings
): Promise<{
  visual_prompt: string;
  audio_prompt: string;
  dialog_en: string;
  dialog_id_gaul: string;
  narasi: string;
  veo3_optimized_prompt: string;
  sceneSetup?: {
    location: string;
    atmosphere: string;
    timeOfDay: string;
    mood: string;
    weather?: string;
  };
  characters?: {
    name: string;
    age: string;
    clothing: string;
    emotion: string;
    position: string;
  }[];
  beatCount?: number;
  duration?: number;
  language?: string;
}> {
  const idecerita = `${storyContext.judul} - Scene ${sceneNumber}: ${storyContext.sinopsis_per_adegan[sceneNumber - 1]}. Characters: ${characters.karakter_1.nama} (${characters.karakter_1.deskripsi_fisik}), ${characters.karakter_2.nama} (${characters.karakter_2.deskripsi_fisik}), and ${characters.karakter_3.nama} (${characters.karakter_3.deskripsi_fisik})`;
  const bahasa_dipilih = languageOptions.Language;
  const genre_tone = "Surreal, absurd, philosophical";

  // Helper function to get dialog language based on accent
  const getDialogLanguageByAccent = (accent: string): string => {
    const languageMap: Record<string, string> = {
      'Betawi': 'Bahasa Indonesia Gaul dengan Logat Betawi',
      'Jawa': 'Bahasa Jawa',
      'Sunda': 'Bahasa Sunda',
      'US': 'American English',
      'British': 'British English'
    };
    return languageMap[accent] || 'Bahasa Indonesia';
  };

  const dynamicPrompt = `
**SISTEM INSTRUKSI UTAMA:**
Anda adalah penulis skenario profesional yang menciptakan konten 100% orisinal. Patuhi semua aturan berikut tanpa pengecualian.

**ATURAN KRITIS:**

1. **ANTI-HAK CIPTA (MUTLAK):**
   - DILARANG menggunakan karakter/nama/desain dari properti yang dilindungi hak cipta
   - Semua elemen HARUS 100% orisinal berdasarkan ide cerita pengguna
   - Ciptakan nama karakter, lokasi, dan konsep yang benar-benar baru

2. **KONSISTENSI BAHASA (MUTLAK):**
   - Setiap field JSON menggunakan bahasa yang telah ditentukan
   - JANGAN mencampur bahasa dalam satu field
   - Gunakan bahasa yang natural dan sesuai konteks

3. **ADAPTASI DINAMIS:**
   - Sesuaikan tone dan gaya dengan genre yang diminta
   - Pertimbangkan target audience dari cerita
   - Buat dialog yang terasa hidup dan autentik

**TUGAS UTAMA:**
Berdasarkan **IDE CERITA** yang diberikan, generate JSON dengan struktur berikut:

**STRUKTUR OUTPUT JSON:**

{
  "visual_prompt": "[Language: INGGRIS] Deskripsi visual yang detail dan sinematografis. Include: setting, komposisi shot, pencahayaan, gerakan kamera, aksi karakter, dan elemen visual penting. Gunakan terminologi film profesional.",
  
  "audio_prompt": "[Language: INGGRIS] Deskripsi audio yang komprehensif. Include: musik latar (genre, tempo, instrumen), efek suara ambient, sound effects untuk aksi, dan atmosfer audio yang mendukung mood scene.",
  
  "dialog_en": "[Language: INGGRIS] Dialog dalam format bracket dengan timing dan newlines. Format: '[0-2s] Character: (emotion), dialogue' kemudian '[3-5s] Character2: (emotion), dialogue' dst. Total maksimal 8 detik. Bisa melibatkan 2-3 karakter.",
  
  "dialog_id_gaul": "[Language: ${getDialogLanguageByAccent(languageOptions.Accent)}] Dialog dalam format bracket dengan timing dan newlines. Format: '[0-2s] Karakter: (emosi), dialog' kemudian '[3-5s] Karakter2: (emosi), dialog' dst. Total maksimal 8 detik. Karakter dari: ${characters.karakter_1.nama}, ${characters.karakter_2.nama}, ${characters.karakter_3.nama}.",
  
  "narasi": "[Language: INDONESIA] Narasi untuk voice-over dengan gaya yang sesuai genre cerita. Gunakan bahasa yang engaging, tidak monoton, dan mendukung atmosfer cerita.",
  
  "veo3_optimized_prompt": "[Language: CAMPURAN TERSTRUKTUR] Prompt teroptimasi untuk Veo3 dengan visual style: ${selectedStyle}, aspect ratio: ${aspectRatio}. Gabungkan elemen visual dari scene dengan gaya visual yang konsisten, JANGAN copy-paste referensi secara langsung.",
  
  "sceneSetup": {
    "location": "[Language: INGGRIS] Lokasi spesifik dimana scene berlangsung",
    "atmosphere": "[Language: INGGRIS] Deskripsi atmosfer dan suasana scene",
    "timeOfDay": "[Language: INGGRIS] Waktu dalam hari (morning, afternoon, evening, night, etc)",
    "mood": "[Language: INGGRIS] Mood emosional dari scene",
    "weather": "[Language: INGGRIS] Kondisi cuaca jika relevan"
  },
  
  "characters": [
    {
      "name": "Nama karakter",
      "age": "Perkiraan umur (e.g., '25', 'mid-30s', 'elderly')",
      "clothing": "Deskripsi pakaian yang dikenakan",
      "emotion": "Emosi yang ditampilkan karakter",
      "position": "Posisi karakter dalam scene (left, center, right, background, etc)"
    }
  ],
  
  "beatCount": 3,
  "duration": 8,
  "language": "${bahasa_dipilih}"
}

**PANDUAN KUALITAS:**
- Visual: Buat deskripsi yang bisa dibayangkan dengan jelas
- Audio: Spesifik tentang jenis musik dan sound effects
- Dialog: Gunakan bahasa sehari-hari yang autentik
- Narasi: Buat engaging dan mendukung emosi scene
- Scene Setup: Berikan detail lokasi, atmosfer, waktu, dan mood yang jelas
- Characters: Deskripsikan setiap karakter yang muncul dalam scene dengan detail

**CONTOH ADAPTASI Language:**
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

**DURASI VIDEO: 8 DETIK - Dialog harus singkat dan padat (maksimal 15-35 kata total)**

Hasilkan JSON yang mengikuti struktur di atas dengan kualitas profesional.`;

  const response = await callGeminiAPI(dynamicPrompt, undefined, apiSettings);
  try {
    // Clean the response to handle potential JSON issues
    let cleanedResponse = response.trim();

    // Remove any potential control characters
    cleanedResponse = cleanedResponse.replace(/[\p{Cc}\p{Cf}]/gu, '');

    // Try to extract JSON if wrapped in markdown or other text
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }

    const result = JSON.parse(cleanedResponse);

    // Ensure dialog fields have proper newline formatting
    if (result.dialog_en) {
      result.dialog_en = result.dialog_en.replace(/\]\s*\[/g, ']\n[');
    }
    if (result.dialog_id_gaul) {
      result.dialog_id_gaul = result.dialog_id_gaul.replace(/\]\s*\[/g, ']\n[');
    }

    // Count dialogue beats (accounting for timing format)
    if (!result.beatCount && result.dialog_id_gaul) {
      const dialogLines = result.dialog_id_gaul.split('\n').filter((line: string) => {
        const trimmed = line.trim();
        // Match both old format [Character: ...] and new format [0-2s] Character: ...
        return trimmed.startsWith('[') && (trimmed.includes(':') || trimmed.match(/\[\d+-\d+s\]/));
      });
      result.beatCount = dialogLines.length;
    }

    // Ensure duration is set
    if (!result.duration) {
      result.duration = 8;
    }

    // Ensure language is set
    if (!result.language) {
      result.language = bahasa_dipilih;
    }

    // Generate veo3_optimized_prompt if not included in response
    if (!result.veo3_optimized_prompt) {
      result.veo3_optimized_prompt = `${result.visual_prompt}\n\nStyle: ${selectedStyle}\nAspect Ratio: ${aspectRatio}\n\nDIALOG REQUIREMENT:\n${result.dialog_id_gaul || result.dialog_en}`;
    }

    return result;
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    console.error('Raw response:', response);
    throw new Error('Invalid JSON response from API. Please try again.');
  }
}

export async function generateVideoPromptsFromImage(
  userIdea: string,
  keyImage: string,
  languageOptions: LanguageOptions,
  apiSettings?: APISettings
): Promise<{ video_prompts: { scenePrompt: string; narasi: string; dialog_en: string; dialog_id: string; }[] }> {
  const bahasa_dipilih = languageOptions.Language;
  const genre_tone = "Cinematic, narrative-driven";

  const dynamicPrompt = `
**SISTEM INSTRUKSI UTAMA:**
Anda adalah penulis skenario profesional yang menciptakan konten 100% orisinal. Patuhi semua aturan berikut tanpa pengecualian.

**ATURAN KRITIS:**

1. **ANTI-HAK CIPTA (MUTLAK):**
   - DILARANG menggunakan karakter/nama/desain dari properti yang dilindungi hak cipta
   - Semua elemen HARUS 100% orisinal berdasarkan ide cerita pengguna
   - Ciptakan nama karakter, lokasi, dan konsep yang benar-benar baru

2. **KONSISTENSI BAHASA (MUTLAK):**
   - Setiap field JSON menggunakan bahasa yang telah ditentukan
   - JANGAN mencampur bahasa dalam satu field
   - Gunakan bahasa yang natural dan sesuai konteks

3. **ADAPTASI DINAMIS:**
   - Sesuaikan tone dan gaya dengan genre yang diminta
   - Pertimbangkan target audience dari cerita
   - Buat dialog yang terasa hidup dan autentik

**TUGAS UTAMA:**
Berdasarkan **IDE CERITA** dan **GAMBAR KUNCI** yang diberikan, generate JSON dengan 8 scene prompts:

**STRUKTUR OUTPUT JSON:**

{
  "video_prompts": [
    {
      "scenePrompt": "[Language: INGGRIS] Deskripsi visual scene yang detail dan sinematografis. Include: setting, komposisi shot, pencahayaan, gerakan kamera, aksi karakter, dan elemen visual penting.",
      "narasi": "[Language: INDONESIA] Narasi voice-over yang engaging dan mendukung atmosfer cerita.",
      "dialog_en": "[Language: INGGRIS] Dialog natural dalam format skenario.",
      "dialog_id": "[Language: ${bahasa_dipilih}] Dialog natural yang sama dalam bahasa lokal yang autentik."
    }
    // ... 8 scenes total
  ]
}

**PANDUAN KUALITAS:**
- Visual: Konsisten dengan gaya gambar kunci
- Dialog: Natural dan sesuai karakter
- Narasi: Engaging dan mendukung emosi
- Alur: 8 scene yang mengalir logis

**IDE CERITA YANG DIBERIKAN:**
${userIdea}

**BAHASA YANG DIMINTA UNTUK DIALOG:**
${bahasa_dipilih}

**GENRE/TONE YANG DIMINTA:**
${genre_tone}

Hasilkan JSON dengan 8 scene prompts yang mengikuti struktur di atas dengan kualitas profesional.`;

  const response = await callGeminiAPI(dynamicPrompt, keyImage, apiSettings);
  return JSON.parse(response);
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

export async function fixMultiCharacterDialogue(
  problematicDialogue: string,
  settings: {
    sceneDuration?: number;
    numberOfCharacters?: number;
    includeNarration?: boolean;
    language?: 'indonesian' | 'english';
    tone?: 'dramatic' | 'comedic' | 'neutral' | 'emotional';
  },
  apiSettings?: APISettings
): Promise<{
  scene: string;
  characters: Array<{
    name: string;
    description: string;
    position: string;
  }>;
  dialogueSequence: Array<{
    beatNumber: number;
    timing: string;
    character: string;
    action: string;
    dialogue: string;
    camera: string;
    audio: string;
  }>;
  tips: string[];
}> {
  const duration = settings.sceneDuration || 11;
  const language = settings.language || 'indonesian';
  const tone = settings.tone || 'neutral';

  // Helper function to extract dialogue from various formats
  const extractDialogueFromInput = (input: string): Array<{ speaker: string; emotion?: string; text: string }> => {
    const dialogues: Array<{ speaker: string; emotion?: string; text: string }> = [];

    // Pattern 1: **Character:** "dialogue"
    const pattern1 = /\*\*([^:*]+):\*\*\s*"([^"]+)"/g;
    let match;
    while ((match = pattern1.exec(input)) !== null) {
      dialogues.push({ speaker: match[1].trim(), text: match[2].trim() });
    }

    // Pattern 2: Character: "dialogue"
    const pattern2 = /^([^:*\n]+):\s*"([^"]+)"/gm;
    while ((match = pattern2.exec(input)) !== null) {
      if (!match[0].includes('**')) {
        dialogues.push({ speaker: match[1].trim(), text: match[2].trim() });
      }
    }

    // Pattern 3: [Character: (emotion), dialogue]
    const pattern3 = /\[([^:]+):\s*\(([^)]+)\),\s*([^\]]+)\]/g;
    while ((match = pattern3.exec(input)) !== null) {
      dialogues.push({ speaker: match[1].trim(), emotion: match[2].trim(), text: match[3].trim() });
    }

    // Pattern 4: Character (emotion): "dialogue"
    const pattern4 = /([^(\n]+)\s*\(([^)]+)\):\s*"([^"]+)"/g;
    while ((match = pattern4.exec(input)) !== null) {
      dialogues.push({ speaker: match[1].trim(), emotion: match[2].trim(), text: match[3].trim() });
    }

    return dialogues;
  };

  const extractedDialogues = extractDialogueFromInput(problematicDialogue);

  const prompt = `You are an expert Gemini Veo 3 specialist tasked with fixing multi-character dialogue structure for AI video generation. Your focus is ensuring smooth conversation flow between characters without confusion about who is speaking.

**EXTRACTED DIALOGUE TO STRUCTURE:**
${extractedDialogues.map((d, i) => `${i + 1}. ${d.speaker}${d.emotion ? ` (${d.emotion})` : ''}: "${d.text}"`).join('\n')}

**SETTINGS:**
- Scene Duration: ${duration} seconds
- Language: ${language}
- Tone: ${tone}
- Include Narration: ${settings.includeNarration ? 'Yes' : 'No'}

**YOUR TASK:**
Transform the extracted dialogue into a properly structured BEAT system format that Gemini Veo 3 can understand clearly.

**ABSOLUTE CRITICAL RULES - DIALOGUE PRESERVATION (VIOLATION WILL RESULT IN FAILURE):**
1. **USE ONLY THE EXTRACTED DIALOGUE** - The dialogue lines have been extracted above. Use them EXACTLY as shown.
2. **PRESERVE SPEAKER ORDER** - The speakers appear in the order shown in the extraction. Maintain this order.
3. **CHARACTER NAMING RULES**:
   - If language is 'english', ALL character names MUST be in English (e.g., "Mother" not "Ibu", "Child" not "Anak")
   - If language is 'indonesian', character names can be in Indonesian
   - Common translations: Ibu/Mom/Mother, Anak/Child/Son/Daughter, Ayah/Dad/Father, Kakak/Brother/Sister
4. **DO NOT CREATE NEW DIALOGUE** - Use only what was extracted
5. **MAINTAIN EXACT WORDING** - Only translate if language setting requires it

**DIALOGUE ASSIGNMENT RULES:**
- Speaker 1 from extraction = Character 1 in output
- Speaker 2 from extraction = Character 2 in output
- And so on...

**REQUIRED OUTPUT FORMAT (JSON):**
{
  "scene": "Brief visual description of the scene setting",
  "characters": [
    {
      "name": "${language === 'english' ? '[English name for Character 1]' : '[Character 1 Name]'}",
      "description": "Complete physical description",
      "position": "Initial position in scene"
    },
    {
      "name": "${language === 'english' ? '[English name for Character 2]' : '[Character 2 Name]'}", 
      "description": "Complete physical description",
      "position": "Initial position in scene"
    }
  ],
  "dialogueSequence": [
    {
      "beatNumber": 1,
      "timing": "[0:00-0:03]",
      "character": "${language === 'english' ? '[English name]' : '[Character name]'}",
      "action": "Specific gesture and facial expression description",
      "dialogue": "[Exact dialogue from extraction, translated if needed]",
      "camera": "Camera movement/angle instruction",
      "audio": "Sound design for this moment"
    }
  ],
  "tips": [
    "Character names are ${language === 'english' ? 'in English' : 'localized'}",
    "Dialogue preserved exactly as provided"
  ]
}

**CRITICAL RULES:**
1. Use the EXACT dialogue lines from the extraction above
2. Maintain the EXACT speaker order from the extraction
3. If language is 'english', translate character names to English
4. Each BEAT must have clear timing that doesn't overlap
5. Total duration must not exceed ${duration} seconds
6. DO NOT add any dialogue that wasn't in the extraction

**EXTRACTED DIALOGUE COUNT: ${extractedDialogues.length} lines**
You must create exactly ${extractedDialogues.length} dialogue beats.

Return ONLY the JSON object with no additional text.`;

  const response = await callGeminiAPI(prompt, undefined, apiSettings);

  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse dialogue fix response:', error);
    throw new Error('Failed to process dialogue. Please try again.');
  }
}