import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { callGeminiAPI } from '../utils/api';
import { getSettings } from '../utils/database';
import { APISettings } from '../types';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  isMain?: boolean;
}

interface StoryMemory {
  characterDNA: string;
  storyContext: string;
  dialogueHistory: string[];
  sceneEndingSummary: string;
  previousScenePrompt?: string;
}

interface ScenePrompt {
  id: string;
  content: string;
  isExpanded: boolean;
  metadata?: {
    characterDNA: string;
    storyContext: string;
    dialogueHistory: string[];
    sceneEndingSummary: string;
  };
}

const ImageAnalysis: React.FC = () => {
  const { t } = useTranslation();
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [scenes, setScenes] = useState<ScenePrompt[]>([]);
  const [storyMemory, setStoryMemory] = useState<StoryMemory | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [volumeDialog, setVolumeDialog] = useState(80);
  const [volumeMusic, setVolumeMusic] = useState(60);
  const [volumeSoundEffects, setVolumeSoundEffects] = useState(40);
  const [volumeOverall, setVolumeOverall] = useState(100);
  const [captionMode, setCaptionMode] = useState<'no-caption' | 'with-caption'>('no-caption');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('indonesian');
  const [selectedAccent, setSelectedAccent] = useState<string>('standard');
  const [apiSettings, setApiSettings] = useState<APISettings | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCaptionMode(e.target.value as 'no-caption' | 'with-caption');
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
  };

  const handleAccentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccent(e.target.value);
  };

  type LanguageKey = 'indonesian' | 'sundanese' | 'javanese' | 'betawi' | 'madurese';
  type AccentKey = 'standard' | 'jakarta' | 'regional' | 'formal' | 'casual';

  const getLanguageSpecificInstructions = (language: LanguageKey, accent: AccentKey) => {
    const instructions = {
      indonesian: {
        voiceNote: 'Natural Indonesian voice with clear pronunciation',
        culturalContext: 'Indonesian cultural context and expressions'
      },
      sundanese: {
        voiceNote: 'Authentic Sundanese accent with regional intonation',
        culturalContext: 'Sundanese cultural nuances and local expressions'
      },
      javanese: {
        voiceNote: 'Traditional Javanese accent with proper intonation',
        culturalContext: 'Javanese cultural context and respectful language levels'
      },
      betawi: {
        voiceNote: 'Authentic Betawi accent with Jakarta characteristics',
        culturalContext: 'Betawi cultural expressions and local slang'
      },
      madurese: {
        voiceNote: 'Authentic Madurese accent with island characteristics',
        culturalContext: 'Madurese cultural context and local expressions'
      }
    };

    const accentMap = {
      standard: 'standard pronunciation',
      jakarta: 'Jakarta accent with urban intonation',
      regional: 'authentic regional accent',
      formal: 'formal and clear pronunciation',
      casual: 'casual and natural conversation tone'
    };

    return {
      ...instructions[language],
      accentNote: accentMap[accent]
    };
  };

  // Handle toast timeout
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleFileUpload = (files: FileList | null, isMain = false) => {
    if (!files || files.length === 0) return;

    const newImages: UploadedImage[] = [];

    Array.from(files).forEach(file => {
      if (!file.type.match('image.*')) {
        showToast('Only image files are allowed', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now().toString(),
          file,
          preview: e.target?.result as string,
          isMain
        };
        newImages.push(newImage);

        if (newImages.length === files.length) {
          setUploadedImages(prev => {
            // If adding main image, ensure only one main exists
            if (isMain) {
              const updated = prev.map(img => ({ ...img, isMain: false }));
              return [...newImages, ...updated];
            }
            return [...prev, ...newImages];
          });
          showToast(`${files.length} image(s) uploaded`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
    showToast('Image removed', 'success');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const generateScene = async (sceneNumber: number) => {
    if (uploadedImages.length === 0 || !userInput.trim()) {
      showToast('Please upload at least one image and provide a story prompt', 'error');
      return;
    }

    if (!apiSettings || !apiSettings.isActive) {
      showToast('Please configure and validate your API key in the API Settings first.', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const mainImage = uploadedImages.find(img => img.isMain) || uploadedImages[0];
      const prompt = `Based on all provided images and user narrative, create a complete and very detailed 8-second video scene prompt for Veo3. Also extract important data for subsequent scenes.

**User Narrative:** "${userInput}"

**Output MUST be a JSON object with five keys: "scenePrompt", "characterDNA", "storyContext", "dialogueHistory", "sceneEndingSummary".**

1. **scenePrompt**: Complete and detailed prompt for the first scene. Follow this specific structure VERY STRICTLY, especially for the Dialogue section. **EACH DIALOGUE LINE MUST HAVE ITS OWN SQUARE BRACKETS.**
\`\`\`
Create a [VIDEO STYLE] video:
[VERY DETAILED MAIN VISUAL DESCRIPTION, covering characters, actions, and environment based on user narrative and ALL IMAGES.]

Location: [DETAILED LOCATION]
Time: [DETAILED TIME]
Season: [SEASON]
Weather: [WEATHER]

Cinematography:
- [CAMERA WORK DETAIL 1]
- [CAMERA WORK DETAIL 2]
- [LIGHTING DETAIL]
- [COLOR DETAIL]

Audio:
${getLanguageSpecificInstructions(selectedLanguage as LanguageKey, selectedAccent as AccentKey).voiceNote}
${getLanguageSpecificInstructions(selectedLanguage as LanguageKey, selectedAccent as AccentKey).accentNote}
dialogue in ${selectedLanguage} (${selectedAccent}):
[CHARACTER NAME 1 (speaking tone): "dialog line 1 in Indonesian"]
[CHARACTER NAME 2 (speaking tone): "dialog line 2 in Indonesian"]
Ambient Sounds:
  Sound 1 (${volumeSoundEffects}%)
  Sound 2 (${volumeSoundEffects}%)
Audio Mix: [Brief audio mixing description]
${captionMode === 'with-caption' ?
          `Caption Display: Show accurate captions in ${selectedLanguage} with proper timing synchronization` :
          `Caption Display: No captions, clean video output without text overlay`
        }
Cultural Context: ${getLanguageSpecificInstructions(selectedLanguage as LanguageKey, selectedAccent as AccentKey).culturalContext}
Ultra Sharp 4K Quality
\`\`\`

2. **characterDNA**: Detailed description of all main characters
3. **storyContext**: 1-2 sentence story summary
4. **dialogueHistory**: Array of all dialogue lines
5. **sceneEndingSummary**: One sentence summarizing scene end state`;

      const response = await callGeminiAPI(prompt, mainImage.preview, apiSettings);
      const parsedData = JSON.parse(response.replace(/^```json\s*|```\s*$/g, '').trim());

      const newScene = {
        id: Date.now().toString(),
        content: parsedData.scenePrompt,
        isExpanded: true,
        metadata: {
          characterDNA: parsedData.characterDNA,
          storyContext: parsedData.storyContext,
          dialogueHistory: parsedData.dialogueHistory || [],
          sceneEndingSummary: parsedData.sceneEndingSummary
        }
      };

      setStoryMemory({
        characterDNA: parsedData.characterDNA,
        storyContext: parsedData.storyContext,
        dialogueHistory: parsedData.dialogueHistory || [],
        sceneEndingSummary: parsedData.sceneEndingSummary,
        previousScenePrompt: parsedData.scenePrompt
      });

      setScenes(prev => [...prev, newScene]);

      showToast(`Adegan ${sceneNumber} berhasil dibuat!`, 'success');
    } catch (error) {
      console.error('Error generating scene:', error);
      showToast('Failed to generate scene', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleScene = (id: string) => {
    setScenes(prev =>
      prev.map(scene =>
        scene.id === id ? { ...scene, isExpanded: !scene.isExpanded } : scene
      )
    );
  };

  const generateNextScene = async () => {
    if (!storyMemory) return;

    if (!apiSettings || !apiSettings.isActive) {
      showToast('Please configure and validate your API key in the API Settings first.', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const currentSceneNum = scenes.length + 1;
      const prompt = `This is a multi-scene story. Create the next 8-second video prompt (Scene ${currentSceneNum}) that directly continues from the previous scene.

**MEMORY FROM PREVIOUS SCENE (MUST BE USED):**
- **Character DNA:** ${storyMemory.characterDNA}
- **Story Context:** ${storyMemory.storyContext}
- **Last Dialogue:** ${JSON.stringify(storyMemory.dialogueHistory)}
- **Scene Ending Summary:** ${storyMemory.sceneEndingSummary}`;

      const response = await callGeminiAPI(prompt, undefined, apiSettings);
      const newScenePrompt = response.replace(/^```\s*|```\s*$/g, '').trim();

      const newScene = {
        id: Date.now().toString(),
        content: newScenePrompt,
        isExpanded: true,
        metadata: {
          ...storyMemory,
          previousScenePrompt: newScenePrompt
        }
      };

      setScenes(prev => [...prev, newScene]);
      showToast(`Adegan ${currentSceneNum} berhasil dibuat!`, 'success');
    } catch (error) {
      console.error('Error generating next scene:', error);
      showToast('Gagal membuat adegan lanjutan', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, successMessage = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    showToast(successMessage, 'success');
  };

  const exportAllScenes = () => {
    if (!storyMemory || scenes.length === 0) return;

    let exportText = `--- VEO3 MULTI-SCENE PROMPT EXPORT ---\n\n`;
    exportText += `Total Scenes: ${scenes.length}\n`;
    exportText += `Story Context: ${storyMemory.storyContext}\n\n`;
    exportText += `--- CHARACTER DNA ---\n${storyMemory.characterDNA}\n\n`;
    exportText += `--- SCENE PROMPTS ---\n\n`;

    scenes.forEach((scene, index) => {
      exportText += `----------------------------------------\n`;
      exportText += `SCENE ${index + 1}\n${scene.content}\n\n`;
    });

    copyToClipboard(exportText, "All scenes copied to clipboard!");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files, true);
  };

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;

      // Handle files from clipboard
      if (e.clipboardData.files.length > 0) {
        handleFileUpload(e.clipboardData.files, true);
        return;
      }

      // Handle image data from clipboard
      const items = Array.from(e.clipboardData.items);
      const imageItem = items.find(item => item.type.startsWith('image/'));
      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          handleFileUpload(dataTransfer.files, true);
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-6">
      <Helmet>
        <title>Analisis Gambar Mendalam - Shabira Prompt Lab</title>
        <meta name="description" content="Lakukan analisis gambar tingkat lanjut untuk proyek video Anda. Ekstrak DNA karakter, konteks cerita, dan dialog dari sebuah gambar." />
      </Helmet>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 animate-fade-in 
          ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {t(toast.message)}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{t('layout.title')}</h1>
          <p className="text-lg text-gray-600 mt-2">{t('layout.subtitle')}</p>

        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-2">{t('imageAnalysis.referenceImage')}</label>

              {/* Main Image Upload */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadedImages.some(img => img.isMain) ? (
                  <div className="relative">
                    <img
                      src={uploadedImages.find(img => img.isMain)?.preview}
                      alt="Main preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <button
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(uploadedImages.find(img => img.isMain)!.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 font-semibold text-blue-600">{t('imageAnalysis.dragDropMainImage')}</p>
                    <p className="text-sm text-gray-500">{t('imageAnalysis.clickToBrowse')}</p>

                    <p className="text-xs text-gray-500 mt-1">or press <kbd className="font-mono bg-gray-200 p-1 rounded">Ctrl+V</kbd> to paste</p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files, true)}
                />
              </div>

              {/* Additional Images */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {uploadedImages.filter(img => !img.isMain).map(img => (
                  <div key={img.id} className="relative">
                    <img
                      src={img.preview}
                      alt="Thumbnail"
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      onClick={() => removeImage(img.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button
                className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                onClick={() => additionalFileInputRef.current?.click()}
              >
                + Add Reference Images
              </button>
              <input
                type="file"
                ref={additionalFileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>

            {/* Story Input */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-2">Story Idea / Initial Dialogue</label>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter your dialog in format: [Character: 'Dialog text here'] [Character: 'Another dialog here']"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
              />
            </div>

            {/* Caption & Language Controls */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold mb-3">Caption Settings</h3>
              <div className="radio-group space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="captionMode"
                    value="no-caption"
                    checked={captionMode === 'no-caption'}
                    onChange={handleCaptionChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>No Caption (Recommended)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="captionMode"
                    value="with-caption"
                    checked={captionMode === 'with-caption'}
                    onChange={handleCaptionChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>With Caption (If Needed)</span>
                </label>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3">Language & Accent Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="dialogLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                      Dialog Language:
                    </label>
                    <select
                      id="dialogLanguage"
                      name="dialogLanguage"
                      value={selectedLanguage}
                      onChange={handleLanguageChange}
                      className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="indonesian">Bahasa Indonesia</option>
                      <option value="sundanese">Bahasa Sunda</option>
                      <option value="javanese">Bahasa Jawa</option>
                      <option value="betawi">Bahasa Betawi</option>
                      <option value="madurese">Bahasa Madura</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="accentType" className="block text-sm font-medium text-gray-700 mb-1">
                      Accent Type:
                    </label>
                    <select
                      id="accentType"
                      name="accentType"
                      value={selectedAccent}
                      onChange={handleAccentChange}
                      className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="standard">Standard</option>
                      <option value="jakarta">Jakarta Accent</option>
                      <option value="regional">Regional Accent</option>
                      <option value="formal">Formal Tone</option>
                      <option value="casual">Casual Tone</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Mixing Controls */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold mb-2">Pengaturan Audio Mixing</h3>
              <label className="flex justify-between items-center mb-1">
                <span>Volume Dialog</span>
                <span>{volumeDialog}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={volumeDialog}
                onChange={(e) => setVolumeDialog(Number(e.target.value))}
                className="w-full mb-4"
              />

              <label className="flex justify-between items-center mb-1">
                <span>Volume Musik</span>
                <span>{volumeMusic}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={volumeMusic}
                onChange={(e) => setVolumeMusic(Number(e.target.value))}
                className="w-full mb-4"
              />

              <label className="flex justify-between items-center mb-1">
                <span>Volume Efek Suara</span>
                <span>{volumeSoundEffects}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={volumeSoundEffects}
                onChange={(e) => setVolumeSoundEffects(Number(e.target.value))}
                className="w-full mb-4"
              />

              <label className="flex justify-between items-center mb-1">
                <span>Volume Keseluruhan</span>
                <span>{volumeOverall}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={volumeOverall}
                onChange={(e) => setVolumeOverall(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              {/* Generate Initial Scene Button */}
              <button
                className={`flex-1 py-3 px-4 rounded-lg text-white font-bold flex items-center justify-center
                  ${isGenerating ? 'bg-blue-400' : 'bg-gradient-to-r from-[#6A6EDC] to-[#7452B3] hover:opacity-90'}
                  ${(!uploadedImages.length || !userInput.trim() || !apiSettings?.isActive) && 'opacity-50 cursor-not-allowed'}`}
                onClick={() => generateScene(scenes.length + 1)}
                disabled={isGenerating || !uploadedImages.length || !userInput.trim() || !apiSettings?.isActive}
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin mr-2">🌀</span>
                    Generating...
                  </>
                ) : (
                  `Generate Scene ${scenes.length + 1}`
                )}
              </button>

              {/* Generate Next Scene Button */}
              {scenes.length > 0 && (
                <button
                  className={`flex-1 py-3 px-4 rounded-lg text-white font-bold flex items-center justify-center
                    ${isGenerating ? 'bg-blue-400' : 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:opacity-90'}
                    ${(!storyMemory || !apiSettings?.isActive) && 'opacity-50 cursor-not-allowed'}`}
                  onClick={generateNextScene}
                  disabled={isGenerating || !storyMemory || !apiSettings?.isActive}
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin mr-2">🌀</span>
                      Generating...
                    </>
                  ) : (
                    `Continue Scene ${scenes.length + 1}`
                  )}
                </button>
              )}
            </div>

            {/* Export Button */}
            {scenes.length > 0 && (
              <button
                className="w-full mt-2 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
                onClick={exportAllScenes}
              >
                Export All Scenes
              </button>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Generated Video Prompts</h2>

            {scenes.length === 0 ? (
              <p className="text-gray-500">Your generated scenes will appear here...</p>
            ) : (
              <div className="space-y-4">
                {scenes.map((scene, index) => (
                  <div key={scene.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div
                      className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
                      onClick={() => toggleScene(scene.id)}
                    >
                      <h3 className="font-bold">Scene {index + 1}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-2">
                          <button
                            className="text-sm bg-gray-200 text-gray-700 py-1 px-2 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(scene.content);
                            }}
                          >
                            Copy
                          </button>
                          <button
                            className="text-sm bg-blue-200 text-blue-700 py-1 px-2 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://translate.google.com/?sl=en&tl=id&text=${encodeURIComponent(scene.content)}`);
                            }}
                          >
                            Translate
                          </button>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-500 transform transition-transform ${scene.isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {scene.isExpanded && (
                      <div className="p-4 bg-white">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700">{scene.content}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysis;
