// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Target, Megaphone, Palette, Camera, Mic, Save, Copy, Wand2 } from 'lucide-react';
import { Character, VideoObject, VideoPrompt, Scene, APISettings } from '../types';
import { getCharacters, getObjects, savePrompt, getSettings } from '../utils/database';
import { callGeminiAPIForJSON, ensureJSONResponse } from '../utils/api';

const MarketingMode: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [objects, setObjects] = useState<VideoObject[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiSettings, setApiSettings] = useState<APISettings | null>(null);

  const [formData, setFormData] = useState({
    // Marketing Specific
    marketingGoal: 'brand-awareness',
    productName: '',
    targetAudience: 'general',
    callToAction: '',

    // Visual & Audio
    marketingStyle: 'professional',
    visualTone: 'professional',
    backgroundMusic: 'upbeat',
    brandColors: '',

    // Same as Manual Mode
    mainDescription: '',
    selectedCharacters: [] as string[],
    selectedObjects: [] as string[],
    hasNarrator: true,
    narratorMood: 'professional',
    cameraMovement: 'dynamic',
    location: '',
    timeOfDay: 'day',
    weather: 'clear',
    environmentalSound: 'ambient'
  });

  useEffect(() => {
    loadAssets();
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

  const marketingGoals = [
    { value: 'brand-awareness', label: 'Brand Awareness' },
    { value: 'product-launch', label: 'Product Launch' },
    { value: 'sales-conversion', label: 'Sales Conversion' },
    { value: 'customer-testimonial', label: 'Customer Testimonial' },
    { value: 'educational', label: 'Educational Content' },
    { value: 'social-media', label: 'Social Media Campaign' },
    { value: 'event-promotion', label: 'Event Promotion' }
  ];

  const targetAudiences = [
    { value: 'general', label: 'General Audience' },
    { value: 'young-adults', label: 'Young Adults (18-30)' },
    { value: 'professionals', label: 'Business Professionals' },
    { value: 'families', label: 'Families with Children' },
    { value: 'seniors', label: 'Seniors (55+)' },
    { value: 'students', label: 'Students' },
    { value: 'entrepreneurs', label: 'Entrepreneurs' }
  ];

  const marketingStyles = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual & Friendly' },
    { value: 'luxury', label: 'Luxury & Premium' },
    { value: 'modern', label: 'Modern & Tech' },
    { value: 'traditional', label: 'Traditional & Classic' },
    { value: 'creative', label: 'Creative & Artistic' },
    { value: 'minimalist', label: 'Minimalist' }
  ];

  const visualTones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'energetic', label: 'Energetic' },
    { value: 'calm', label: 'Calm & Serene' },
    { value: 'bold', label: 'Bold & Dynamic' },
    { value: 'warm', label: 'Warm & Inviting' },
    { value: 'sleek', label: 'Sleek & Modern' }
  ];

  const musicStyles = [
    { value: 'upbeat', label: 'Upbeat & Energetic' },
    { value: 'corporate', label: 'Corporate & Professional' },
    { value: 'ambient', label: 'Ambient & Subtle' },
    { value: 'inspiring', label: 'Inspiring & Motivational' },
    { value: 'modern', label: 'Modern & Electronic' },
    { value: 'acoustic', label: 'Acoustic & Natural' },
    { value: 'none', label: 'No Background Music' }
  ];

  const cameraMovements = [
    { value: 'dynamic', label: 'Dynamic Movement' },
    { value: 'smooth-pan', label: 'Smooth Pan' },
    { value: 'zoom-focus', label: 'Zoom & Focus' },
    { value: 'static-professional', label: 'Static Professional' },
    { value: 'tracking', label: 'Product Tracking' },
    { value: 'reveal', label: 'Dramatic Reveal' }
  ];

  const generateMarketingPrompt = async () => {
    if (!apiSettings || !apiSettings.isActive) {
      alert('Please configure and validate your API key in the API Settings first.');
      return;
    }

    setIsGenerating(true);
    try {
      const selectedCharacterDetails = characters
        .filter(char => formData.selectedCharacters.includes(char.id))
        .map(char => `${char.name} (${char.age}yo, ${char.hairColor} hair, ${char.faceShape} face, ${char.bodyShape} body, ${char.height} height, accessories: ${char.accessories}, additional: ${char.additionalFeatures})`)
        .join('; ');

      const selectedObjectDetails = objects
        .filter(obj => formData.selectedObjects.includes(obj.id))
        .map(obj => `${obj.name} (${obj.category}): ${obj.description}`)
        .join('; ');

      const promptTemplate = `Create a professional marketing video prompt with these specifications:

MARKETING OBJECTIVE:
- Goal: ${formData.marketingGoal}
- Product/Service: ${formData.productName}
- Target Audience: ${formData.targetAudience}
- Call to Action: ${formData.callToAction}

MAIN CONCEPT: ${formData.mainDescription}

CHARACTERS: ${selectedCharacterDetails || 'Professional spokesperson or customer'}

PRODUCTS/OBJECTS: ${selectedObjectDetails || formData.productName}

VISUAL STYLE:
- Marketing Style: ${formData.marketingStyle}
- Visual Tone: ${formData.visualTone}
- Brand Colors: ${formData.brandColors || 'Brand appropriate colors'}
- Camera Movement: ${formData.cameraMovement}

AUDIO DESIGN:
- Background Music: ${formData.backgroundMusic}
- Narrator: ${formData.hasNarrator ? 'Yes' : 'No'}
- Narrator Mood: ${formData.narratorMood}
- Environmental Sound: ${formData.environmentalSound}

SCENE SETTINGS:
- Location: ${formData.location || 'Professional setting appropriate for the product'}
- Time of Day: ${formData.timeOfDay}
- Weather: ${formData.weather}

Return ONLY a JSON object with this exact structure:
{
  "videoPrompt": "Complete detailed video production prompt suitable for AI video generation",
  "marketingMessage": "Clear marketing message extracted from the prompt",
  "targetAudience": "Target audience description",
  "callToAction": "Call to action statement",
  "visualElements": ["visual element 1", "visual element 2", "visual element 3"],
  "audioElements": ["audio element 1", "audio element 2", "audio element 3"],
  "duration": 8,
  "style": "marketing style description",
  "tone": "visual tone description"
}

The video prompt should:
1. Clearly communicate the marketing message
2. Appeal to the target audience
3. Showcase the product/service effectively
4. Include compelling visual and audio elements
5. Incorporate the call to action naturally
6. Maintain professional marketing standards`;

      const result = await callGeminiAPIForJSON(promptTemplate, undefined, apiSettings);
      ensureJSONResponse(result, ['videoPrompt', 'marketingMessage', 'targetAudience', 'callToAction']);
      setGeneratedPrompt(result.videoPrompt);
    } catch (error) {
      console.error('Failed to generate marketing prompt:', error);
      alert('Failed to generate marketing prompt. Please check your API settings.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = async () => {
    try {
      const jsonOutput = {
        videoPrompt: generatedPrompt,
        marketingMessage: formData.mainDescription,
        targetAudience: formData.targetAudience,
        callToAction: formData.callToAction,
        marketingStyle: formData.marketingStyle,
        visualTone: formData.visualTone,
        duration: 8
      };

      await navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2));
      alert('Marketing prompt (JSON format) copied to clipboard!');
    } catch {
      alert('Failed to copy prompt');
    }
  };

  const saveToBank = async () => {
    if (!generatedPrompt) {
      alert('Please generate a prompt first');
      return;
    }

    const title = prompt('Enter a title for this marketing prompt:');
    if (!title) return;

    try {
      const scene: Scene = {
        id: `scene_${Date.now()}`,
        sceneNumber: 1,
        visualDescription: generatedPrompt,
        location: formData.location,
        time: formData.timeOfDay,
        season: 'N/A',
        weather: formData.weather,
        cinematography: {
          cameraTechniques: [formData.cameraMovement],
          lighting: formData.visualTone,
          colorPalette: 'Brand-focused',
          additionalVisuals: []
        },
        audio: {
          dialogue: [],
          ambientSounds: [{ name: formData.environmentalSound, volume: '60%' }],
          audioMix: 'Professional mix with background music'
        },
        duration: 8,
        characters: formData.selectedCharacters,
        objects: formData.selectedObjects
      };

      const videoPrompt: VideoPrompt = {
        id: `marketing_${Date.now()}`,
        title,
        type: 'marketing',
        mainDescription: formData.mainDescription,
        scenes: [scene],
        characters: characters.filter(char => formData.selectedCharacters.includes(char.id)),
        objects: objects.filter(obj => formData.selectedObjects.includes(obj.id)),
        settings: {
          resolution: '1080p',
          frameRate: 30,
          aspectRatio: '16:9',
          duration: 8,
          captions: {
            enabled: true,
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

      await savePrompt(videoPrompt);
      alert('Marketing prompt saved to bank successfully!');
    } catch (error) {
      console.error('Failed to save prompt:', error);
      alert('Failed to save prompt to bank');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Marketing Mode: Prompt Video TikTok & AI untuk Video Vertikal 9:16 - Shabira Prompt Lab</title>
        <meta name="description" content="Buat prompt video TikTok dan konten marketing vertikal 9:16 dengan AI. Generator video promosi profesional untuk target audiens yang efektif." />
        <meta name="keywords" content="prompt video TikTok, AI untuk video vertikal 9:16, video marketing AI, konten promosi, AI video generator, video vertikal" />
      </Helmet>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Marketing Mode - Professional Video Creation</h2>
        <p className="text-lg text-gray-600">
          Create compelling marketing videos with targeted messaging and professional production values
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form Sections */}
        <div className="xl:col-span-2 space-y-6">
          {/* Marketing Strategy */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="w-6 h-6" />
              Marketing Strategy
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marketing Goal</label>
                <select
                  value={formData.marketingGoal}
                  onChange={(e) => setFormData({ ...formData, marketingGoal: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {marketingGoals.map((goal) => (
                    <option key={goal.value} value={goal.value}>
                      {goal.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {targetAudiences.map((audience) => (
                    <option key={audience.value} value={audience.value}>
                      {audience.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product/Service Name</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product or service name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Call to Action</label>
                <input
                  type="text"
                  value={formData.callToAction}
                  onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Visit our website, Call now, Buy today"
                />
              </div>
            </div>
          </div>

          {/* Main Description */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Megaphone className="w-6 h-6" />
              Marketing Message
            </h3>
            <textarea
              value={formData.mainDescription}
              onChange={(e) => setFormData({ ...formData, mainDescription: e.target.value })}
              className="w-full h-24 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe your marketing message, key benefits, and what makes your product/service unique..."
            />
          </div>

          {/* Characters & Products */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Characters & Products</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Characters (Spokespersons)</label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {characters.map((character) => (
                    <label key={character.id} className="flex items-center gap-2">
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
                        className="rounded"
                      />
                      <span className="text-sm">{character.name}</span>
                    </label>
                  ))}
                  {characters.length === 0 && (
                    <p className="text-sm text-gray-500">No characters available. Create some in Asset Management.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Products/Objects</label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {objects.map((object) => (
                    <label key={object.id} className="flex items-center gap-2">
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
                        className="rounded"
                      />
                      <span className="text-sm">{object.name}</span>
                    </label>
                  ))}
                  {objects.length === 0 && (
                    <p className="text-sm text-gray-500">No objects available. Create some in Asset Management.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Visual & Brand Settings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Palette className="w-6 h-6" />
              Visual & Brand Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marketing Style</label>
                <select
                  value={formData.marketingStyle}
                  onChange={(e) => setFormData({ ...formData, marketingStyle: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {marketingStyles.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visual Tone</label>
                <select
                  value={formData.visualTone}
                  onChange={(e) => setFormData({ ...formData, visualTone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {visualTones.map((tone) => (
                    <option key={tone.value} value={tone.value}>
                      {tone.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Music</label>
                <select
                  value={formData.backgroundMusic}
                  onChange={(e) => setFormData({ ...formData, backgroundMusic: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {musicStyles.map((music) => (
                    <option key={music.value} value={music.value}>
                      {music.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Colors</label>
                <input
                  type="text"
                  value={formData.brandColors}
                  onChange={(e) => setFormData({ ...formData, brandColors: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Blue and white, Corporate colors"
                />
              </div>
            </div>
          </div>

          {/* Camera & Production */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Camera className="w-6 h-6" />
              Camera & Production
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Camera Movement</label>
                <select
                  value={formData.cameraMovement}
                  onChange={(e) => setFormData({ ...formData, cameraMovement: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {cameraMovements.map((movement) => (
                    <option key={movement.value} value={movement.value}>
                      {movement.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Modern office, Studio, Outdoor setting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time of Day</label>
                <select
                  value={formData.timeOfDay}
                  onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="day">Day</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weather</label>
                <select
                  value={formData.weather}
                  onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="clear">Clear</option>
                  <option value="cloudy">Cloudy</option>
                  <option value="sunny">Sunny</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audio & Narration */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Mic className="w-6 h-6" />
              Audio & Narration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasNarrator}
                    onChange={(e) => setFormData({ ...formData, hasNarrator: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Include Professional Narrator</span>
                </label>
              </div>

              {formData.hasNarrator && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Narrator Mood</label>
                  <select
                    value={formData.narratorMood}
                    onChange={(e) => setFormData({ ...formData, narratorMood: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="authoritative">Authoritative</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="trustworthy">Trustworthy</option>
                  </select>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Environmental Sound</label>
                <input
                  type="text"
                  value={formData.environmentalSound}
                  onChange={(e) => setFormData({ ...formData, environmentalSound: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Office ambiance, Outdoor sounds, Studio silence"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Generated Prompt Section */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Marketing Prompt</h3>
              <button
                onClick={generateMarketingPrompt}
                disabled={isGenerating || !formData.mainDescription.trim() || !formData.productName.trim() || !apiSettings?.isActive}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate
                  </>
                )}
              </button>
            </div>

            {generatedPrompt ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-800 mb-2">JSON Format:</h5>
                  <pre className="whitespace-pre-wrap text-xs text-gray-600 font-mono bg-white p-3 rounded border overflow-x-auto max-h-64">
                    {JSON.stringify({
                      videoPrompt: generatedPrompt,
                      marketingMessage: formData.mainDescription,
                      targetAudience: formData.targetAudience,
                      callToAction: formData.callToAction,
                      marketingStyle: formData.marketingStyle,
                      visualTone: formData.visualTone,
                      duration: 8
                    }, null, 2)}
                  </pre>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Raw Prompt:</h5>
                  <textarea
                    value={generatedPrompt}
                    onChange={(e) => setGeneratedPrompt(e.target.value)}
                    className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    placeholder="Generated marketing prompt will appear here..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={copyPrompt}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={saveToBank}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save to Bank
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Configure your marketing strategy</p>
                <p className="text-sm">Fill in the product name and marketing message to get started</p>
              </div>
            )}
          </div>

          {/* Marketing Tips */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <h4 className="font-bold text-purple-800 mb-2">🎯 Marketing Video Tips</h4>
            <ul className="text-purple-700 space-y-1 text-sm">
              <li>• Keep your message clear and focused</li>
              <li>• Highlight key benefits early in the video</li>
              <li>• Use emotional triggers appropriate for your audience</li>
              <li>• Include a strong, clear call to action</li>
              <li>• Maintain consistent brand visual identity</li>
              <li>• Test different versions for optimal performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingMode;
