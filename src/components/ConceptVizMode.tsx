import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { generateKeyImagePrompt, generateVideoPromptsFromImage, generateMultiFramePrompt } from '../utils/api-multi-frame';

import { getSettings } from '../utils/database';
import { APISettings, VideoPromptWithOptimization, Frame, MultiFramePromptResult } from '../types';

// Cache for storing loaded brain prompts to avoid repeated file reads
const brainPromptCache = new Map<string, string[]>();

const ConceptVizMode: React.FC = () => {
  const [userIdea, setUserIdea] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('pixar');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingBrainPrompt, setIsFetchingBrainPrompt] = useState(false);
  const [generatedImagePrompt, setGeneratedImagePrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');
  const [uploadedFrames, setUploadedFrames] = useState<Frame[]>([]);
  const [videoPrompts, setVideoPrompts] = useState<VideoPromptWithOptimization[]>([]);
  const [multiFrameResult, setMultiFrameResult] = useState<MultiFramePromptResult | null>(null);
  const [error, setError] = useState<string>('');
  const [brainPromptError, setBrainPromptError] = useState<string>('');
  const [apiSettings, setApiSettings] = useState<APISettings | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isMultiFrameMode, setIsMultiFrameMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const singleFrameInputRef = useRef<HTMLInputElement>(null);
  const [draggedFrameIndex, setDraggedFrameIndex] = useState<number | null>(null);


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

  const handleMultiFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const framePromises: Promise<Frame>[] = [];

    Array.from(files).forEach((file, index) => {
      const promise = new Promise<Frame>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve({
              id: `frame-${Date.now()}-${index}`,
              imageUrl: event.target.result as string,
              order: uploadedFrames.length + index + 1,
              location: '',
              atmosphere: '',
              time: '',
              mood: '',
              visualElements: []
            });
          }
        };
        reader.readAsDataURL(file);
      });
      framePromises.push(promise);
    });

    Promise.all(framePromises).then((frames) => {
      setUploadedFrames(prev => [...prev, ...frames].sort((a, b) => a.order - b.order));
    });
  };

  const handleSingleFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if we've reached the maximum number of frames
    if (uploadedFrames.length >= 20) {
      setError('Maximum 20 frames allowed');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newFrame: Frame = {
          id: `frame-${Date.now()}`,
          imageUrl: event.target.result as string,
          order: uploadedFrames.length + 1,
          location: '',
          atmosphere: '',
          time: '',
          mood: '',
          visualElements: []
        };
        setUploadedFrames(prev => [...prev, newFrame]);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeFrame = (frameId: string) => {
    setUploadedFrames(prev => {
      const filtered = prev.filter(frame => frame.id !== frameId);
      // Reorder remaining frames
      return filtered.map((frame, index) => ({
        ...frame,
        order: index + 1
      }));
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedFrameIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedFrameIndex === null || draggedFrameIndex === dropIndex) {
      return;
    }

    const draggedFrame = uploadedFrames[draggedFrameIndex];
    const newFrames = [...uploadedFrames];

    // Remove the dragged frame
    newFrames.splice(draggedFrameIndex, 1);

    // Insert at new position
    newFrames.splice(dropIndex, 0, draggedFrame);

    // Update order numbers
    const reorderedFrames = newFrames.map((frame, index) => ({
      ...frame,
      order: index + 1
    }));

    setUploadedFrames(reorderedFrames);
    setDraggedFrameIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedFrameIndex(null);
  };

  const handleGenerateMultiFramePrompts = async () => {
    if (!userIdea.trim() || uploadedFrames.length === 0) {
      setError('Please enter an idea and upload frames first');
      return;
    }

    if (!apiSettings || !apiSettings.isActive) {
      setError('Please configure and validate your API key in the API Settings first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMultiFrameResult(null);

    try {
      const languageOptions = { Language: 'Indonesia Gaul', Accent: '' };
      const result = await generateMultiFramePrompt(
        userIdea,
        uploadedFrames,
        selectedStyle,
        aspectRatio,
        languageOptions,
        apiSettings
      );
      setMultiFrameResult(result);
    } catch (err) {
      setError('Failed to generate multi-frame prompts. Please try again.');
      console.error('Error generating multi-frame prompts:', err);
    } finally {
      setIsLoading(false);
    }
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
    // Extract dialogue information
    const rawDialog = sceneData.dialog_id || sceneData.dialog_en || '';

    // Define dialogue beat type
    type DialogueBeat = {
      character: string;
      emotion: string;
      dialogue: string;
      order: number;
    };

    // Parse dialogue to extract characters and their lines
    const dialogueLines = rawDialog.split('\n').filter(line => line.trim());
    const dialogueBeats: DialogueBeat[] = [];

    dialogueLines.forEach((line, index) => {
      const match = line.match(/\[([^:]+):\s*\(([^)]+)\),\s*([^\]]+)\]/);
      if (match) {
        dialogueBeats.push({
          character: match[1].trim(),
          emotion: match[2].trim(),
          dialogue: match[3].trim(),
          order: index + 1
        });
      }
    });

    // Extract scene information from the visual prompt
    const visualPrompt = sceneData.scenePrompt || '';

    // Try to extract location, atmosphere, time, and mood from the visual prompt
    const locationMatch = visualPrompt.match(/(?:in|at|inside|outside)\s+(?:a\s+)?([^,.]+?)(?:\.|,|;)/i);
    const timeMatch = visualPrompt.match(/(?:during|at|in the)\s+(morning|afternoon|evening|night|dawn|dusk|midday|midnight)/i);
    const atmosphereMatch = visualPrompt.match(/(?:atmosphere|mood|feeling|ambiance)(?:\s+is)?\s+([^,.]+?)(?:\.|,|;)/i);

    const location = locationMatch ? locationMatch[1].trim() : 'modern urban setting';
    const timeOfDay = timeMatch ? timeMatch[1].trim() : 'daytime';
    const atmosphere = atmosphereMatch ? atmosphereMatch[1].trim() : 'tense and emotional';
    const mood = 'dramatic and realistic';

    // Get animation style name
    const styleNames: Record<string, string> = {
      'pixar': 'Pixar',
      'lionking': 'Lion King realistic',
      'coraline': 'Coraline stop-motion',
      'dragonquest': 'Dragon Quest',
      'illumination': 'Illumination',
      'japanese3d': 'Japanese 3D Anime',
      'larva': 'Larva Tuba',
      'lovedeath': 'Love Death + Robots',
      'lovecraftian': 'Lovecraftian Horror',
      'standbyme': 'Stand By Me Doraemon',
      'lordoftherings': 'Lord of the Rings',
      'vfx3d': 'VFX 3D',
      'videoclip': 'Music Video',
      'effectshader': 'Effect Shader'
    };

    const animationStyleName = styleNames[selectedStyle] || 'realistic';

    // Calculate total duration and beats
    const beatCount = dialogueBeats.length;
    const totalDuration = 8; // Standard 8 seconds for Veo3

    // Generate character profiles from dialogue
    const characters = dialogueBeats.map((beat) => {
      return `- ${beat.character}: Age appropriate to story, dressed contextually. Current emotion: ${beat.emotion}. (Position: As described in scene)`;
    }).filter((value, index, self) => {
      // Remove duplicates based on character name
      const charName = value.split(':')[0];
      return self.findIndex(v => v.split(':')[0] === charName) === index;
    });

    // Generate BEAT sequence with proper timing
    const beatDuration = totalDuration / beatCount;
    const dialogueSequence = dialogueBeats.map((beat, index) => {
      const startTime = Math.floor(index * beatDuration);
      const endTime = Math.floor((index + 1) * beatDuration);
      const uniqueCharacters = [...new Set(dialogueBeats.map(b => b.character))];
      const characterNumber = uniqueCharacters.indexOf(beat.character) + 1;

      return `BEAT ${index + 1}
Character ${characterNumber}
[0:0${startTime}-0:0${endTime}]
Character: ${beat.character}

Action: ${getActionForEmotion(beat.emotion)}

Dialogue: "${beat.dialogue}"

Camera: ${getCameraForBeat(index, beatCount)}

Audio: ${getAudioDescription(beat.character, beat.emotion)}`;
    }).join('\n\n');

    // Determine language from the dialogue content
    const hasIndonesianWords = rawDialog.match(/\b(aku|kamu|saya|gak|gue|lo|banget|sih|deh|nih)\b/i);
    const language = hasIndonesianWords ? 'Indonesian' : 'English';

    // Compose the final professional prompt
    const finalPrompt = `A ${animationStyleName} 3D animated scene.

SCENE SETUP:
- Location: ${location}
- Atmosphere: ${atmosphere}
- Time: ${timeOfDay}
- Overall Mood: ${mood}

CHARACTER PROFILES:
${characters.join('\n')}

DIALOGUE REQUIREMENTS:
- Number of beats: ${beatCount}
- Duration: ${totalDuration} seconds
- Language: ${language}
- Genre: Realistic drama

SCENE: ${extractSceneDescription(visualPrompt)}

CHARACTERS:
${generateCharacterDescriptions(dialogueBeats)}

DIALOGUE SEQUENCE:
Speaking Order: Characters speak in the exact order they appear in the original dialogue. Character 1 speaks first, Character 2 responds, and so on.

${dialogueSequence}`;

    navigator.clipboard.writeText(finalPrompt.trim());
    alert('Professional Veo3 optimized prompt successfully copied!');
  };

  // Helper function to get action based on emotion
  const getActionForEmotion = (emotion: string): string => {
    const emotionActions: Record<string, string> = {
      'angry': 'Points aggressively, eyes narrowed',
      'marah': 'Points aggressively, eyes narrowed',
      'sad': 'Looks down, shoulders slumped',
      'sedih': 'Looks down, shoulders slumped',
      'happy': 'Smiles warmly, eyes bright',
      'senang': 'Smiles warmly, eyes bright',
      'surprised': 'Eyes widen, mouth slightly open',
      'terkejut': 'Eyes widen, mouth slightly open',
      'concerned': 'Furrows brow, leans forward slightly',
      'khawatir': 'Furrows brow, leans forward slightly',
      'determined': 'Stands tall, jaw set firmly',
      'tegas': 'Stands tall, jaw set firmly',
      'resigned': 'Sighs deeply, shoulders drop',
      'pasrah': 'Sighs deeply, shoulders drop',
      'skeptical': 'Raises an eyebrow, head tilted',
      'skeptis': 'Raises an eyebrow, head tilted'
    };

    return emotionActions[emotion.toLowerCase()] || 'Gestures naturally while speaking';
  };

  // Helper function to get camera angle for beat
  const getCameraForBeat = (index: number, total: number): string => {
    if (index === 0) return 'Close-up on speaker\'s face, emphasizing emotion';
    if (index === total - 1) return 'Wide shot showing both characters and environment';
    if (index % 2 === 0) return 'Medium shot showing both characters, focusing on speaker';
    return 'Over-the-shoulder shot from listener\'s perspective';
  };

  // Helper function to get audio description
  const getAudioDescription = (character: string, emotion: string): string => {
    const emotionAudio: Record<string, string> = {
      'angry': 'raised in anger',
      'marah': 'raised in anger',
      'sad': 'soft and melancholic',
      'sedih': 'soft and melancholic',
      'happy': 'bright and cheerful',
      'senang': 'bright and cheerful',
      'concerned': 'worried and tense',
      'khawatir': 'worried and tense',
      'resigned': 'soft and defeated',
      'pasrah': 'soft and defeated',
      'skeptical': 'questioning and sharp',
      'skeptis': 'questioning and sharp'
    };

    const audioType = emotionAudio[emotion.toLowerCase()] || 'clear and natural';
    return `Sound of ${character}'s voice, ${audioType}`;
  };

  // Helper function to extract scene description
  const extractSceneDescription = (visualPrompt: string): string => {
    // Remove technical details and keep only the scene description
    const cleanedPrompt = visualPrompt
      .replace(/A\s+\w+\s+3D\s+animated\s+scene\./i, '')
      .replace(/Cinematography:.*$/i, '')
      .replace(/Aspect\s+Ratio:.*$/i, '')
      .trim();

    return cleanedPrompt || 'Two characters in an emotionally charged conversation';
  };

  // Helper function to generate character descriptions
  const generateCharacterDescriptions = (beats: Array<{ character: string; emotion: string; dialogue: string; order: number }>): string => {
    type CharacterBeat = { character: string; emotion: string; dialogue: string; order: number };

    const uniqueCharacters = beats.reduce((acc: CharacterBeat[], beat: CharacterBeat) => {
      if (!acc.find((c: CharacterBeat) => c.character === beat.character)) {
        acc.push(beat);
      }
      return acc;
    }, [] as CharacterBeat[]);

    return uniqueCharacters.map((char: CharacterBeat) => {
      const characterDescriptions: Record<string, string> = {
        'fitri': 'A young woman in her early twenties, wearing fashionable but slightly worn clothing. Her face shows strong emotions.\n\nPosition: Standing, arms crossed.',
        'andi': 'A young man in his early twenties, wearing simple and slightly faded clothes. He has an expressive face.\n\nPosition: Sitting on a chair.',
        'ibu': 'A middle-aged woman with a caring but tired expression, wearing modest clothing.\n\nPosition: Standing near the doorway.',
        'mother': 'A middle-aged woman with a caring but tired expression, wearing modest clothing.\n\nPosition: Standing near the doorway.',
        'brian': 'A young boy with an innocent and curious expression, wearing casual clothes.\n\nPosition: Standing beside his mother.',
        'child': 'A young child with an innocent and curious expression, wearing casual clothes.\n\nPosition: Standing beside their parent.'
      };

      const defaultDesc = `A character dressed appropriately for the scene.\n\nPosition: Positioned naturally within the scene.`;

      return `${char.character}\n\n${characterDescriptions[char.character.toLowerCase()] || defaultDesc}`;
    }).join('\n\n');
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

          {/* Mode Selection */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="block mb-2 font-medium text-gray-700">Select Mode:</label>
            <div className="flex gap-4">
              <button
                onClick={() => setIsMultiFrameMode(false)}
                className={`px-4 py-2 rounded-lg font-medium ${!isMultiFrameMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Single Image Mode
              </button>
              <button
                onClick={() => setIsMultiFrameMode(true)}
                className={`px-4 py-2 rounded-lg font-medium ${isMultiFrameMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Multi-Frame Mode (New!)
              </button>
            </div>
          </div>

          {/* Single Image Mode */}
          {!isMultiFrameMode && (
            <>
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
            </>
          )}

          {/* Multi-Frame Mode */}
          {isMultiFrameMode && (
            <>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">🎬 Multi-Frame to Prompt Feature</h4>
                <p className="text-blue-700 text-sm mb-4">
                  Upload multiple frames/images to generate animated prompts with frame sequence analysis,
                  transition detection, and character tracking across frames.
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <input
                    type="file"
                    ref={multiFileInputRef}
                    onChange={handleMultiFrameUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    onClick={() => multiFileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800"
                  >
                    📁 Upload Multiple Frames
                  </button>

                  <input
                    type="file"
                    ref={singleFrameInputRef}
                    onChange={handleSingleFrameUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => singleFrameInputRef.current?.click()}
                    disabled={uploadedFrames.length >= 20}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${uploadedFrames.length >= 20
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                  >
                    <span className="text-xl">+</span> Add Frame
                  </button>

                  {uploadedFrames.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {uploadedFrames.length}/20 frames
                    </span>
                  )}
                </div>

                {/* Frame Preview Gallery with Drag & Drop */}
                {uploadedFrames.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Frame Sequence (drag to reorder):
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      {uploadedFrames.map((frame, index) => (
                        <div
                          key={frame.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`relative group cursor-move transition-all ${draggedFrameIndex === index ? 'opacity-50' : ''
                            }`}
                        >
                          <div className="relative">
                            <img
                              src={frame.imageUrl}
                              alt={`Frame ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-400"
                            />
                            <span className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                              Frame {index + 1}
                            </span>
                            <button
                              onClick={() => removeFrame(frame.id)}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove frame"
                            >
                              ×
                            </button>
                          </div>
                          <div className="mt-1 text-center">
                            <div className="text-xs text-gray-500">
                              Drag to reorder
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Frame Button in Grid */}
                      {uploadedFrames.length < 20 && (
                        <div
                          onClick={() => singleFrameInputRef.current?.click()}
                          className="relative group cursor-pointer"
                        >
                          <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all">
                            <div className="text-center">
                              <span className="text-3xl text-gray-400 group-hover:text-blue-600">+</span>
                              <p className="text-xs text-gray-500 group-hover:text-blue-600 mt-1">Add Frame</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {uploadedFrames.length === 0 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-500 mb-4">No frames uploaded yet</p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => multiFileInputRef.current?.click()}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800"
                      >
                        📁 Upload Multiple
                      </button>
                      <button
                        onClick={() => singleFrameInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                      >
                        <span className="text-xl">+</span> Add Single Frame
                      </button>
                    </div>
                  </div>
                )}
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
                  onClick={handleGenerateMultiFramePrompts}
                  disabled={isLoading || uploadedFrames.length === 0 || !apiSettings?.isActive}
                  className={`px-6 py-3 rounded-lg font-medium ${isLoading || uploadedFrames.length === 0 || !apiSettings?.isActive
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                  {isLoading ? 'Analyzing Frames...' : 'Generate Multi-Frame Prompt'}
                </button>
              </div>

              {/* Multi-Frame Results */}
              {multiFrameResult && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Multi-Frame Analysis Results:</h4>

                  {/* Frame Analysis */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-700 mb-2">📊 Frame Sequence Analysis:</h5>
                    <div className="space-y-2 text-sm">
                      {multiFrameResult.frameAnalysis?.frames.map((frame, index) => (
                        <div key={frame.id} className="p-2 bg-white rounded border border-gray-200">
                          <p className="font-medium">Frame {index + 1}:</p>
                          <p>• Location: {frame.location}</p>
                          <p>• Atmosphere: {frame.atmosphere}</p>
                          <p>• Time: {frame.time}</p>
                          <p>• Mood: {frame.mood}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Character Tracking */}
                  {multiFrameResult.frameAnalysis?.characters && multiFrameResult.frameAnalysis.characters.length > 0 && (
                    <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                      <h5 className="font-semibold text-yellow-800 mb-2">👥 Character Tracking:</h5>
                      <div className="space-y-2 text-sm">
                        {multiFrameResult.frameAnalysis.characters.map((char, index) => (
                          <div key={index} className="p-2 bg-white rounded border border-yellow-200">
                            <p className="font-medium">{char.name}:</p>
                            {char.frameAppearances.map((appearance, idx) => (
                              <p key={idx}>• Frame {appearance.frameNumber}: {appearance.position}, {appearance.emotion}</p>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generated Prompts */}
                  <div className="mb-6 p-4 bg-green-50 rounded-lg">
                    <h5 className="font-semibold text-green-800 mb-2">🎯 Veo3 Optimized Multi-Frame Prompt:</h5>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                      rows={10}
                      readOnly
                      value={multiFrameResult.veo3OptimizedPrompt || ''}
                    />
                    <button
                      onClick={() => copyToClipboard(multiFrameResult.veo3OptimizedPrompt || '')}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      📋 Copy Multi-Frame Prompt
                    </button>
                  </div>

                  {/* Additional Details */}
                  <details className="mb-4">
                    <summary className="cursor-pointer font-medium text-gray-600 hover:text-gray-800">
                      📋 View Detailed Analysis
                    </summary>
                    <div className="mt-4 space-y-4">
                      {multiFrameResult.sequencePrompt && (
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Sequence Description:</h5>
                          <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg mb-2 bg-gray-50"
                            rows={4}
                            readOnly
                            value={multiFrameResult.sequencePrompt}
                          />
                        </div>
                      )}
                      {multiFrameResult.characterProgression && (
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Character Progression:</h5>
                          <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg mb-2 bg-gray-50"
                            rows={4}
                            readOnly
                            value={multiFrameResult.characterProgression}
                          />
                        </div>
                      )}
                      {multiFrameResult.dialogueBeats && (
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Dialogue Beats:</h5>
                          <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg mb-2 bg-gray-50"
                            rows={4}
                            readOnly
                            value={multiFrameResult.dialogueBeats}
                          />
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </>
          )}


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
