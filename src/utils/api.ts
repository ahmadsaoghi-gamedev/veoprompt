import { APISettings } from '../types';

const DEFAULT_API_KEY = 'AIzaSyBBQW5vk3boXhE5aief20oVmbLizso_Y6Q';

export async function callGeminiAPI(
  prompt: string, 
  imageBase64?: string, 
  apiSettings?: APISettings
): Promise<string> {
  const apiKey = apiSettings?.usePrivateKey && apiSettings.privateKey 
    ? apiSettings.privateKey 
    : DEFAULT_API_KEY;

  if (!apiKey) {
    throw new Error('API key is not configured');
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
    
    if (errorMessage.includes('blocked') || errorMessage.includes('API key')) {
      throw new Error('API key is invalid or blocked. Please check your API key settings.');
    }
    
    throw new Error(errorMessage);
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

export async function validateAPIKey(apiKey: string): Promise<boolean> {
  try {
    const testPrompt = "Say 'API key is valid' in one sentence.";
    await callGeminiAPI(testPrompt, undefined, { 
      usePrivateKey: true, 
      privateKey: apiKey, 
      isActive: true, 
      lastValidated: null 
    });
    return true;
  } catch {
    return false;
  }
}

export async function generateVideo(prompt: string, apiSettings?: APISettings): Promise<string> {
  // This would integrate with Veo 3 API for actual video generation
  // For now, we'll simulate the process
  const apiKey = apiSettings?.usePrivateKey && apiSettings.privateKey 
    ? apiSettings.privateKey 
    : DEFAULT_API_KEY;

  if (!apiKey) {
    throw new Error('API key is not configured for video generation');
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

interface AnomalyCharacter {
  nama: string;
  deskripsi_fisik: string;
}

interface AnomalyStoryResponse {
  judul: string;
  sinopsis_per_adegan: string[];
}

export async function generateAnomalyStory(
  characters: { karakter_1: AnomalyCharacter; karakter_2: AnomalyCharacter },
  apiSettings?: APISettings
): Promise<AnomalyStoryResponse> {
  const prompt = `Given these two surreal characters:
    Character 1: ${characters.karakter_1.nama} - ${characters.karakter_1.deskripsi_fisik}
    Character 2: ${characters.karakter_2.nama} - ${characters.karakter_2.deskripsi_fisik}

    Create a movie title and an 8-scene synopsis featuring these characters.
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
  bahasa: string;
  aksen: string;
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
}> {
  const prompt = `**PROMPT UNTUK ADEGAN ${sceneNumber}/${totalScenes}**

**KONTEKS CERITA:**
* **Judul:** ${storyContext.judul}
* **Karakter & Deskripsi:**
  - ${characters.karakter_1.nama}: ${characters.karakter_1.deskripsi_fisik}
  - ${characters.karakter_2.nama}: ${characters.karakter_2.deskripsi_fisik}
* **Tujuan Adegan Ini:** ${storyContext.sinopsis_per_adegan[sceneNumber - 1]}

Buatlah satu objek JSON tunggal dengan struktur berikut:
- "visual_prompt": String yang berisi semua deskripsi visual, termasuk gaya utama (3D Anomaly Brainroot, surealis, fotorealistik dengan bentuk karakter yang absurd), sinematografi (camera movement, angle, lighting, color grading), setting (lokasi relevan dengan cerita), dan aksi karakter (gerakan dan ekspresi sesuai tujuan adegan). Deskripsikan secara detail dan spesifik untuk menciptakan nuansa aneh dan tidak terduga.
- "audio_prompt": String yang berisi deskripsi musik latar dan efek suara yang aneh dan tidak cocok untuk menambah kesan surealis.
- "dialog_en": String yang berisi dialog versi Bahasa Inggris, 2-3 baris antara karakter sesuai tujuan adegan, menggunakan gaya bicara khas karakter, non-formal.
- "dialog_id_gaul": String yang berisi dialog versi Bahasa Indonesia Gaul, sama dengan dialog_en tapi diterjemahkan ke bahasa gaul, santai, dengan aksen ${languageOptions.aksen}.
- "narasi": String yang berisi naskah narator (1-2 kalimat pendek) dalam bahasa Indonesia yang mengalir, deskriptif, sedikit puitis, tapi santai seperti obrolan teman. Berikan konteks emosional atau jelaskan yang tidak terlihat, hubungkan dengan perasaan karakter.

Output HANYA objek JSON tersebut, tanpa teks tambahan apa pun. Pastikan JSON valid dan sesuai contoh.`;

  const response = await callGeminiAPI(prompt, undefined, apiSettings);
  try {
    const result = JSON.parse(response);
    return result;
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    throw new Error('Invalid JSON response from API');
  }
}

export async function generateVideoPromptsFromImage(
  userIdea: string,
  keyImage: string,
  languageOptions: LanguageOptions, // Added new argument
  apiSettings?: APISettings
): Promise<{video_prompts: {scenePrompt: string; narasi: string; dialog_en: string; dialog_id: string;}[]}> { // Updated return type
  const prompt = `Act as a professional film director and a compelling narrator. Based on the user's idea "${userIdea}" and the provided key image (which establishes the visual style), create a series of 8 detailed video scene prompts that tell a complete story, along with a short narrator script and dialogue for each scene.

IMPORTANT REQUIREMENTS:
1. The character designs, visual style, and lighting from the key image MUST be maintained across all scenes for visual consistency.
2. Each scene prompt should include:
   - Scene setting/location
   - Character actions and emotions
   - Camera angles/movements
   - Lighting details
   - Any important visual effects
3. The scenes should flow logically from one to the next to form a coherent narrative.
4. Each narrator script should be concise (1-2 sentences) and provide emotional context or bridge the visual action with character feelings, as if telling a story to a friend.

**PROMPT AUDIO & DIALOG:**
* **Perintah untuk AI:** "Hasilkan DUA versi dialog untuk adegan ini: satu dalam bahasa Inggris, dan satu lagi dalam bahasa Indonesia sesuai dengan gaya yang diminta. Pastikan dialognya terdengar alami dan sesuai dengan kepribadian karakter."
* **Dialog Versi Inggris (Professional/Natural):** [Minta AI untuk menulis dialog dalam bahasa Inggris yang alami dan sesuai konteks]
* **Dialog Versi Indonesia (Gaya: ${languageOptions.bahasa}):** [Minta AI untuk menulis dialog yang sama, tetapi dalam bahasa Indonesia yang SANGAT SANTAI, non-formal, gaul, dan tidak kaku. Gunakan kosakata sehari-hari yang akrab.]

Return ONLY a JSON object in this exact format (with no additional text or markdown):
{
  "video_prompts": [
    {
      "scenePrompt": "Scene 1: [detailed visual prompt]",
      "narasi": "Narrator script for scene 1.",
      "dialog_en": "English dialogue for scene 1.",
      "dialog_id": "Indonesian dialogue for scene 1."
    },
    {
      "scenePrompt": "Scene 2: [detailed visual prompt]",
      "narasi": "Narrator script for scene 2.",
      "dialog_en": "English dialogue for scene 2.",
      "dialog_id": "Indonesian dialogue for scene 2."
    },
    // ... up to 8 scenes
  ]
}`;

  const response = await callGeminiAPI(prompt, keyImage, apiSettings);
  return JSON.parse(response);
}