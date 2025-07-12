import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Wand2, Copy, Save, Download, Loader, Play } from 'lucide-react';
import { callGeminiAPI, translateText } from '../utils/api';
import { savePrompt, getSettings } from '../utils/database';
import { VideoPrompt, Scene, APISettings } from '../types';

const SatsetMode: React.FC = () => {
  const [mainIdea, setMainIdea] = useState('');
  const [dialogLanguage, setDialogLanguage] = useState('id');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScenes, setGeneratedScenes] = useState<Scene[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<VideoPrompt | null>(null);
  const [apiSettings, setApiSettings] = useState<APISettings | null>(null);

  const languages = [
    { code: 'id', name: 'Indonesian' },
    { code: 'jv', name: 'Javanese' },
    { code: 'su', name: 'Sundanese' },
    { code: 'ms', name: 'Malay' },
    { code: 'en', name: 'English' }
  ];

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

  const generateScenes = async () => {
    if (!mainIdea.trim()) {
      alert('Please enter your main video idea');
      return;
    }

    if (!apiSettings || !apiSettings.isActive) {
      alert('Please configure and validate your API key in the API Settings first.');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Create a complete 7-scene video script based on this main idea: "${mainIdea}"

Generate exactly 7 scenes, each 8 seconds long, that tell a complete story. Each scene should flow naturally to the next.

Return a JSON object with this structure:
{
  "title": "Video Title",
  "mainDescription": "Overall video description",
  "scenes": [
    {
      "sceneNumber": 1,
      "prompt": "Detailed English prompt for scene 1 including visual description, camera work, lighting, and audio",
      "duration": 8,
      "characters": ["character names"],
      "objects": ["object names"]
    },
    // ... continue for all 7 scenes
  ]
}

Make each scene prompt detailed and cinematic, suitable for professional video generation. Include specific camera movements, lighting descriptions, and environmental details.`;

      const result = await callGeminiAPI(prompt, undefined, apiSettings);
      const parsedResult = JSON.parse(result);

      const scenes: Scene[] = parsedResult.scenes.map((scene: { sceneNumber: number; prompt: string; duration: number; characters: string[]; objects: string[] }) => {
        // This is a temporary mapping. The 'prompt' field from the API response
        // will be stored in 'visualDescription' as a workaround.
        // A more robust solution would be to adjust the type definition or the API response.
        return {
          id: `scene_${Date.now()}_${scene.sceneNumber}`,
          sceneNumber: scene.sceneNumber,
          visualDescription: scene.prompt, // Mapping 'prompt' to 'visualDescription'
          location: 'To be defined',
          time: 'To be defined',
          season: 'To be defined',
          weather: 'To be defined',
          cinematography: {
            cameraTechniques: [],
            lighting: 'To be defined',
            colorPalette: 'To be defined',
            additionalVisuals: []
          },
          audio: {
            dialogue: [],
            ambientSounds: [],
            audioMix: 'To be defined'
          },
          duration: scene.duration || 8,
          characters: scene.characters || [],
          objects: scene.objects || []
        };
      });

      const videoPrompt: VideoPrompt = {
        id: `satset_${Date.now()}`,
        title: parsedResult.title,
        type: 'satset',
        mainDescription: parsedResult.mainDescription,
        scenes,
        characters: [],
        objects: [],
        settings: {
          resolution: '1080p',
          frameRate: 24,
          aspectRatio: '16:9',
          duration: 56, // 7 scenes × 8 seconds
          captions: {
            enabled: false,
            accuracy: 'high',
            language: 'match_dialog',
            font: 'Arial',
            position: 'bottom'
          },
          languages: {
            dialog: 'indonesian',
            monolog: 'indonesian'
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setGeneratedScenes(scenes);
      setCurrentPrompt(videoPrompt);
    } catch (error) {
      console.error('Failed to generate scenes:', error);
      alert('Failed to generate scenes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyScenePrompt = async (visualDescription: string) => {
    try {
      // Translate if not English
      let finalPrompt = visualDescription;
      if (dialogLanguage !== 'en' && apiSettings) {
        finalPrompt = await translateText(visualDescription, dialogLanguage);
      }

      await navigator.clipboard.writeText(finalPrompt);
      alert('Scene prompt copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy prompt:', err);
      alert('Failed to copy prompt');
    }
  };

  const copyAllScenes = async () => {
    try {
      let allPrompts = `=== ${currentPrompt?.title} ===\n\n`;
      allPrompts += `Main Description: ${currentPrompt?.mainDescription}\n\n`;
      allPrompts += `=== SCENES ===\n\n`;

      for (const scene of generatedScenes) {
        let scenePrompt = scene.visualDescription;
        if (dialogLanguage !== 'en' && apiSettings) {
          scenePrompt = await translateText(scene.visualDescription, dialogLanguage);
        }
        allPrompts += `--- SCENE ${scene.sceneNumber} ---\n${scenePrompt}\n\n`;
      }

      await navigator.clipboard.writeText(allPrompts);
      alert('All scenes copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy all scenes:', err);
      alert('Failed to copy all scenes');
    }
  };

  const saveToBank = async () => {
    if (!currentPrompt) return;

    try {
      await savePrompt(currentPrompt);
      alert('Scenes saved to Prompt Bank!');
    } catch (error) {
      console.error('Failed to save to bank:', error);
      alert('Failed to save to Prompt Bank');
    }
  };

  const exportScenes = () => {
    if (!currentPrompt) return;

    const exportData = {
      ...currentPrompt,
      exportedAt: new Date().toISOString(),
      language: dialogLanguage
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satset_${currentPrompt.title.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Mode Satset (Generator Adegan Otomatis) - Shabira Prompt Lab</title>
        <meta name="description" content="Hasilkan 7 rangkaian adegan video secara otomatis dari satu ide cerita. Cepat, efisien, dan sempurna untuk konten naratif." />
      </Helmet>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Satset Mode - Auto Scene Generation</h2>
        <p className="text-lg text-gray-600">
          Generate 7 sequential scenes automatically from your main video idea
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Wand2 className="w-6 h-6" />
          Video Concept Input
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Video Idea
            </label>
            <textarea
              value={mainIdea}
              onChange={(e) => setMainIdea(e.target.value)}
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe your main video concept... (e.g., 'A day in the life of a coffee shop owner, showing the morning rush, customer interactions, and closing routine')"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dialog Language
              </label>
              <select
                value={dialogLanguage}
                onChange={(e) => setDialogLanguage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={generateScenes}
                disabled={!mainIdea.trim() || isGenerating || !apiSettings?.isActive}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-200"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Generating 7 Scenes...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate 7 Scenes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {generatedScenes.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Play className="w-6 h-6" />
              Generated Scenes
            </h3>

            <div className="flex gap-3">
              <button
                onClick={copyAllScenes}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy All
              </button>
              <button
                onClick={saveToBank}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save to Bank
              </button>
              <button
                onClick={exportScenes}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {currentPrompt && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2">{currentPrompt.title}</h4>
              <p className="text-blue-700 text-sm">{currentPrompt.mainDescription}</p>
              <div className="mt-2 text-xs text-blue-600">
                Total Duration: {currentPrompt.settings.duration} seconds | Language: {languages.find(l => l.code === dialogLanguage)?.name}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {generatedScenes.map((scene) => (
              <div
                key={scene.id}
                className="bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-md border border-gray-200 overflow-hidden"
              >
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <h4 className="font-bold text-lg">
                    Scene {scene.sceneNumber} ({scene.duration}s)
                  </h4>
                  <button
                    onClick={() => copyScenePrompt(scene.visualDescription)}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Scene
                  </button>
                </div>

                <div className="p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                    {scene.visualDescription}
                  </pre>

                  {(scene.characters.length > 0 || scene.objects.length > 0) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex gap-6 text-xs text-gray-600">
                        {scene.characters.length > 0 && (
                          <div>
                            <span className="font-medium">Characters:</span> {scene.characters.join(', ')}
                          </div>
                        )}
                        {scene.objects.length > 0 && (
                          <div>
                            <span className="font-medium">Objects:</span> {scene.objects.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h4 className="font-bold text-yellow-800 mb-2">🎬 Satset Mode Features</h4>
        <ul className="text-yellow-700 space-y-1 text-sm">
          <li>• Automatically generates 7 sequential scenes (8 seconds each)</li>
          <li>• Creates a complete narrative flow from your main idea</li>
          <li>• Supports multiple dialog languages for localization</li>
          <li>• Each scene includes detailed visual and audio descriptions</li>
          <li>• Perfect for creating structured, professional video content</li>
          <li>• All scenes can be saved to Prompt Bank for future use</li>
        </ul>
      </div>
    </div>
  );
};

export default SatsetMode;
