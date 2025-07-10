import React, { useState, useEffect } from 'react';
import { Settings, Users, Package, Camera, Mic, Palette, Save, Copy, Wand2, Plus, Languages, Clock } from 'lucide-react';
import { Character, VideoObject } from '../types';
import { getCharacters, getObjects, savePrompt } from '../utils/database';
import { callGeminiAPI } from '../utils/api';

const ManualMode: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [objects, setObjects] = useState<VideoObject[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [duration, setDuration] = useState(8);
  const [isMultiScene, setIsMultiScene] = useState(false);
  const [currentScene, setCurrentScene] = useState(1);
  const [totalScenes, setTotalScenes] = useState(1);
  const [scenePrompts, setScenePrompts] = useState<string[]>([]);
  const [isGeneratingScene, setIsGeneratingScene] = useState(false);

  // Input visibility states
  const [inputStates, setInputStates] = useState({
    character: false,
    object: false,
    action: false,
    style: false,
    cameraMovement: false,
    angle: false,
    effect: false,
    sound: false,
    customDialog: false,
    newDialogCharacterInput: false
  });

  // Input value states
  const [inputValues, setInputValues] = useState({
    character: '',
    object: '',
    action: '',
    style: '',
    cameraMovement: '',
    angle: '',
    effect: '',
    sound: '',
    customDialog: '',
    newDialogCharacter: '',
    dialogMood: ''
  });

  const [formData, setFormData] = useState({
    // Main Description
    mainDescription: '',
    
    // Characters & Objects
    selectedCharacters: [] as string[],
    selectedObjects: [] as string[],
    customCharacters: [] as string[],
    customObjects: [] as string[],
    
    // Action & Emotion
    mainAction: '',
    characterEmotion: '',
    customActions: [] as string[],
    
    // Video Style
    videoStyle: 'realistic',
    customStyles: [] as string[],
    
    // Camera & Visual
    cameraMovement: 'static',
    cameraAngle: 'medium-shot',
    lighting: 'natural',
    colorGrading: 'neutral',
    visualEffects: '',
    customCameraMovements: [] as string[],
    customAngles: [] as string[],
    customEffects: [] as string[],
    
    // Dialog & Narration
    dialogType: 'natural-dialogue',
    hasNarrator: false,
    narratorMood: 'professional',
    environmentalSounds: [] as { name: string; intensity: number }[],
    customDialogs: [] as { character: string; dialog: string; mood: string }[],
    
    // Scene Settings
    location: '',
    timeOfDay: 'day',
    weather: 'clear',
    season: 'spring'
  });

  // Predefined sound categories
  const soundCategories = {
    nature: [
      'Ambient nature sounds',
      'Birds chirping',
      'Wind rustling',
      'Water flowing',
      'Rain',
      'Thunder',
      'Leaves rustling',
      'Ocean waves'
    ],
    urban: [
      'City traffic',
      'Crowd noise',
      'Construction sounds',
      'Street vendors',
      'Public transport',
      'Restaurant ambience'
    ],
    effects: [
      'Footsteps',
      'Door sounds',
      'Impact sounds',
      'Vehicle sounds',
      'Machine noises'
    ],
    atmosphere: [
      'Room tone',
      'Wind',
      'Echo',
      'Reverb'
    ]
  };

  const suggestSounds = () => {
    const suggestions: { name: string; intensity: number }[] = [];
    const location = formData.location.toLowerCase();
    const weather = formData.weather;
    const timeOfDay = formData.timeOfDay;

    // Location-based sounds
    if (location.includes('beach') || location.includes('ocean')) {
      suggestions.push({ name: 'Ocean waves', intensity: 60 });
      suggestions.push({ name: 'Seagulls', intensity: 30 });
      if (weather === 'windy') suggestions.push({ name: 'Strong wind', intensity: 70 });
    } else if (location.includes('forest') || location.includes('park')) {
      suggestions.push({ name: 'Birds chirping', intensity: 40 });
      suggestions.push({ name: 'Leaves rustling', intensity: 30 });
      suggestions.push({ name: 'Subtle ambient nature', intensity: 20 });
    } else if (location.includes('city') || location.includes('street')) {
      suggestions.push({ name: 'City traffic', intensity: 50 });
      suggestions.push({ name: 'Distant conversations', intensity: 30 });
      if (timeOfDay === 'night') suggestions.push({ name: 'Night ambience', intensity: 40 });
    }

    // Weather-based sounds
    if (weather === 'rainy') {
      suggestions.push({ name: 'Rain', intensity: 70 });
      suggestions.push({ name: 'Thunder', intensity: 40 });
    } else if (weather === 'stormy') {
      suggestions.push({ name: 'Strong wind', intensity: 80 });
      suggestions.push({ name: 'Heavy rain', intensity: 90 });
      suggestions.push({ name: 'Thunder', intensity: 100 });
    }

    // Action-based sounds
    if (formData.mainAction.toLowerCase().includes('walk')) {
      suggestions.push({ name: 'Footsteps', intensity: 40 });
    } else if (formData.mainAction.toLowerCase().includes('run')) {
      suggestions.push({ name: 'Fast footsteps', intensity: 60 });
    }

    return suggestions;
  };


  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    const scenes = Math.ceil(duration / 8);
    setTotalScenes(scenes);
    setIsMultiScene(scenes > 1);
    if (scenes === 1) {
      setCurrentScene(1);
      setScenePrompts([]);
    }
  }, [duration]);

  const loadAssets = async () => {
    try {
      const [charactersData, objectsData] = await Promise.all([
        getCharacters(),
        getObjects()
      ]);
      setCharacters(charactersData);
      setObjects(objectsData);
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  };

  const videoStyles = [
    { value: 'realistic', label: 'Realistic' },
    { value: '2d-anime', label: '2D Anime' },
    { value: '3d-animation', label: '3D Animation' },
    { value: 'ghibli', label: 'Studio Ghibli Style' },
    { value: 'pixar', label: 'Pixar Style' },
    { value: 'documentary', label: 'Documentary' },
    { value: 'cinematic', label: 'Cinematic' }
  ];

  const cameraMovements = [
    { value: 'static', label: 'Static Shot' },
    { value: 'pan-left', label: 'Pan Left' },
    { value: 'pan-right', label: 'Pan Right' },
    { value: 'tilt-up', label: 'Tilt Up' },
    { value: 'tilt-down', label: 'Tilt Down' },
    { value: 'zoom-in', label: 'Zoom In' },
    { value: 'zoom-out', label: 'Zoom Out' },
    { value: 'dolly-in', label: 'Dolly In' },
    { value: 'dolly-out', label: 'Dolly Out' },
    { value: 'tracking', label: 'Tracking Shot' }
  ];

  const cameraAngles = [
    { value: 'close-up', label: 'Close-up' },
    { value: 'medium-shot', label: 'Medium Shot' },
    { value: 'wide-shot', label: 'Wide Shot' },
    { value: 'extreme-close-up', label: 'Extreme Close-up' },
    { value: 'bird-eye', label: 'Bird\'s Eye View' },
    { value: 'low-angle', label: 'Low Angle' },
    { value: 'high-angle', label: 'High Angle' }
  ];

  const lightingOptions = [
    { value: 'natural', label: 'Natural Light' },
    { value: 'golden-hour', label: 'Golden Hour' },
    { value: 'blue-hour', label: 'Blue Hour' },
    { value: 'studio', label: 'Studio Lighting' },
    { value: 'dramatic', label: 'Dramatic Lighting' },
    { value: 'soft', label: 'Soft Lighting' },
    { value: 'harsh', label: 'Harsh Lighting' },
    { value: 'backlit', label: 'Backlit' }
  ];

  const dialogTypes = [
    { value: 'no-dialogue', label: 'No Dialogue' },
    { value: 'informative', label: 'Informative' },
    { value: 'natural-dialogue', label: 'Natural Dialogue' },
    { value: 'monologue', label: 'Monologue' },
    { value: 'interview', label: 'Interview Style' }
  ];

  const durationOptions = [
    { value: 8, label: '8s', scenes: 1 },
    { value: 16, label: '16s', scenes: 2 },
    { value: 24, label: '24s', scenes: 3 },
    { value: 32, label: '32s', scenes: 4 },
    { value: 60, label: '1m', scenes: 8 },
    { value: 120, label: '2m', scenes: 15 },
    { value: 180, label: '3m', scenes: 23 }
  ];

  const showInput = (type: string) => {
    setInputStates(prev => ({ ...prev, [type]: true }));
  };

  const hideInput = (type: string) => {
    setInputStates(prev => ({ ...prev, [type]: false }));
    setInputValues(prev => ({ ...prev, [type]: '' }));
  };

  const handleInputChange = (type: keyof typeof inputValues, value: string) => {
    setInputValues(prev => ({ ...prev, [type]: value }));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: keyof typeof inputValues) => {
    if (e.key === 'Enter' && inputValues[type].trim()) {
      addCustomItem(type, inputValues[type].trim());
      hideInput(type);
    } else if (e.key === 'Escape') {
      hideInput(type);
    }
  };

  const addCustomItem = (type: string, value: string) => {
    const key = `custom${type.charAt(0).toUpperCase() + type.slice(1)}s`;
    setFormData(prev => ({
      ...prev,
      [key]: [...(prev[key as keyof typeof prev] as string[]), value]
    }));
  };

  const removeCustomItem = (type: string, index: number) => {
    const key = `custom${type.charAt(0).toUpperCase() + type.slice(1)}s`;
    setFormData(prev => ({
      ...prev,
      [key]: (prev[key as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }));
  };

  // Custom dialog handlers
  const dialogInputRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogInputRef.current && !dialogInputRef.current.contains(event.target as Node)) {
        hideCustomDialogInput();
      }
    };

    if (inputStates.customDialog) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [inputStates.customDialog]);

  const showCustomDialogInput = () => {
    setInputStates(prev => ({ ...prev, customDialog: true }));
  };

  const hideCustomDialogInput = () => {
    setInputStates(prev => ({ ...prev, customDialog: false }));
    setInputValues(prev => ({ 
      ...prev, 
      customDialog: '', 
      newDialogCharacter: '',
      dialogMood: ''
    }));
  };

  const handleCustomDialogChange = (value: string) => {
    setInputValues(prev => ({ ...prev, customDialog: value }));
  };

  const handleNewDialogCharacterChange = (value: string) => {
    setInputValues(prev => ({ ...prev, newDialogCharacter: value }));
  };

  const handleCustomDialogKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValues.customDialog.trim() && inputValues.newDialogCharacter) {
      setFormData(prev => ({
        ...prev,
        customDialogs: [...prev.customDialogs, { 
          character: inputValues.newDialogCharacter, 
          dialog: inputValues.customDialog.trim(), 
          mood: inputValues.dialogMood || 'neutral'
        }]
      }));
      hideCustomDialogInput();
    } else if (e.key === 'Escape') {
      hideCustomDialogInput();
    }
  };

  const removeCustomDialog = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customDialogs: prev.customDialogs.filter((_, i) => i !== index)
    }));
  };

  const addCustomDialog = () => {
    const character = prompt('Character name:');
    const dialog = prompt('Dialog text:');
    const mood = prompt('Mood/tone:') || 'neutral';
    
    if (character && dialog) {
      setFormData(prev => ({
        ...prev,
        customDialogs: [...prev.customDialogs, { character, dialog, mood }]
      }));
    }
  };

  const generateCleanPrompt = (sceneNumber?: number) => {
    const selectedCharacterDetails = characters
      .filter(char => formData.selectedCharacters.includes(char.id))
      .map(char => `${char.name} (${char.age}yo, ${char.hairColor} hair, ${char.faceShape} face, ${char.bodyShape} body, ${char.height} height, accessories: ${char.accessories}, additional: ${char.additionalFeatures})`)
      .join('; ');

    const selectedObjectDetails = objects
      .filter(obj => formData.selectedObjects.includes(obj.id))
      .map(obj => `${obj.name} (${obj.category}): ${obj.description}`)
      .join('; ');

    const allCharacters = [
      ...selectedCharacterDetails ? [selectedCharacterDetails] : [],
      ...formData.customCharacters
    ].join('; ');

    const allObjects = [
      ...selectedObjectDetails ? [selectedObjectDetails] : [],
      ...formData.customObjects
    ].join('; ');

    const allActions = [formData.mainAction, ...formData.customActions].filter(Boolean).join(', ');
    const allStyles = [formData.videoStyle, ...formData.customStyles].filter(Boolean).join(', ');
    const allCameraMovements = [formData.cameraMovement, ...formData.customCameraMovements].filter(Boolean).join(', ');
    const allEffects = [formData.visualEffects, ...formData.customEffects].filter(Boolean).join(', ');
    const allSounds = formData.environmentalSounds
      .map(sound => `${sound.name} (${sound.intensity}%)`)
      .join('\n');

    // Format custom dialogs with new format
    let dialogText = '';
    if (formData.customDialogs.length > 0) {
      dialogText = 'Audio: dialog dalam Bahasa Indonesia betawi accent:\n';
      formData.customDialogs.forEach((d, i) => {
        if (i === 0) {
          dialogText += `[${d.character} (${d.mood}): "${d.dialog}"]\n`;
        } else {
          dialogText += `${d.character} (${d.mood}): "${d.dialog}"\n`;
        }
      });
    } else {
      dialogText = '[No specific dialogue]';
    }

    const scenePrefix = sceneNumber ? `SCENE ${sceneNumber}\n` : '';
    const referenceText = sceneNumber && sceneNumber > 1 && scenePrompts.length > 0 
      ? `\n\nREFERENCE PREVIOUS SCENE FOR CHARACTER CONSISTENCY:\n${scenePrompts[0]}\n\n` 
      : '';

    return `${scenePrefix}Create a ${allStyles || 'cinematic'} video:
${formData.mainDescription}${referenceText}

Characters: ${allCharacters || 'None specified'}
Objects: ${allObjects || 'None specified'}
Actions: ${allActions}
Emotions: ${formData.characterEmotion}

Scene Mood: ${formData.characterEmotion || 'Natural'}
Location: ${formData.location}
Time: ${formData.timeOfDay}
Weather: ${formData.weather}
Season: ${formData.season}

Camera Movement: ${allCameraMovements}
Camera Angle: ${formData.cameraAngle}
Lighting: ${formData.lighting}
Color Grading: ${formData.colorGrading}
Visual Effects: ${allEffects || 'None'}

Audio:
${dialogText}
Atmosphere:
${allSounds || 'Ambient sound'} (60%)
Ultra Sharp 4K Quality`;
  };

  const generatePrompt = async () => {
    if (isMultiScene) {
      await generateMultiScenePrompts();
    } else {
      await generateSinglePrompt();
    }
  };

  const generateSinglePrompt = async () => {
    setIsGenerating(true);
    try {
      const cleanPrompt = generateCleanPrompt();
      
    const enhancementPrompt = `Generate a clean, professional video prompt based on this input. 
      
CRITICAL RULES:
1. Output ONLY in English (except keep dialog in Indonesian)
2. NO markdown formatting (no **, no ###, no bullets)
3. Use clean, natural text format
4. Keep dialog exactly as specified in Indonesian
5. The dialogue section MUST start with the line: "Audio: dialog dalam Bahasa Indonesia betawi accent:"
6. Dialogue lines should be formatted so the first line is bracketed like [Character (mood): "dialog"], subsequent lines without brackets.

Input: ${cleanPrompt}

Generate a clean, enhanced version following the exact format shown in the example.`;

      const result = await callGeminiAPI(enhancementPrompt);
      setGeneratedPrompt(result);
    } catch (error) {
      console.error('Failed to generate prompt:', error);
      alert('Failed to generate prompt. Please check your API settings.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMultiScenePrompts = async () => {
    setIsGenerating(true);
    setScenePrompts([]);
    setCurrentScene(1);

    try {
      for (let i = 1; i <= totalScenes; i++) {
        setCurrentScene(i);
        setIsGeneratingScene(true);
        
        const scenePrompt = generateCleanPrompt(i);
        const enhancementPrompt = `Generate a clean, professional video prompt for scene ${i} of ${totalScenes}. 
        
CRITICAL RULES:
1. Output ONLY in English (except keep dialog in Indonesian)
2. NO markdown formatting (no **, no ###, no bullets)
3. Use clean, natural text format
4. Keep dialog exactly as specified in Indonesian
5. ${i > 1 ? 'Maintain character consistency with previous scenes' : 'Establish character descriptions for future scenes'}

Input: ${scenePrompt}

Generate a clean, enhanced version following the exact format.`;

        const result = await callGeminiAPI(enhancementPrompt);
        
        setScenePrompts(prev => [...prev, result]);
        
        // Small delay between scenes
        if (i < totalScenes) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      setGeneratedPrompt(scenePrompts.join('\n\n---SCENE BREAK---\n\n'));
    } catch (error) {
      console.error('Failed to generate multi-scene prompts:', error);
      alert('Failed to generate multi-scene prompts. Please check your API settings.');
    } finally {
      setIsGenerating(false);
      setIsGeneratingScene(false);
    }
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      alert('Prompt copied to clipboard!');
    } catch (error) {
      alert('Failed to copy prompt');
    }
  };

  const openGoogleTranslate = () => {
    const text = encodeURIComponent(generatedPrompt);
    const url = `https://translate.google.com/?sl=en&tl=id&text=${text}`;
    window.open(url, '_blank');
  };

  const saveToBank = async () => {
    if (!generatedPrompt) {
      alert('Please generate a prompt first');
      return;
    }

    const title = prompt('Enter a title for this prompt:');
    if (!title) return;

    try {
      const videoPrompt = {
        id: `manual_${Date.now()}`,
        title,
        type: 'manual' as const,
        mainDescription: formData.mainDescription,
        scenes: isMultiScene ? scenePrompts.map((prompt, index) => ({
          id: `scene_${Date.now()}_${index}`,
          sceneNumber: index + 1,
          prompt,
          duration: 8,
          characters: formData.selectedCharacters,
          objects: formData.selectedObjects
        })) : [{
          id: `scene_${Date.now()}`,
          sceneNumber: 1,
          prompt: generatedPrompt,
          duration: duration,
          characters: formData.selectedCharacters,
          objects: formData.selectedObjects
        }],
        characters: characters.filter(char => formData.selectedCharacters.includes(char.id)),
        objects: objects.filter(obj => formData.selectedObjects.includes(obj.id)),
        settings: {
          style: formData.videoStyle,
          cameraMovement: formData.cameraMovement,
          lighting: formData.lighting,
          dialogLanguage: 'id',
          duration: duration
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await savePrompt(videoPrompt);
      alert('Prompt saved to bank successfully!');
    } catch (error) {
      console.error('Failed to save prompt:', error);
      alert('Failed to save prompt to bank');
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold gradient-title mb-4">Manual Mode - Advanced Control</h2>
        <p className="text-xl text-gray-600">
          Create detailed video prompts with precise control over every aspect
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Form Sections */}
        <div className="xl:col-span-2 space-y-8">
          {/* Duration Selection */}
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Clock className="w-7 h-7 icon-prompt-en" />
              Video Duration
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDuration(option.value)}
                  className={`duration-btn ${duration === option.value ? 'active' : ''}`}
                >
                  <div className="text-lg font-bold">{option.label}</div>
                  <div className="text-sm opacity-75">
                    {option.scenes} scene{option.scenes > 1 ? 's' : ''}
                  </div>
                </button>
              ))}
            </div>
            {isMultiScene && (
              <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                <p className="text-lg font-semibold text-purple-800 mb-2">
                  Multi-Scene Mode: {totalScenes} scenes × 8 seconds each
                </p>
                {isGenerating && (
                  <div className="mt-4">
                    <div className="scene-queue mb-3">
                      Generating Scene {currentScene} of {totalScenes}
                    </div>
                    <div className="bg-white rounded-full h-3 overflow-hidden">
                      <div 
                        className="progress-bar h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(currentScene / totalScenes) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main Description */}
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Settings className="w-7 h-7 icon-prompt-id" />
              Main Video Description
            </h3>
            <textarea
              value={formData.mainDescription}
              onChange={(e) => setFormData({ ...formData, mainDescription: e.target.value })}
              className="custom-textarea w-full h-32"
              placeholder="Describe the overall concept and story of your video..."
            />
          </div>

          {/* Characters & Objects */}
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Users className="w-7 h-7 icon-prompt-en" />
              Characters & Objects
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-lg font-semibold text-gray-700">Characters</label>
              <button
                onClick={() => showInput('character')}
                className="plus-btn"
                title="Add custom character"
              >
                +
              </button>
              {inputStates.character && (
                <input
                  type="text"
                  autoFocus
                  value={inputValues.character}
                  onChange={(e) => handleInputChange('character', e.target.value)}
                  onKeyDown={(e) => handleInputKeyDown(e, 'character')}
                  onBlur={() => hideInput('character')}
                  placeholder="Enter character name"
                  className="custom-input mt-2"
                />
              )}
                </div>
                <div className="space-y-3 max-h-40 overflow-y-auto border-2 border-purple-200 rounded-xl p-4 bg-white/50">
                  {characters.map((character) => (
                    <label key={character.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selectedCharacters.includes(character.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              selectedCharacters: [...formData.selectedCharacters, character.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              selectedCharacters: formData.selectedCharacters.filter(id => id !== character.id)
                            });
                          }
                        }}
                        className="custom-checkbox"
                      />
                      <span className="text-sm font-medium">{character.name}</span>
                    </label>
                  ))}
                  {formData.customCharacters.map((char, index) => (
                    <div key={index} className="text-sm text-purple-700 bg-purple-100 p-3 rounded-lg font-medium flex justify-between items-center">
                      <span>{char}</span>
                      <button
                        onClick={() => removeCustomItem('character', index)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove character"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {characters.length === 0 && formData.customCharacters.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No characters available. Create some in Asset Management or add custom ones.</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-lg font-semibold text-gray-700">Objects</label>
              <button
                onClick={() => showInput('object')}
                className="plus-btn"
                title="Add custom object"
              >
                +
              </button>
              {inputStates.object && (
                <input
                  type="text"
                  autoFocus
                  value={inputValues.object}
                  onChange={(e) => handleInputChange('object', e.target.value)}
                  onKeyDown={(e) => handleInputKeyDown(e, 'object')}
                  onBlur={() => hideInput('object')}
                  placeholder="Enter object name"
                  className="custom-input mt-2"
                />
              )}
                </div>
                <div className="space-y-3 max-h-40 overflow-y-auto border-2 border-purple-200 rounded-xl p-4 bg-white/50">
                  {objects.map((object) => (
                    <label key={object.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selectedObjects.includes(object.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              selectedObjects: [...formData.selectedObjects, object.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              selectedObjects: formData.selectedObjects.filter(id => id !== object.id)
                            });
                          }
                        }}
                        className="custom-checkbox"
                      />
                      <span className="text-sm font-medium">{object.name}</span>
                    </label>
                  ))}
                  {formData.customObjects.map((obj, index) => (
                    <div key={index} className="text-sm text-purple-700 bg-purple-100 p-3 rounded-lg font-medium flex justify-between items-center">
                      <span>{obj}</span>
                      <button
                        onClick={() => removeCustomItem('object', index)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove object"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {objects.length === 0 && formData.customObjects.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No objects available. Create some in Asset Management or add custom ones.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action & Emotion */}
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Palette className="w-7 h-7 icon-idea-bulb" />
              Action & Emotion
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-lg font-semibold text-gray-700">Main Action</label>
                  <button
                    onClick={() => showInput('action')}
                    className="plus-btn"
                    title="Add custom action"
                  >
                    +
                  </button>
                  {inputStates.action && (
                    <input
                      type="text"
                      autoFocus
                      value={inputValues.action}
                      onChange={(e) => handleInputChange('action', e.target.value)}
                      onKeyDown={(e) => handleInputKeyDown(e, 'action')}
                      onBlur={() => hideInput('action')}
                      placeholder="Enter custom action"
                      className="custom-input mt-2"
                    />
                  )}
                </div>
                <input
                  type="text"
                  value={formData.mainAction}
                  onChange={(e) => setFormData({ ...formData, mainAction: e.target.value })}
                  className="custom-input w-full"
                  placeholder="e.g., walking, talking, cooking"
                />
                {formData.customActions.length > 0 && (
                  <div className="mt-3 space-y-2">
                  {formData.customActions.map((action, index) => (
                    <div key={index} className="text-sm text-purple-700 bg-purple-100 p-3 rounded-lg font-medium flex justify-between items-center">
                      <span>{action}</span>
                      <button
                        onClick={() => removeCustomItem('action', index)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove action"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">Character Emotion</label>
                <input
                  type="text"
                  value={formData.characterEmotion}
                  onChange={(e) => setFormData({ ...formData, characterEmotion: e.target.value })}
                  className="custom-input w-full"
                  placeholder="e.g., happy, sad, excited, angry"
                />
              </div>
            </div>
          </div>

          {/* Video Style */}
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Video Style</h3>
              <button
                onClick={() => showInput('style')}
                className="plus-btn"
                title="Add custom style"
              >
                +
              </button>
            </div>
            <div className="dropdown-with-plus">
              <select
                value={formData.videoStyle}
                onChange={(e) => setFormData({ ...formData, videoStyle: e.target.value })}
                className="custom-select w-full"
              >
                {videoStyles.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>
            {formData.customStyles.length > 0 && (
              <div className="mt-4 space-y-2">
              {inputStates.style && (
                <input
                  type="text"
                  autoFocus
                  value={inputValues.style}
                  onChange={(e) => handleInputChange('style', e.target.value)}
                  onKeyDown={(e) => handleInputKeyDown(e, 'style')}
                  onBlur={() => hideInput('style')}
                  placeholder="Enter custom style"
                  className="custom-input mt-2"
                />
              )}
              {formData.customStyles.map((style, index) => (
                <div key={index} className="text-sm text-purple-700 bg-purple-100 p-3 rounded-lg font-medium flex justify-between items-center">
                  <span>{style}</span>
                  <button
                    onClick={() => removeCustomItem('style', index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove style"
                  >
                    ×
                  </button>
                </div>
              ))}
              </div>
            )}
          </div>

          {/* Camera & Visual Settings */}
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Camera className="w-7 h-7 icon-prompt-en" />
              Camera & Visual Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-lg font-semibold text-gray-700">Camera Movement</label>
                  <button
                    onClick={() => showInput('cameraMovement')}
                    className="plus-btn"
                    title="Add custom camera movement"
                  >
                    +
                  </button>
                </div>
                {inputStates.cameraMovement && (
                  <input
                    type="text"
                    autoFocus
                    value={inputValues.cameraMovement}
                    onChange={(e) => handleInputChange('cameraMovement', e.target.value)}
                    onKeyDown={(e) => handleInputKeyDown(e, 'cameraMovement')}
                    onBlur={() => hideInput('cameraMovement')}
                    placeholder="Enter custom camera movement"
                    className="custom-input mb-4"
                  />
                )}
                <select
                  value={formData.cameraMovement}
                  onChange={(e) => setFormData({ ...formData, cameraMovement: e.target.value })}
                  className="custom-select w-full"
                >
                  {cameraMovements.map((movement) => (
                    <option key={movement.value} value={movement.value}>
                      {movement.label}
                    </option>
                  ))}
                </select>
                {formData.customCameraMovements.length > 0 && (
                  <div className="mt-3 space-y-2">
                {formData.customCameraMovements.map((movement, index) => (
                  <div key={index} className="text-sm text-purple-700 bg-purple-100 p-3 rounded-lg font-medium flex justify-between items-center">
                    <span>{movement}</span>
                    <button
                      onClick={() => removeCustomItem('cameraMovement', index)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove camera movement"
                    >
                      ×
                    </button>
                  </div>
                ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-lg font-semibold text-gray-700">Camera Angle</label>
                  <button
                    onClick={() => showInput('angle')}
                    className="plus-btn"
                    title="Add custom camera angle"
                  >
                    +
                  </button>
                </div>
                {inputStates.angle && (
                  <input
                    type="text"
                    autoFocus
                    value={inputValues.angle}
                    onChange={(e) => handleInputChange('angle', e.target.value)}
                    onKeyDown={(e) => handleInputKeyDown(e, 'angle')}
                    onBlur={() => hideInput('angle')}
                    placeholder="Enter custom camera angle"
                    className="custom-input mb-4"
                  />
                )}
                <select
                  value={formData.cameraAngle}
                  onChange={(e) => setFormData({ ...formData, cameraAngle: e.target.value })}
                  className="custom-select w-full"
                >
                  {cameraAngles.map((angle) => (
                    <option key={angle.value} value={angle.value}>
                      {angle.label}
                    </option>
                  ))}
                </select>
                {formData.customAngles.length > 0 && (
                  <div className="mt-3 space-y-2">
                {formData.customAngles.map((angle, index) => (
                  <div key={index} className="text-sm text-purple-700 bg-purple-100 p-3 rounded-lg font-medium flex justify-between items-center">
                    <span>{angle}</span>
                    <button
                      onClick={() => removeCustomItem('angle', index)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove camera angle"
                    >
                      ×
                    </button>
                  </div>
                ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">Lighting</label>
                <select
                  value={formData.lighting}
                  onChange={(e) => setFormData({ ...formData, lighting: e.target.value })}
                  className="custom-select w-full"
                >
                  {lightingOptions.map((lighting) => (
                    <option key={lighting.value} value={lighting.value}>
                      {lighting.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">Color Grading</label>
                <select
                  value={formData.colorGrading}
                  onChange={(e) => setFormData({ ...formData, colorGrading: e.target.value })}
                  className="custom-select w-full"
                >
                  <option value="neutral">Neutral</option>
                  <option value="warm">Warm</option>
                  <option value="cool">Cool</option>
                  <option value="vintage">Vintage</option>
                  <option value="high-contrast">High Contrast</option>
                  <option value="desaturated">Desaturated</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-lg font-semibold text-gray-700">Visual Effects</label>
                  <button
                    onClick={() => showInput('effect')}
                    className="plus-btn"
                    title="Add custom visual effect"
                  >
                    +
                  </button>
                </div>
                {inputStates.effect && (
                  <input
                    type="text"
                    autoFocus
                    value={inputValues.effect}
                    onChange={(e) => handleInputChange('effect', e.target.value)}
                    onKeyDown={(e) => handleInputKeyDown(e, 'effect')}
                    onBlur={() => hideInput('effect')}
                    placeholder="Enter custom visual effect"
                    className="custom-input mb-4"
                  />
                )}
                <input
                  type="text"
                  value={formData.visualEffects}
                  onChange={(e) => setFormData({ ...formData, visualEffects: e.target.value })}
                  className="custom-input w-full"
                  placeholder="e.g., slow motion, particles, lens flare"
                />
                {formData.customEffects.length > 0 && (
                  <div className="mt-3 space-y-2">
                {formData.customEffects.map((effect, index) => (
                  <div key={index} className="text-sm text-purple-700 bg-purple-100 p-3 rounded-lg font-medium flex justify-between items-center">
                    <span>{effect}</span>
                    <button
                      onClick={() => removeCustomItem('effect', index)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove visual effect"
                    >
                      ×
                    </button>
                  </div>
                ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dialog & Narration */}
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Mic className="w-7 h-7 icon-prompt-id" />
              Dialog & Narration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">Dialog Type</label>
                <select
                  value={formData.dialogType}
                  onChange={(e) => setFormData({ ...formData, dialogType: e.target.value })}
                  className="custom-select w-full"
                >
                  {dialogTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-lg font-semibold text-gray-700">Environmental Sounds</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const suggestions = suggestSounds();
                        setFormData(prev => ({
                          ...prev,
                          environmentalSounds: [...prev.environmentalSounds, ...suggestions]
                        }));
                      }}
                      className="suggest-btn px-3 py-1 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200"
                      title="Suggest sounds based on scene"
                    >
                      Suggest
                    </button>
                    <button
                      onClick={() => showInput('sound')}
                      className="plus-btn"
                      title="Add custom sound"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Sound Categories */}
                <div className="mb-4">
                  <select
                    className="custom-select w-full mb-2"
                    onChange={(e) => {
                      if (e.target.value) {
                        setFormData(prev => ({
                          ...prev,
                          environmentalSounds: [...prev.environmentalSounds, { name: e.target.value, intensity: 50 }]
                        }));
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Select a sound effect...</option>
                    {Object.entries(soundCategories).map(([category, sounds]) => (
                      <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                        {sounds.map(sound => (
                          <option key={sound} value={sound}>{sound}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Custom Sound Input */}
                {inputStates.sound && (
                  <div className="mb-4">
                    <input
                      type="text"
                      autoFocus
                      value={inputValues.sound}
                      onChange={(e) => handleInputChange('sound', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && inputValues.sound.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            environmentalSounds: [...prev.environmentalSounds, { name: inputValues.sound.trim(), intensity: 50 }]
                          }));
                          hideInput('sound');
                        } else if (e.key === 'Escape') {
                          hideInput('sound');
                        }
                      }}
                      placeholder="Enter custom sound"
                      className="custom-input w-full"
                    />
                  </div>
                )}

                {/* Sound List with Intensity Sliders */}
                {formData.environmentalSounds.length > 0 && (
                  <div className="space-y-4 mt-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Selected Sounds:</div>
                    {formData.environmentalSounds.map((sound, index) => (
                      <div key={index} className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <span className="text-base font-semibold text-purple-800">{sound.name}</span>
                          </div>
                          <button
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                environmentalSounds: prev.environmentalSounds.filter((_, i) => i !== index)
                              }));
                            }}
                            className="text-red-500 hover:text-red-700"
                            title="Remove sound"
                          >
                            ×
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={sound.intensity}
                            onChange={(e) => {
                              const newIntensity = parseInt(e.target.value);
                              setFormData(prev => ({
                                ...prev,
                                environmentalSounds: prev.environmentalSounds.map((s, i) => 
                                  i === index ? { ...s, intensity: newIntensity } : s
                                )
                              }));
                            }}
                            className="flex-grow accent-purple-600"
                          />
                          <span className="text-sm font-medium text-purple-700 w-12">{sound.intensity}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-lg font-semibold text-gray-700">Custom Dialog</label>
                  <button
                    onClick={showCustomDialogInput}
                    className="plus-btn"
                    title="Add character dialog"
                  >
                    +
                  </button>
                </div>
                
                {inputStates.customDialog && (
                  <div ref={dialogInputRef} className="space-y-4 mt-2">
                    <div className="flex gap-2">
                      <select
                        value={inputValues.newDialogCharacter}
                        onChange={(e) => handleNewDialogCharacterChange(e.target.value)}
                        className="custom-select"
                      >
                        <option value="">Select character</option>
                        {characters.map((char) => (
                          <option key={char.id} value={char.name}>
                            {char.name}
                          </option>
                        ))}
                        {formData.customCharacters.map((char, index) => (
                          <option key={`custom-${index}`} value={char}>
                            {char}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={inputValues.dialogMood}
                        onChange={(e) => setInputValues(prev => ({ ...prev, dialogMood: e.target.value }))}
                        placeholder="Enter mood/tone (e.g., serius, santai)"
                        className="custom-input"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={inputValues.customDialog}
                        onChange={(e) => handleCustomDialogChange(e.target.value)}
                        onKeyDown={handleCustomDialogKeyDown}
                        placeholder="Enter dialog text"
                        className="custom-input flex-grow"
                      />
                    </div>
                  </div>
                )}

                {formData.customDialogs.length > 0 && (
                  <div className="dialog-format mb-4">
                    {formData.customDialogs.map((dialog, index) => (
                      <div key={index} className="mb-2 flex justify-between items-center">
                        <span>[{dialog.character} ({dialog.mood}): "{dialog.dialog}"]</span>
                        <button
                          onClick={() => removeCustomDialog(index)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove dialog"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasNarrator}
                    onChange={(e) => setFormData({ ...formData, hasNarrator: e.target.checked })}
                    className="custom-checkbox"
                  />
                  <span className="text-lg font-semibold text-gray-700">Include Narrator</span>
                </label>
                
                {formData.hasNarrator && (
                  <div className="mt-4">
                    <label className="block text-lg font-semibold text-gray-700 mb-4">Narrator Mood</label>
                    <select
                      value={formData.narratorMood}
                      onChange={(e) => setFormData({ ...formData, narratorMood: e.target.value })}
                      className="custom-select w-full"
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="dramatic">Dramatic</option>
                      <option value="casual">Casual</option>
                      <option value="authoritative">Authoritative</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scene Settings */}
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Scene Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="custom-input w-full"
                  placeholder="e.g., coffee shop, park, office"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">Time of Day</label>
                <select
                  value={formData.timeOfDay}
                  onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                  className="custom-select w-full"
                >
                  <option value="dawn">Dawn</option>
                  <option value="morning">Morning</option>
                  <option value="day">Day</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                  <option value="midnight">Midnight</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">Weather</label>
                <select
                  value={formData.weather}
                  onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                  className="custom-select w-full"
                >
                  <option value="clear">Clear</option>
                  <option value="cloudy">Cloudy</option>
                  <option value="rainy">Rainy</option>
                  <option value="stormy">Stormy</option>
                  <option value="snowy">Snowy</option>
                  <option value="foggy">Foggy</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">Season</label>
                <select
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                  className="custom-select w-full"
                >
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="autumn">Autumn</option>
                  <option value="winter">Winter</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Prompt Section */}
        <div className="space-y-8">
          <div className="glass-card p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Generated Prompt</h3>
              <button
                onClick={generatePrompt}
                disabled={isGenerating || !formData.mainDescription.trim()}
                className="btn-highlight px-6 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate
                  </>
                )}
              </button>
            </div>

            {generatedPrompt ? (
              <div className="space-y-6">
                <textarea
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  className="custom-textarea w-full h-96 text-sm"
                  placeholder="Generated prompt will appear here..."
                />
                
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={copyPrompt}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={openGoogleTranslate}
                    className="translate-btn"
                  >
                    <Languages className="w-4 h-4" />
                    Translate
                  </button>
                  <button
                    onClick={saveToBank}
                    className="btn-highlight px-4 py-3 rounded-xl font-semibold flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save to Bank
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <Settings className="w-20 h-20 mx-auto mb-6 opacity-50" />
                <p className="text-xl font-semibold">Configure your settings and generate a prompt</p>
                <p className="text-lg">Fill in the main description to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualMode;