import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { generateKeyImagePrompt, generateVideoPromptsFromImage } from '../utils/api-fixed';
import { getSettings } from '../utils/database';
import { APISettings, VideoPromptWithOptimization } from '../types';

// Cache for storing loaded brain prompts to avoid repeated file reads
const brainPromptCache = new Map<string, string[]>();

const ConceptVizMode: React.FC = () => {
  const [userIdea, setUserIdea] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('pixar');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingBrainPrompt, setIsFetchingBrainPrompt] = useState(false);
  const [generatedImagePrompt, setGeneratedImagePrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');
  const [videoPrompts, setVideoPrompts] = useState<VideoPromptWithOptimization[]>([]);
  const [error, setError] = useState<string>('');
  const [brainPromptError, setBrainPromptError] = useState<string>('');
  const [apiSettings, setApiSettings] = useState<APISettings | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
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

  const fetchBrainPrompt = async (style: string): Promise<string> => {
    // Clear any previous brain prompt errors
    setBrainPromptError('');
    setIsFetchingBrainPrompt(true);

    try {
      // Check cache first
      if (brainPromptCache.has(style)) {
        const cachedPrompts = brainPromptCache.get(style)!;
        const randomPrompt = cachedPrompts[Math.floor(Math.random() * cachedPrompts.length)];
        console.log(`🧠 Using cached brain prompt for style: ${style}`);
        return randomPrompt;
      }

      let filePath = '';

      // Map styles to corresponding file paths
      switch (style) {
        case 'pixar':
          filePath = '/brain/style_pixar.txt';
          break;
        case 'lionking':
          filePath = '/brain/style_lionking_realistic.txt';
          break;
        case 'coraline':
          filePath = '/brain/style_coraline_animation.txt';
          break;
        case 'dragonquest':
          filePath = '/brain/style_dragon_quest_animation.txt';
          break;
        case 'illumination':
          filePath = '/brain/style_illumination.txt';
          break;
        case 'japanese3d':
          filePath = '/brain/style_japanese_3D_Anime.txt';
          break;
        case 'larva':
          filePath = '/brain/style_larva_tuba_animation.txt';
          break;
        case 'lovedeath':
          filePath = '/brain/style_Love_Death_Robots_animation.txt';
          break;
        case 'lovecraftian':
          filePath = '/brain/style_lovecraftian_horror.txt';
          break;
        case 'standbyme':
          filePath = '/brain/style_stand_by_me_doraemon_animation.txt';
          break;
        case 'lordoftherings':
          filePath = '/brain/style_the_lord_of_the_ring_3danimation.txt';
          break;
        case 'vfx3d':
          filePath = '/brain/style_vfx_3d_animation.txt';
          break;
        case 'videoclip':
          filePath = '/brain/style_videoclip_song.txt';
          break;
        case 'effectshader':
          filePath = '/brain/style_effect_shader_animation.txt';
          break;
        default:
          console.warn(`⚠️ Unknown style: ${style}`);
          return '';
      }

      if (filePath) {
        console.log(`🧠 Fetching brain prompt from: ${filePath}`);

        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();

        if (!text.trim()) {
          throw new Error('File is empty');
        }

        // Split by '---' and filter out empty strings, then clean each prompt
        const prompts = text
          .split('---')
          .map(prompt => prompt.trim())
          .filter(prompt => prompt.length > 0);

        if (prompts.length === 0) {
          throw new Error('No valid prompts found in file');
        }

        // Cache the prompts for future use
        brainPromptCache.set(style, prompts);
        console.log(`✅ Successfully loaded ${prompts.length} prompts for style: ${style}`);

        // Return a random prompt
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        return randomPrompt;
      }

      return '';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`❌ Error fetching brain prompt for style "${style}":`, errorMessage);
      setBrainPromptError(`Gagal memuat referensi gaya ${style}: ${errorMessage}`);
      return '';
    } finally {
      setIsFetchingBrainPrompt(false);
    }
  };

  const handleGenerate = async (aspectRatio: string) => {
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
      const referencePrompt = await fetchBrainPrompt(selectedStyle);
      // Combine user idea with reference prompt and aspect ratio
      const enhancedIdea = referencePrompt
        ? `${userIdea}\n\nStyle Reference: ${referencePrompt}\n\nAspect Ratio: ${aspectRatio}`
        : `${userIdea}\n\nAspect Ratio: ${aspectRatio}`;
      const prompt = await generateKeyImagePrompt(enhancedIdea, apiSettings);
      setGeneratedImagePrompt(prompt);
    } catch (err) {
      setError('Gagal menghasilkan prompt. Silakan coba lagi.');
      console.error('Error generating prompt:', err);
    } finally {
      setIsLoading(false);
    }
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

  const handleGenerateVideoPrompts = async (aspectRatio: string) => {
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
      const languageOptions = { Language: 'Indonesia Gaul', Accent: '' };
      const enhancedIdea = `${userIdea}\n\nAspect Ratio: ${aspectRatio}`;
      const result = await generateVideoPromptsFromImage(enhancedIdea, uploadedImage, languageOptions, apiSettings);
      setVideoPrompts(result.video_prompts);
    } catch (err) {
      setError('Gagal menghasilkan prompt video. Silakan coba lagi.');
      console.error('Error generating video prompts:', err);
    } finally {
      setIsLoading(false);
    }
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Prompt telah disalin!'))
      .catch(() => alert('Gagal menyalin prompt.'));
  };

  const handleCopyForVeo = (sceneData: VideoPromptWithOptimization) => {
    // Get the raw dialog from the data - use English dialog for this mode
    const rawDialog = sceneData.dialog_en || '';

    // **New Logic for Formatting Dialog**
    // Change the format [Character: (Action) "Speech"] to the standard scenario format
    const formattedDialog = rawDialog
      .replace(/\[/g, '') // Remove the opening bracket
      .replace(/\]\s*/g, '\n\n') // Replace the closing bracket with two newlines
      .replace(/:\s\(/g, '\n(') // Move the parenthetical to a new line
      .replace(/\),\s/g, ')\n'); // Move the speech to a new line

    // Compose the final prompt
    const finalPrompt = `
${sceneData.scenePrompt}

${formattedDialog.trim()}
    `;

    navigator.clipboard.writeText(finalPrompt.trim());
    alert('Professional scenario format prompt successfully copied!');
  };

  return (
    <div className="concept-viz-mode p-6 max-w-4xl mx-auto">
      <Helmet>
        <title>Visualisasi Konsep: Animasi 3D AI & Prompt Generator - Shabira Prompt Lab</title>
        <meta name="description" content="Cara buat film dengan AI menggunakan visualisasi konsep. Ubah ide menjadi animasi 3D AI dengan prompt generator canggih untuk hasil video berkualitas tinggi." />
        <meta name="keywords" content="animasi 3D AI, prompt generator, cara buat film dengan AI, AI video generator, visualisasi konsep, image to video" />
      </Helmet>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Concept Visualization: How to Make a Film with AI and Animation 3D AI Generator</h2>

      <div className="mb-6">
        <label htmlFor="style-select" className="block mb-2 font-medium text-gray-700">Choose a visual force</label>
        <select
          id="style-select"
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
        >
          <option value="pixar">Pixar</option>
          <option value="lionking">Lion King</option>
          <option value="coraline">Coraline</option>
          <option value="dragonquest">Dragon Quest</option>
          <option value="illumination">Illumination</option>
          <option value="japanese3d">Japanese 3D Anime</option>
          <option value="larva">Larva Tuba Animation</option>
          <option value="lovedeath">Love Death Robots Animation</option>
          <option value="lovecraftian">Lovecraftian Horror</option>
          <option value="standbyme">Stand By Me Doraemon Animation</option>
          <option value="lordoftherings">Lord of the Rings 3D Animation</option>
          <option value="vfx3d">VFX 3D Animation</option>
          <option value="videoclip">Videoclip Song</option>
          <option value="effectshader">Effect Shader Animation</option>
        </select>

        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={5}
          placeholder="Tulis ide cerita aneh Anda di sini..."
          value={userIdea}
          onChange={(e) => setUserIdea(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div>
          <label className="block mb-2 font-medium text-gray-700">Aspect Ratio:</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
          >
            <option value="16:9">16:9 (Landscape/YouTube)</option>
            <option value="9:16">9:16 (Portrait/TikTok)</option>
          </select>
        </div>
        <button
          onClick={() => handleGenerate(aspectRatio)}
          disabled={isLoading || !apiSettings?.isActive}
          className={`px-6 py-3 rounded-lg font-medium ${isLoading || !apiSettings?.isActive
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          {isLoading ? 'Memproses...' : 'Buat Prompt Animasi Pixar Style'}
        </button>
      </div>


      {isFetchingBrainPrompt && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <p className="text-purple-700">🧠 Memuat referensi gaya {selectedStyle}...</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-700">AI sedang merancang prompt gambar...</p>
        </div>
      )}

      {brainPromptError && (
        <div className="mt-6 p-4 bg-orange-50 rounded-lg">
          <p className="text-orange-600">⚠️ {brainPromptError}</p>
          <p className="text-orange-500 text-sm mt-1">Prompt akan dibuat tanpa referensi gaya khusus.</p>
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
            onClick={() => copyToClipboard(generatedImagePrompt)}
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

          <div className="flex items-center gap-4 mb-6">
            <div>
              <label className="block mb-2 font-medium text-gray-700">Aspect Ratio:</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
              >
                <option value="16:9">16:9 (Landscape/YouTube)</option>
                <option value="9:16">9:16 (Portrait/TikTok)</option>
              </select>
            </div>
            <button
              onClick={() => handleGenerateVideoPrompts(aspectRatio)}
              disabled={isLoading || !uploadedImage || !apiSettings?.isActive}
              className={`px-6 py-3 rounded-lg font-medium ${isLoading || !uploadedImage || !apiSettings?.isActive
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
            >
              {isLoading ? 'Memproses...' : 'Buat Prompt Video Sinematik untuk TikTok'}
            </button>
          </div>


          {videoPrompts.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2 text-gray-800">Rangkaian Prompt Video:</h4>
              <ol className="list-decimal pl-6 space-y-2">
                {videoPrompts.map((prompt, index) => (
                  <li key={index} className="text-gray-700 mb-6">
                    <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400">
                      <h4 className="font-bold text-green-800 mb-2">🎯Optimized VeO3 Prompt (Use this!):</h4>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                        rows={6}
                        readOnly
                        value={prompt.veo3_optimized_prompt}
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          onClick={() => handleCopyForVeo(prompt)}
                        >
                          📋 Salin Prompt Veo3 Optimized
                        </button>
                        <span className="text-sm text-green-700 self-center">
                          ← Professional scenario format for Veo3
                        </span>
                      </div>
                    </div>

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
