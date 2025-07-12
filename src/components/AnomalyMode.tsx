import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  generateAnomalyCharacters,
  generateAnomalyStory,
  generateAnomalyScenePrompt
} from '../utils/api';
import { AnomalyScenePrompt } from '../types';

const AnomalyMode = () => {
  const [userIdea, setUserIdea] = useState('');
  const [languageOptions, setLanguageOptions] = useState({
    bahasa: 'Indonesia',
    aksen: 'Jaksel'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [generatedPrompts, setGeneratedPrompts] = useState<AnomalyScenePrompt[]>([]);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setIsLoading(true);
    setLoadingMessage("Mempersiapkan mesin anomali...");
    setGeneratedPrompts([]);
    setError('');
    try {
      setLoadingMessage('Menciptakan karakter anomali...');
      const characters = await generateAnomalyCharacters(userIdea);

      setLoadingMessage('Merancang alur cerita & judul...');
      const story = await generateAnomalyStory(characters);

      for (let i = 0; i < story.sinopsis_per_adegan.length; i++) {
        setLoadingMessage(`Merangkai sinematografi & dialog untuk Adegan ${i + 1} dari ${story.sinopsis_per_adegan.length}...`);
        const prompt: AnomalyScenePrompt = await generateAnomalyScenePrompt(

          story,
          characters,
          i + 1,
          story.sinopsis_per_adegan.length,
          languageOptions
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

      <div className="grid grid-cols-2 gap-4 mb-6">
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
            <option value="Jaksel">Jakarta Selatan</option>
            <option value="Betawi">Betawi</option>
            <option value="Sunda">Sunda</option>
          </select>
        </div>
      </div>

      <button
        className={`px-4 py-2 rounded text-white ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        onClick={handleGenerate}
        disabled={isLoading}
      >
        {isLoading ? 'Memproses...' : 'Generate Anomaly Film'}
      </button>

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
            <button
              className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => {
                const finalPrompt = `${prompt.visual_prompt}\n\n${prompt.audio_prompt}\n\n${prompt.dialog_en}`;
                navigator.clipboard.writeText(finalPrompt)
                  .then(() => alert('Prompt telah disalin untuk Veo!'))
                  .catch(() => alert('Gagal menyalin prompt.'));
              }}
            >
              Salin Prompt untuk Veo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnomalyMode;
