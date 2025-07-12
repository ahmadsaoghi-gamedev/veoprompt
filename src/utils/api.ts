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
): Promise<{
  visual_prompt: string;
  audio_prompt: string;
  dialog_en: string;
  dialog_id_gaul: string;
  narasi: string;
}> {
  const prompt = `**PERINTAH SISTEM (SANGAT PENTING):**
Anda adalah seorang penulis naskah skenario profesional untuk film animasi surealis. Tugas Anda adalah menulis satu adegan penuh dalam format standar industri untuk scene ${sceneNumber} dari ${totalScenes}. Hasilkan satu string tunggal yang berisi semua elemen di bawah ini.

**KONTEKS CERITA:**
- Judul: ${storyContext.judul}
- Karakter:
  - ${characters.karakter_1.nama}: ${characters.karakter_1.deskripsi_fisik}
  - ${characters.karakter_2.nama}: ${characters.karakter_2.deskripsi_fisik}
- Tujuan Adegan: ${storyContext.sinopsis_per_adegan[sceneNumber - 1]}

**STRUKTUR OUTPUT YANG WAJIB DIIKUTI:**

**1. SCENE HEADING:**
- Mulai dengan INT. (untuk interior) atau EXT. (untuk eksterior).
- Diikuti dengan LOKASI.
- Diakhiri dengan WAKTU (DAY, NIGHT, DUSK, DAWN).
- Contoh: INT. DAPUR KUMUH - NIGHT.

**2. ACTION BLOCK:**
- Ini adalah paragraf utama setelah Scene Heading.
- Deskripsikan semua elemen visual dalam satu paragraf yang mengalir: gaya visual (3D Anomaly Brainroot, surealis), sinematografi (pergerakan kamera, sudut, pencahayaan, warna), setting, dan aksi karakter.
- **PENTING:** Saat menyebutkan nama karakter untuk pertama kali, tulis dalam HURUF KAPITAL.

**3. BACKGROUND AUDIO BLOCK:**
- Setelah blok aksi, mulai baris baru.
- Deskripsikan musik latar dan efek suara yang diperlukan untuk membangun suasana.

**4. DIALOGUE BLOCK:**
- Ini adalah bagian terakhir. Gunakan format standar dialog skenario:
- NAMA KARAKTER (DALAM HURUF KAPITAL)
- (Parenthetical: deskripsi nada atau aksi kecil, seperti 'menghela napas' atau 'berbisik')
- Teks Dialog.

**ATURAN DURASI PENTING:**
Total durasi video per adegan HANYA 8 DETIK. Dialog HARUS singkat dan padat, maksimal 10-15 kata total untuk semua karakter.

**FORMAT OUTPUT JSON:**
Kembalikan HANYA objek JSON dengan kunci berikut:
- "visual_prompt": Skenario lengkap dalam format standar industri (Scene Heading + Action Block)
- "audio_prompt": Background Audio Block
- "dialog_en": Dialogue Block dalam bahasa Inggris
- "dialog_id_gaul": Dialogue Block dalam bahasa Indonesia gaul dengan aksen ${languageOptions.aksen}
- "narasi": Narasi deskriptif 1-2 kalimat dalam bahasa Indonesia yang mengalir

**CONTOH FORMAT YANG HARUS DIIKUTI:**
visual_prompt: "INT. DAPUR REMANG-REMANG - NIGHT. Sebuah adegan surealis di dapur yang remang. Gaya utama: 3D Anomaly Brainroot. ARI, penanak nasi penyok dengan mata googly, duduk di meja. Asap berbentuk tanda tanya keluar dari ventilasinya. SPIKE, spons kuning compang-camping dengan ekspresi sinis, tergeletak di wastafel. Kamera berputar perlahan mengelilingi ARI dari sudut rendah. Pencahayaan hangat dan menyebar dengan bayangan yang pekat."

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
  languageOptions: LanguageOptions, // Added new argument
  apiSettings?: APISettings
): Promise<{video_prompts: {scenePrompt: string; narasi: string; dialog_en: string; dialog_id: string;}[]}> { // Updated return type
  const prompt = `**PERINTAH SISTEM (SANGAT PENTING):**
Anda adalah seorang penulis naskah skenario profesional untuk film animasi surealis. Tugas Anda adalah menulis 8 adegan penuh dalam format standar industri berdasarkan ide "${userIdea}" dan gambar kunci yang diberikan. Hasilkan serangkaian adegan yang mengikuti struktur skenario profesional.

**KONTEKS:**
- Ide Pengguna: ${userIdea}
- Gambar kunci menentukan gaya visual yang HARUS dipertahankan di semua adegan
- Bahasa Indonesia: ${languageOptions.bahasa}
- Aksen: ${languageOptions.aksen}

**STRUKTUR OUTPUT YANG WAJIB DIIKUTI UNTUK SETIAP ADEGAN:**

**1. SCENE HEADING:**
- Mulai dengan INT. (untuk interior) atau EXT. (untuk eksterior)
- Diikuti dengan LOKASI
- Diakhiri dengan WAKTU (DAY, NIGHT, DUSK, DAWN)
- Contoh: INT. DAPUR KUMUH - NIGHT

**2. ACTION BLOCK:**
- Paragraf utama setelah Scene Heading
- Deskripsikan semua elemen visual dalam satu paragraf yang mengalir: gaya visual (sesuai gambar kunci), sinematografi (pergerakan kamera, sudut, pencahayaan, warna), setting, dan aksi karakter
- **PENTING:** Saat menyebutkan nama karakter untuk pertama kali, tulis dalam HURUF KAPITAL

**3. BACKGROUND AUDIO BLOCK:**
- Setelah blok aksi, mulai baris baru
- Deskripsikan musik latar dan efek suara yang diperlukan untuk membangun suasana

**4. DIALOGUE BLOCK:**
- Bagian terakhir. Gunakan format standar dialog skenario:
- NAMA KARAKTER (DALAM HURUF KAPITAL)
- (Parenthetical: deskripsi nada atau aksi kecil)
- Teks Dialog

**PERSYARATAN PENTING:**
1. Desain karakter, gaya visual, dan pencahayaan dari gambar kunci HARUS dipertahankan di semua adegan untuk konsistensi visual
2. Adegan harus mengalir logis dari satu ke yang berikutnya untuk membentuk narasi yang koheren
3. Setiap skrip narator harus ringkas (1-2 kalimat) dan memberikan konteks emosional
4. Dialog HARUS singkat dan padat untuk durasi 8 detik per adegan

**CONTOH FORMAT YANG HARUS DIIKUTI:**
scenePrompt: "INT. DAPUR REMANG-REMANG - NIGHT. Sebuah adegan surealis di dapur yang remang. Gaya sesuai gambar kunci. ARI, penanak nasi penyok dengan mata googly, duduk di meja. Asap berbentuk tanda tanya keluar dari ventilasinya. SPIKE, spons kuning compang-camping dengan ekspresi sinis, tergeletak di wastafel. Kamera berputar perlahan mengelilingi ARI dari sudut rendah. Pencahayaan hangat dan menyebar dengan bayangan yang pekat.

Musik latar: Melodi piano yang melankolis dan sedikit terdistorsi. Efek suara: Desis uap yang lembut, dengungan kulkas yang pelan.

ARI
(Menghela napas panjang)
Beneran deh, nasi tuh, emang... nyata?

SPIKE
(Meneteskan air)
Udah ah, masak aja, panci butut."

**FORMAT OUTPUT JSON:**
Kembalikan HANYA objek JSON dengan format berikut:
{
  "video_prompts": [
    {
      "scenePrompt": "Scene 1: [skenario lengkap format standar industri]",
      "narasi": "Narasi deskriptif 1-2 kalimat dalam bahasa Indonesia",
      "dialog_en": "Dialog dalam bahasa Inggris",
      "dialog_id": "Dialog dalam bahasa Indonesia gaul dengan aksen ${languageOptions.aksen}"
    },
    // ... hingga 8 adegan
  ]
}

Kembalikan HANYA objek JSON, tanpa teks tambahan. Pastikan format JSON valid.`;

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
