import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { generateKeyImagePrompt, generateVideoPromptsFromImage } from '../utils/api-fixed';
import { getSettings } from '../utils/database';
import { APISettings, VideoPromptWithOptimization } from '../types';

const ConceptVizMode: React.FC = () => {
  const [userIdea, setUserIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImagePrompt, setGeneratedImagePrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');
  const [videoPrompts, setVideoPrompts] = useState<VideoPromptWithOptimization[]>([]);
  const [error, setError] = useState('');
  const [apiSettings, setApiSettings] = useState<APISettings | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleGenerate = async () => {
    if (!userIdea.trim()) {
      setError('Silakan masukkan ide terlebih dahulu');
      return;
    }

    if (!apiSettings || !apiSettings.isActive) {
      setError('Please configure and validate your API key in the API Settings first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedImagePrompt('');

    try {
      const prompt = await generateKeyImagePrompt(userIdea, apiSettings);
      setGeneratedImagePrompt(prompt);
    } catch (err) {
      setError('Gagal menghasilkan prompt. Silakan coba lagi.');
      console.error('Error generating prompt:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedImagePrompt);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateVideoPrompts = async () => {
    if (!userIdea.trim() || !uploadedImage) {
      setError('Silakan masukkan ide dan upload gambar terlebih dahulu');
      return;
    }

    if (!apiSettings || !apiSettings.isActive) {
      setError('Please configure and validate your API key in the API Settings first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setVideoPrompts([]);

    try {
      const languageOptions = { bahasa: 'Indonesia Gaul', aksen: '' }; // Defined languageOptions with aksen
      const result = await generateVideoPromptsFromImage(userIdea, uploadedImage, languageOptions, apiSettings); // Passed languageOptions
      setVideoPrompts(result.video_prompts);
    } catch (err) {
      setError('Gagal menghasilkan prompt video. Silakan coba lagi.');
      console.error('Error generating video prompts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="concept-viz-mode p-6 max-w-4xl mx-auto">
      <Helmet>
        <title>Mode Visualisasi Konsep (Image-to-Video) - Shabira Prompt Lab</title>
        <meta name="description" content="Ubah ide cerita menjadi gambar kunci, lalu gunakan gambar tersebut sebagai fondasi untuk menghasilkan rangkaian prompt video yang konsisten." />
      </Helmet>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Mode Visualisasi Konsep</h2>

      <div className="mb-6">
        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={5}
          placeholder="Tulis ide cerita aneh Anda di sini..."
          value={userIdea}
          onChange={(e) => setUserIdea(e.target.value)}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={isLoading || !apiSettings?.isActive}
        className={`px-6 py-3 rounded-lg font-medium ${isLoading || !apiSettings?.isActive
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
      >
        {isLoading ? 'Memproses...' : 'Generate Prompt Gambar Kunci'}
      </button>

      {isLoading && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-700">AI sedang merancang prompt gambar...</p>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {generatedImagePrompt && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Prompt Gambar Kunci (Siap Digunakan)</h3>
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg mb-4 bg-gray-50"
            rows={8}
            readOnly
            value={generatedImagePrompt}
          />
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 mr-4"
          >
            Salin Prompt
          </button>
        </div>
      )}

      {generatedImagePrompt && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Generate Rangkaian Video Prompt</h3>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 mb-4"
          >
            {uploadedImage ? 'Ganti Gambar' : 'Upload Gambar Kunci'}
          </button>

          {uploadedImage && (
            <div className="mb-4">
              <img
                src={uploadedImage}
                alt="Uploaded preview"
                className="max-h-40 rounded-lg"
              />
            </div>
          )}

          <button
            onClick={handleGenerateVideoPrompts}
            disabled={isLoading || !uploadedImage || !apiSettings?.isActive}
            className={`px-6 py-3 rounded-lg font-medium ${isLoading || !uploadedImage || !apiSettings?.isActive
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
          >
            {isLoading ? 'Memproses...' : 'Generate Rangkaian Video Prompt'}
          </button>

          {videoPrompts.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2 text-gray-800">Rangkaian Prompt Video:</h4>
              <ol className="list-decimal pl-6 space-y-2">
                {videoPrompts.map((prompt, index) => (
                  <li key={index} className="text-gray-700 mb-6">

                    {/* NEW: Veo3 Optimized Prompt Section - PRIORITIZED */}
                    <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400">
                      <h4 className="font-bold text-green-800 mb-2">🎯 Prompt Veo3 yang Dioptimalkan (GUNAKAN INI!):</h4>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                        rows={6}
                        readOnly
                        value={prompt.veo3_optimized_prompt}
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          onClick={() => {
                            navigator.clipboard.writeText(prompt.veo3_optimized_prompt)
                              .then(() => alert('Prompt Veo3 yang dioptimalkan telah disalin!'))
                              .catch(() => alert('Gagal menyalin prompt.'));
                          }}
                        >
                          📋 Salin Prompt Veo3 Optimized
                        </button>
                        <span className="text-sm text-green-700 self-center">
                          ← Gunakan prompt ini untuk hasil bahasa Indonesia yang konsisten
                        </span>
                      </div>
                    </div>

                    {/* Original prompt sections - moved to secondary position */}
                    <details className="mb-4">
                      <summary className="cursor-pointer font-medium text-gray-600 hover:text-gray-800">
                        📋 Lihat Detail Prompt Terpisah (Opsional)
                      </summary>
                      <div className="mt-4 space-y-4">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Prompt Visual:</h5>
                          <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg mb-2 bg-gray-50"
                            rows={4}
                            readOnly
                            value={prompt.scenePrompt}
                          />
                        </div>

                        <div className="p-4 bg-purple-50 border-l-4 border-purple-400">
                          <h5 className="font-bold text-purple-800">Naskah Narator:</h5>
                          <p className="text-gray-700 italic">{prompt.narasi}</p>
                        </div>

                        <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
                          <h5 className="font-bold text-blue-800">Dialog (English):</h5>
                          <p className="text-gray-700">{prompt.dialog_en}</p>
                        </div>

                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                          <h5 className="font-bold text-yellow-800">Dialog (Indonesia Gaul):</h5>
                          <p className="text-gray-700">{prompt.dialog_id}</p>
                        </div>
                      </div>
                    </details>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConceptVizMode;
