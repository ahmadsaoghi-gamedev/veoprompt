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

export async function generateAnomalyCharacters(apiSettings?: APISettings): Promise<{
  karakter_1: { nama: string; deskripsi_fisik: string };
  karakter_2: { nama: string; deskripsi_fisik: string };
}> {
  const prompt = `Create 2 surreal characters by combining random concepts. 
    Return ONLY a JSON object in this exact format, with no additional text:
    {"karakter_1": {"nama": "...", "deskripsi_fisik": "..."}, 
     "karakter_2": {"nama": "...", "deskripsi_fisik": "..."}}`;

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

Return ONLY the final image prompt text with no additional commentary or formatting.`;

  return await callGeminiAPI(prompt, undefined, apiSettings);
}

export async function generateAnomalyScenePrompt(
  storyContext: StoryContext,
  characters: { karakter_1: AnomalyCharacter; karakter_2: AnomalyCharacter },
  sceneNumber: number,
  totalScenes: number,
  languageOptions: LanguageOptions,
  apiSettings?: APISettings
): Promise<string> {
  const prompt = `**PROMPT UNTUK ADEGAN ${sceneNumber}/${totalScenes}**

**KONTEKS CERITA:**
* **Judul:** ${storyContext.judul}
* **Karakter & Deskripsi:**
  - ${characters.karakter_1.nama}: ${characters.karakter_1.deskripsi_fisik}
  - ${characters.karakter_2.nama}: ${characters.karakter_2.deskripsi_fisik}
* **Tujuan Adegan Ini:** ${storyContext.sinopsis_per_adegan[sceneNumber - 1]}

**PROMPT VISUAL (SANGAT DETAIL):**
* **Gaya Utama:** 3D Anomaly Brainroot, surealis, fotorealistik dengan bentuk karakter yang absurd.
* **Perintah untuk AI Sutradara:** "Berdasarkan tujuan adegan, tentukan dan deskripsikan secara spesifik pilihan sinematografi berikut untuk menciptakan nuansa yang aneh dan tidak terduga:"
    * **Camera Movement:** (Contoh: 'slow, creeping dolly-in', 'handheld-style camera shake')
    * **Camera Angle:** (Contoh: 'extreme low-angle shot', 'Dutch angle (kamera miring)')
    * **Lighting:** (Contoh: 'Pencahayaan dari lampu neon yang berkedip', 'cahaya remang dari kulkas yang terbuka')
    * **Color Grading:** (Contoh: 'Warna hijau dan magenta yang oversaturated', 'palet warna monokrom dengan satu warna cerah yang menonjol')
* **Setting:** [Deskripsikan lokasi yang relevan dengan cerita]
* **Aksi Karakter:** [Deskripsikan gerakan dan ekspresi karakter sesuai tujuan adegan].

**PROMPT AUDIO & DIALOG:**
* **Perintah Dialog:** "Dialog HARUS menggunakan Bahasa ${languageOptions.bahasa} dengan aksen ${languageOptions.aksen}. WAJIB gunakan gaya bicara dan kosakata khas karakter yang sudah ditentukan. JANGAN GUNAKAN BAHASA FORMAL."
* **Dialog:** [Minta AI untuk menghasilkan 2-3 baris dialog antara karakter yang sesuai dengan tujuan adegan]
* **Musik & Efek Suara:** [Minta AI untuk menyarankan musik latar dan efek suara yang aneh dan tidak cocok untuk menambah kesan surealis]

**KAITAN KE ADEGAN SELANJUTNYA:**
* [Minta AI untuk mendeskripsikan satu aksi atau visual di akhir adegan ini yang akan menjadi jembatan ke adegan berikutnya].`;

  return await callGeminiAPI(prompt, undefined, apiSettings);
}
