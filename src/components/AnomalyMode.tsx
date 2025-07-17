import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  generateAnomalyCharacters,
  generateAnomalyStory,
  generateAnomalyScenePrompt,
  generateTwistedStoryIdea
} from '../utils/api-fixed';
import { getSettings } from '../utils/database';
import { fetchBrainPrompt, getAvailableBrainStyles } from '../utils/storage';
import { AnomalyScenePrompt, APISettings } from '../types';

const AnomalyMode = () => {
  const [userIdea, setUserIdea] = useState('');
  const [karakterInput, setKarakterInput] = useState('');
  const [situasiInput, setSituasiInput] = useState('');
  const [elemenAnehInput, setElemenAnehInput] = useState('');
  const [languageOptions, setLanguageOptions] = useState({
    bahasa: 'Indonesia',
    aksen: 'Betawi'
  });
  const [selectedStyle, setSelectedStyle] = useState('larva_tuba');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [generatedPrompts, setGeneratedPrompts] = useState<AnomalyScenePrompt[]>([]);
  const [error, setError] = useState('');
  const [apiSettings, setApiSettings] = useState<APISettings | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');

  useEffect(() => {
    loadApiSettings();
  }, []);

  const loadApiSettings = async () => {
    try {
      const settings = await getSettings();
      setApiSettings(settings);
    } catch (error) {
      console.error('Failed to load API settings:', error);
    }
  };

  const handleGenerateIdea = async () => {
    if (!apiSettings || !apiSettings.isActive) {
      setError('Please configure and validate your API key in the API Settings first.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Membuat ide cerita...");
    try {
      const inputs = {
        karakter: karakterInput,
        situasi: situasiInput,
        elemenAneh: elemenAnehInput
      };
      const hasil = await generateTwistedStoryIdea(inputs);
      setUserIdea(hasil);
    } catch (err) {
      console.error("Gagal membuat ide cerita:", err);
      setError("Gagal membuat ide cerita. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleCopyForVeo = (sceneData: AnomalyScenePrompt) => {
    // Ambil dialog bahasa Indonesia dari data
    const rawDialog = sceneData.dialog_id_gaul || '';

    // Hapus header seperti "DIALOGUE (Language...)" jika ada
    let cleanedDialog = rawDialog.replace(/DIALOGUE \(.*\)\s*/, '');

    // Format ulang menjadi format skenario
    // Ganti ": " dengan baris baru untuk dialog
    cleanedDialog = cleanedDialog.replace(/:\s\(/g, '\n('); // Parenthetical
    cleanedDialog = cleanedDialog.replace(/:\s/g, '\n'); // Dialog

    // Susun prompt final
    const finalPrompt = `
${sceneData.visual_prompt}

${sceneData.audio_prompt}

${cleanedDialog.trim()}
    `;

    navigator.clipboard.writeText(finalPrompt.trim());
    alert('Prompt dengan format skenario profesional berhasil disalin!');
  };

  const handleGenerate = async () => {
    if (!apiSettings || !apiSettings.isActive) {
      setError('Please configure and validate your API key in the API Settings first.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Mempersiapkan mesin anomali...");
    setGeneratedPrompts([]);
    setError('');
    try {
      // 1. Fetch brain prompt at the beginning
      setLoadingMessage('Mengambil referensi gaya visual dari Brain Prompt...');
      const referencePrompt = await fetchBrainPrompt(selectedStyle);

      setLoadingMessage('Menciptakan karakter anomali...');
      const characters = await generateAnomalyCharacters(userIdea, apiSettings);

      setLoadingMessage('Merancang alur cerita & judul...');
      const story = await generateAnomalyStory(characters, userIdea, apiSettings);

      for (let i = 0; i < story.sinopsis_per_adegan.length; i++) {
        setLoadingMessage(`Merangkai sinematografi & dialog untuk Adegan ${i + 1} dari ${story.sinopsis_per_adegan.length}...`);
        // 2. Pass referencePrompt to the main API function
        const prompt: AnomalyScenePrompt = await generateAnomalyScenePrompt(
          story,
          characters,
          i + 1,
          story.sinopsis_per_adegan.length,
          languageOptions,
          referencePrompt,
          selectedStyle,
          aspectRatio,
          apiSettings
        );

        setGeneratedPrompts(prev => [...prev, prompt]);
      }
    } catch (err) {
      console.error("Gagal menghasilkan film anomali:", err);
      if (err instanceof Error) {
        // Jika error berasal dari API (misal, API key salah atau network error)
        setError(`Terjadi kesalahan pada API: ${err.message}. Pastikan API key Anda valid dan coba lagi.`);
      } else {
        // Untuk error lainnya yang mungkin terjadi
        setError("Terjadi kesalahan yang tidak diketahui. Silakan cek konsol untuk detail.");
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Helmet>
        <title>Anomaly Brainroot Mode - AI Video Creator</title>
        <meta name="description" content="Hasilkan film pendek surealis dan out-of-the-box dengan mesin AI Anomaly Brainroot. Ciptakan karakter dan cerita yang belum pernah ada." />
      </Helmet>
      <h2 className="text-2xl font-bold mb-4">Anomaly Brainroot Mode</h2>
      <p className="mb-6">Fitur ini sedang dalam pengembangan.</p>

      <fieldset className="mb-6 p-4 border rounded">
        <legend className="px-2 font-bold">Generator Ide Cerita (Opsional)</legend>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block mb-2 font-medium">Karakter / Profesi Utama:</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={karakterInput}
              onChange={(e) => setKarakterInput(e.target.value)}
              placeholder="Contoh: Dokter gila, Penari robot"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Situasi / Genre:</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={situasiInput}
              onChange={(e) => setSituasiInput(e.target.value)}
              placeholder="Contoh: Di rumah sakit jiwa, Film noir"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Elemen Aneh / 'Twist':</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={elemenAnehInput}
              onChange={(e) => setElemenAnehInput(e.target.value)}
              placeholder="Contoh: Semua pasien adalah alien"
            />
          </div>
        </div>

        <button
          className={`px-4 py-2 rounded text-white ${isLoading || !apiSettings?.isActive ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}
          onClick={handleGenerateIdea}
          disabled={isLoading || !apiSettings?.isActive}
        >
          {isLoading ? 'Memproses...' : 'Generate Ide Cerita'}
        </button>
      </fieldset>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Ide Dasar Film:</label>
        <textarea
          className="w-full p-2 border rounded"
          value={userIdea}
          onChange={(e) => setUserIdea(e.target.value)}
          rows={4}
          placeholder="Masukkan ide dasar film surealis Anda..."
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block mb-2 font-medium">Bahasa:</label>
          <select
            className="w-full p-2 border rounded"
            value={languageOptions.bahasa}
            onChange={(e) => setLanguageOptions(prev => ({
              ...prev,
              bahasa: e.target.value
            }))}
          >
            <option value="Indonesia">Indonesia</option>
            <option value="Inggris">Inggris</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 font-medium">Aksen:</label>
          <select
            className="w-full p-2 border rounded"
            value={languageOptions.aksen}
            onChange={(e) => setLanguageOptions(prev => ({
              ...prev,
              aksen: e.target.value
            }))}
          >
            <option value="Betawi">Betawi</option>
            <option value="Jawa">Jawa</option>
            <option value="Sunda">Sunda</option>
            <option value="US">United States</option>
            <option value="British">British</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 font-medium">🧠 Gaya Visual (Brain Prompt):</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
          >
            {getAvailableBrainStyles().map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div>
          <label className="block mb-2 font-medium">Aspect Ratio:</label>
          <select
            className="w-full p-2 border rounded"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
          >
            <option value="16:9">16:9 (Landscape/YouTube)</option>
            <option value="9:16">9:16 (Portrait/TikTok)</option>
          </select>
        </div>
        <button
          className={`px-4 py-2 rounded text-white ${isLoading || !apiSettings?.isActive ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          onClick={handleGenerate}
          disabled={isLoading || !apiSettings?.isActive}
        >
          {isLoading ? 'Memproses...' : 'Generate Anomaly Film'}
        </button>
      </div>

      {loadingMessage && (
        <div className="mt-4 p-2 bg-blue-100 text-blue-800 rounded">
          {loadingMessage}
        </div>
      )}

      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {generatedPrompts.map((prompt, index) => (
          <div key={index} className="border rounded p-4">
            <h3 className="font-bold mb-2">SCENE {index + 1}</h3>
            <div className="mb-2">
              <strong>Naskah Narator:</strong>
              <p>{prompt.narasi}</p>
            </div>
            <div className="mb-2">
              <strong>Dialog Bahasa Indonesia (Gaul):</strong>
              <p>{prompt.dialog_id_gaul}</p>
            </div>
            <div className="mb-2">
              <strong>Dialog Bahasa Inggris:</strong>
              <p>{prompt.dialog_en}</p>
            </div>
            <div className="mb-2">
              <strong>Prompt Visual:</strong>
              <textarea
                className="w-full p-2 bg-gray-50 rounded"
                value={prompt.visual_prompt}
                readOnly
                rows={4}
              />
            </div>
            <div className="mb-2">
              <strong>Prompt Audio:</strong>
              <textarea
                className="w-full p-2 bg-gray-50 rounded"
                value={prompt.audio_prompt}
                readOnly
                rows={4}
              />
            </div>
            {/* NEW: Veo3 Optimized Prompt Section */}
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400">
              <strong className="text-green-800">🎯 Prompt Veo3 yang Dioptimalkan (GUNAKAN INI!):</strong>
              <textarea
                className="w-full p-2 bg-white border rounded mt-2"
                value={prompt.veo3_optimized_prompt}
                readOnly
                rows={6}
              />
              <div className="mt-2 flex gap-2">
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => handleCopyForVeo(prompt)}
                >
                  📋 Salin Prompt Veo3 Optimized
                </button>
                <span className="text-sm text-green-700 self-center">
                  ← Gunakan prompt ini untuk hasil bahasa Indonesia yang konsisten
                </span>
              </div>
            </div>

            {/* OLD: Legacy prompt copy button */}
            <button
              className="mt-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => {
                const finalPrompt = `${prompt.visual_prompt}\n\n${prompt.audio_prompt}\n\n${prompt.dialog_en}`;
                navigator.clipboard.writeText(finalPrompt)
                  .then(() => alert('Prompt lama telah disalin (tidak direkomendasikan)'))
                  .catch(() => alert('Gagal menyalin prompt.'));
              }}
            >
              Salin Prompt Lama (Tidak Direkomendasikan)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AnomalyMode;
