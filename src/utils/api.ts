import { APISettings, AnomalyScenePrompt } from '../types';

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
): Promise<AnomalyScenePrompt> {
  const prompt = `**PERINTAH SISTEM (SANGAT PENTING):**
"Anda adalah seorang penulis naskah skenario profesional. Hasilkan satu objek JSON tunggal yang berisi semua elemen di bawah ini. Ikuti instruksi bahasa untuk setiap kunci dengan SANGAT TELITI."

**KONTEKS CERITA:**
- Judul: ${storyContext.judul}
- Karakter:
  - ${characters.karakter_1.nama}: ${characters.karakter_1.deskripsi_fisik}
  - ${characters.karakter_2.nama}: ${characters.karakter_2.deskripsi_fisik}
- Sinopsis Adegan Ini: ${storyContext.sinopsis_per_adegan[sceneNumber - 1]}
- Adegan ${sceneNumber} dari ${totalScenes}.
- Durasi adegan: 8 detik. Dialog harus sangat singkat.

**STRUKTUR OUTPUT JSON YANG WAJIB DIIKUTI:**

1.  **\`visual_prompt\` (String):**
    * **Instruksi Bahasa:** TULIS BAGIAN INI HANYA DALAM BAHASA INGGRIS.
    * **Konten:** Deskripsikan semua elemen visual: gaya seni (Anomaly Brainroot, surealis), sinematografi (pergerakan, sudut, pencahayaan, warna), setting, dan aksi karakter dalam satu paragraf yang mengalir. Gunakan format penulisan skenario profesional.

2.  **\`audio_prompt\` (String):**
    * **Instruksi Bahasa:** TULIS BAGIAN INI HANYA DALAM BAHASA INGGRIS.
    * **Konten:** Deskripsikan musik latar dan efek suara yang diperlukan untuk membangun suasana.

3.  **\`dialog_en\` (String):**
    * **Instruksi Bahasa:** TULIS BAGIAN INI HANYA DALAM BAHASA INGGRIS.
    * **Konten:** Hasilkan dialog dalam format skenario, lengkap dengan nama karakter (huruf kapital) dan deskripsi nada (parenthetical).

4.  **\`dialog_id_gaul\` (String):**
    * **Instruksi Bahasa:** TULIS BAGIAN INI HANYA DALAM BAHASA INDONESIA GAUL/NON-FORMAL dengan aksen ${languageOptions.aksen}.
    * **Konten:** Terjemahkan atau tulis ulang dialog dari \`dialog_en\` ke dalam bahasa Indonesia yang sangat santai, tidak kaku, dan sesuai dengan kepribadian karakter. Gunakan format skenario yang sama.

5.  **\`narasi\` (String):**
    * **Instruksi Bahasa:** TULIS BAGIAN INI HANYA DALAM BAHASA INDONESIA.
    * **Konten:** Tulis naskah untuk narator dengan gaya puitis dan santai, seperti seorang pendongeng.

Kembalikan HANYA objek JSON, tanpa teks tambahan. Pastikan format JSON valid.`;

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
  languageOptions: LanguageOptions,
  apiSettings?: APISettings
): Promise<{
  video_prompts: AnomalyScenePrompt[];
}> {
  const prompt = `**PERINTAH SISTEM (SANGAT PENTING):**
"Anda adalah seorang penulis naskah skenario profesional. Hasilkan satu objek JSON tunggal yang berisi array 8 adegan berdasarkan ide '${userIdea}' dan gambar kunci terlampir. Ikuti instruksi bahasa untuk setiap kunci dengan SANGAT TELITI."

**KONTEKS:**
- Ide Pengguna: ${userIdea}
- Gambar kunci menentukan gaya visual yang HARUS dipertahankan di semua 8 adegan.
- Buat cerita pendek yang koheren yang berlangsung selama 8 adegan.
- Durasi setiap adegan: 8 detik. Dialog harus sangat singkat.

**STRUKTUR OUTPUT JSON YANG WAJIB DIIKUTI:**
Hasilnya harus berupa objek JSON tunggal dengan kunci \`video_prompts\`. Kunci ini berisi array dari 8 objek adegan. Setiap objek dalam array HARUS mengikuti struktur ini:

1.  **\`visual_prompt\` (String):**
    * **Instruksi Bahasa:** TULIS BAGIAN INI HANYA DALAM BAHASA INGGRIS.
    * **Konten:** Deskripsikan semua elemen visual: gaya seni (konsisten dengan gambar kunci), sinematografi (pergerakan, sudut, pencahayaan, warna), setting, dan aksi karakter dalam satu paragraf yang mengalir. Gunakan format penulisan skenario profesional.

2.  **\`audio_prompt\` (String):**
    * **Instruksi Bahasa:** TULIS BAGIAN INI HANYA DALAM BAHASA INGGRIS.
    * **Konten:** Deskripsikan musik latar dan efek suara yang diperlukan untuk membangun suasana.

3.  **\`dialog_en\` (String):**
    * **Instruksi Bahasa:** TULIS BAGIAN INI HANYA DALAM BAHASA INGGRIS.
    * **Konten:** Hasilkan dialog dalam format skenario, lengkap dengan nama karakter (huruf kapital) dan deskripsi nada (parenthetical).

4.  **\`dialog_id_gaul\` (String):**
    * **Instruksi Bahasa:** TULIS BAGIAN INI HANYA DALAM BAHASA INDONESIA GAUL/NON-FORMAL dengan aksen ${languageOptions.aksen}.
    * **Konten:** Terjemahkan atau tulis ulang dialog dari \`dialog_en\` ke dalam bahasa Indonesia yang sangat santai, tidak kaku, dan sesuai dengan kepribadian karakter. Gunakan format skenario yang sama.

5.  **\`narasi\` (String):**
    * **Instruksi Bahasa:** TULIS BAGIAN INI HANYA DALAM BAHASA INDONESIA.
    * **Konten:** Tulis naskah untuk narator dengan gaya puitis dan santai, seperti seorang pendongeng.

Kembalikan HANYA objek JSON, tanpa teks tambahan. Pastikan format JSON valid dan berisi array dengan tepat 8 adegan.`;

  const response = await callGeminiAPI(prompt, keyImage, apiSettings);
  return JSON.parse(response);
}

export async function generateTwistedStoryIdea(inputs: { karakter: string; situasi: string; elemenAneh: string; }): Promise<string> {
  const prompt = `Kamu adalah seorang penulis ide film yang sangat kreatif. Ambil tiga elemen ini:
1. Karakter: ${inputs.karakter}
2. Situasi: ${inputs.situasi}
3. Elemen Aneh: ${inputs.elemenAneh}

Gabungkan ketiganya menjadi sebuah premis cerita film pendek yang modern dan surealis dalam satu paragraf singkat. Contoh: 'Versi modern dari dongeng Kancil dan Buaya. Si Kancil adalah CEO startup, sementara para Buaya adalah debt collector.'

Hanya kembalikan satu string premis cerita yang sudah jadi, tanpa teks tambahan.`;

  const response = await callGeminiAPI(prompt);
  return response.trim();
}
