import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  generateAnomalyCharacters,
  generateAnomalyStory,
  generateAnomalyScenePrompt,
  generateTwistedStoryIdea
} from '../utils/api-optimized';
import { getSettings } from '../utils/database';
import { fetchBrainPrompt, getAvailableBrainStyles } from '../utils/storage';
import { AnomalyScenePrompt, APISettings } from '../types';
import { X, Plus, ChevronDown, ChevronUp } from 'lucide-react';

// Preset character definitions
const PRESET_CHARACTERS = [
  { id: 'tea-cup-doll', name: 'Tea Cup Doll', description: 'A delicate pink teacup with a baby doll face, long eyelashes, a pacifier, and a pink bow on the handle as an ear.' },
  { id: 'green-monkey', name: 'Green Monkey', description: 'A small green monkey with pink facial accents, sleepy eyes, and dressed in a banana peel.' },
  { id: 'plush-hippo', name: 'Plush Hippo', description: 'A plush-like purple hippo with dark gradient on head and a headset-like accessory.' },
  { id: 'train-conductor', name: 'Train Conductor', description: 'A toy train engine with human-like face, conductor’s hat, large expressive eyes, and blue clothing detail.' },
  { id: 'broccoli-man', name: 'Broccoli Man', description: 'A humanoid with a big red nose, broccoli-like hair and clothing, massive foot-like roots, and a colorful propeller hat.' },
  { id: 'toy-dinosaur-plane', name: 'Toy Dinosaur Plane', description: 'A hybrid of a dinosaur head and a metallic propeller plane body, complete with pacifier and cockpit on top.' },
  { id: 'walking-bats', name: 'Walking Bats', description: 'Two identical characters shaped like baseball bats with big smiles, cartoonish faces, and walking on their "handles".' },
  { id: 'happy-boy', name: 'Happy Boy', description: 'A cheerful young boy wearing a blue owl-themed sweater and cap, red shorts, and blue sneakers, radiating playful energy.' }
];

// Supporting character pool
const SUPPORTING_CHARACTERS = [
  { name: 'Wise Old Owl', description: 'Ancient owl with silver feathers, half-moon spectacles, and knowing golden eyes' },
  { name: 'Chatty Parrot', description: 'Colorful parrot with rainbow feathers, always talking and mimicking sounds' },
  { name: 'Grumpy Badger', description: 'Stocky badger with permanent frown, striped face, and surprisingly soft heart' },
  { name: 'Cheerful Rabbit', description: 'Bouncy rabbit with floppy ears, cotton tail, and infectious enthusiasm' },
  { name: 'Mysterious Cat', description: 'Sleek feline with mismatched eyes, silent paws, and enigmatic smile' },
  { name: 'Friendly Dog', description: 'Loyal canine with wagging tail, warm brown eyes, and protective nature' },
  { name: 'Curious Squirrel', description: 'Hyperactive squirrel with bushy tail, cheek pouches, and endless questions' },
  { name: 'Gentle Elephant', description: 'Wise pachyderm with kind eyes, graceful trunk, and excellent memory' },
  { name: 'Playful Monkey', description: 'Mischievous primate with nimble hands, expressive face, and acrobatic skills' },
  { name: 'Calm Turtle', description: 'Ancient turtle with weathered shell, slow movements, and patient wisdom' }
];

interface SelectedCharacter {
  name: string;
  description: string;
  type: 'preset' | 'custom' | 'supporting';
}

const AnomalyMode = () => {
  const [userIdea, setUserIdea] = useState('');
  const [karakterInput, setKarakterInput] = useState('');
  const [situasiInput, setSituasiInput] = useState('');
  const [elemenAnehInput, setElemenAnehInput] = useState('');
  const [languageOptions, setLanguageOptions] = useState({
    Language: 'Indonesia',
    Accent: 'Betawi'
  });
  const [selectedStyle, setSelectedStyle] = useState('larva_tuba');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [generatedPrompts, setGeneratedPrompts] = useState<AnomalyScenePrompt[]>([]);
  const [error, setError] = useState('');
  const [apiSettings, setApiSettings] = useState<APISettings | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');

  // Character selection states
  const [useCharacterSelection, setUseCharacterSelection] = useState(false);
  const [selectedCharacters, setSelectedCharacters] = useState<SelectedCharacter[]>([]);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const [showSupportingDropdown, setShowSupportingDropdown] = useState(false);
  const [customCharacterName, setCustomCharacterName] = useState('');
  const [customCharacterDescription, setCustomCharacterDescription] = useState('');
  const [needSupportingCharacters, setNeedSupportingCharacters] = useState(false);
  const [showCharacterSection, setShowCharacterSection] = useState(false);

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

  // Character selection helper functions
  const addPresetCharacter = (character: typeof PRESET_CHARACTERS[0]) => {
    if (selectedCharacters.length >= 3) {
      alert('Maximum 3 characters allowed');
      return;
    }
    const newCharacter: SelectedCharacter = {
      name: character.name,
      description: character.description,
      type: 'preset'
    };
    setSelectedCharacters([...selectedCharacters, newCharacter]);
    setShowPresetDropdown(false);
  };

  const addCustomCharacter = () => {
    if (!customCharacterName.trim() || !customCharacterDescription.trim()) {
      alert('Please enter both character name and description');
      return;
    }
    if (selectedCharacters.length >= 3) {
      alert('Maximum 3 characters allowed');
      return;
    }
    const newCharacter: SelectedCharacter = {
      name: customCharacterName.trim(),
      description: customCharacterDescription.trim(),
      type: 'custom'
    };
    setSelectedCharacters([...selectedCharacters, newCharacter]);
    setCustomCharacterName('');
    setCustomCharacterDescription('');
  };

  const removeCharacter = (index: number) => {
    setSelectedCharacters(selectedCharacters.filter((_, i) => i !== index));
  };

  const addSupportingCharacter = (character: typeof SUPPORTING_CHARACTERS[0]) => {
    if (selectedCharacters.length >= 3) {
      alert('Maximum 3 characters allowed');
      return;
    }
    const newCharacter: SelectedCharacter = {
      name: character.name,
      description: character.description,
      type: 'supporting'
    };
    setSelectedCharacters([...selectedCharacters, newCharacter]);
    setShowSupportingDropdown(false);
  };

  const getRandomSupportingCharacter = () => {
    const randomIndex = Math.floor(Math.random() * SUPPORTING_CHARACTERS.length);
    return SUPPORTING_CHARACTERS[randomIndex];
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
    // Get the appropriate dialog based on language selection
    const isEnglishLanguage = languageOptions.Accent === 'US' || languageOptions.Accent === 'British';
    const rawDialog = isEnglishLanguage ? sceneData.dialog_en : sceneData.dialog_id_gaul;

    // Ensure dialog has proper newlines between characters
    const dialogWithNewlines = rawDialog ? rawDialog.replace(/\]\s*\[/g, ']\n[') : '';

    // Compose the final prompt with the veo3_optimized_prompt
    const basePrompt = sceneData.veo3_optimized_prompt || `
${sceneData.visual_prompt}

${sceneData.audio_prompt}

${dialogWithNewlines}
    `.trim();

    // Add "Visual force (Brain Prompt):" prefix
    const finalPrompt = `Visual force (Brain Prompt):

${basePrompt}`;

    navigator.clipboard.writeText(finalPrompt);
    alert('Professional scenario format prompt successfully copied with Visual force (Brain Prompt)!');
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
      setLoadingMessage('Fetching visual style references from Brain Prompt...');
      const referencePrompt = await fetchBrainPrompt(selectedStyle);

      let characters;

      if (useCharacterSelection && selectedCharacters.length > 0) {
        // Use selected characters
        setLoadingMessage('Preparing selected characters...');

        // Fill up to 3 characters
        const finalCharacters = [...selectedCharacters];

        // Add supporting characters if needed
        if (needSupportingCharacters) {
          while (finalCharacters.length < 3) {
            const supportingChar = getRandomSupportingCharacter();
            finalCharacters.push({
              name: supportingChar.name,
              description: supportingChar.description,
              type: 'supporting'
            });
          }
        } else {
          // If not enough characters selected and no supporting characters needed, show error
          if (finalCharacters.length < 3) {
            throw new Error(`Please select 3 characters or enable supporting characters. Currently selected: ${finalCharacters.length}`);
          }
        }

        // Convert to expected format
        characters = {
          karakter_1: {
            nama: finalCharacters[0].name,
            deskripsi_fisik: finalCharacters[0].description
          },
          karakter_2: {
            nama: finalCharacters[1].name,
            deskripsi_fisik: finalCharacters[1].description
          },
          karakter_3: {
            nama: finalCharacters[2].name,
            deskripsi_fisik: finalCharacters[2].description
          }
        };
      } else {
        // Auto-generate characters as before
        setLoadingMessage('Creating anomaly characters...');
        characters = await generateAnomalyCharacters(userIdea, apiSettings);
      }

      // Validate characters structure
      if (!characters || !characters.karakter_1 || !characters.karakter_2 || !characters.karakter_3) {
        throw new Error('Invalid characters response from API. Please try again.');
      }

      // Validate each character has required properties
      const requiredProps = ['nama', 'deskripsi_fisik'];
      for (const key of ['karakter_1', 'karakter_2', 'karakter_3'] as const) {
        for (const prop of requiredProps) {
          if (!characters[key][prop as keyof typeof characters[typeof key]]) {
            throw new Error(`Character ${key} is missing required property: ${prop}`);
          }
        }
      }

      setLoadingMessage('Designing storyline & title...');
      const story = await generateAnomalyStory(characters, userIdea, apiSettings);

      // Validate story structure
      if (!story || !story.judul || !story.sinopsis_per_adegan || !Array.isArray(story.sinopsis_per_adegan)) {
        throw new Error('Invalid story response from API. Please try again.');
      }

      for (let i = 0; i < story.sinopsis_per_adegan.length; i++) {
        setLoadingMessage(`Crafting cinematography & dialogue for Scene ${i + 1} of ${story.sinopsis_per_adegan.length}...`);
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
        <title>Anomaly Mode: AI Video Generator untuk Cerita Surealis - Shabira Prompt Lab</title>
        <meta name="description" content="Gunakan mesin AI Anomaly Brainroot untuk membuat film pendek AI yang unik. Dapatkan prompt video sinematik dengan generator cerita surealis yang belum pernah ada." />
        <meta name="keywords" content="AI video generator, film pendek AI, generator cerita surealis, prompt video sinematik, Anomaly Brainroot, alternatif Veo3" />
      </Helmet>
      <h2 className="text-2xl font-bold mb-4">Anomaly Mode: AI Video Generator For Surrealist & Short Film Ai Stories</h2>
      <p className="mb-6">Surrealist Story Generator, Cinematic with Gemini Technology for Alternative VEO3.</p>

      <fieldset className="mb-6 p-4 border rounded">
        <legend className="px-2 font-bold">Story Idee Generator (Optional)</legend>

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
          {isLoading ? 'Memproses...' : 'Buat Prompt Cerita Surealis'}
        </button>
      </fieldset>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Basic Film Ideas:</label>
        <textarea
          className="w-full p-2 border rounded"
          value={userIdea}
          onChange={(e) => setUserIdea(e.target.value)}
          rows={4}
          placeholder="Masukkan ide dasar film surealis Anda..."
        />
      </div>

      {/* Character Selection Section */}
      <fieldset className="mb-6 p-4 border rounded bg-purple-50">
        <legend className="px-2 font-bold flex items-center gap-2">
          <span>Character Selection (Optional)</span>
          <button
            type="button"
            onClick={() => setShowCharacterSection(!showCharacterSection)}
            className="text-purple-600 hover:text-purple-800"
          >
            {showCharacterSection ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </legend>

        {showCharacterSection && (
          <div className="space-y-4 mt-4">
            {/* Toggle for using character selection */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useCharacterSelection"
                checked={useCharacterSelection}
                onChange={(e) => setUseCharacterSelection(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <label htmlFor="useCharacterSelection" className="font-medium">
                Use custom character selection instead of auto-generation
              </label>
            </div>

            {useCharacterSelection && (
              <>
                {/* Selected Characters Display */}
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Characters ({selectedCharacters.length}/3):</h4>
                  {selectedCharacters.length === 0 ? (
                    <p className="text-gray-500 italic">No characters selected yet</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedCharacters.map((char, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-white rounded border">
                          <div className="flex-1">
                            <div className="font-medium">{char.name}</div>
                            <div className="text-sm text-gray-600">{char.description}</div>
                            <div className="text-xs text-purple-600 mt-1">Type: {char.type}</div>
                          </div>
                          <button
                            onClick={() => removeCharacter(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preset Character Selection */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                    disabled={selectedCharacters.length >= 3}
                    className={`w-full p-3 text-left border rounded flex items-center justify-between ${selectedCharacters.length >= 3 ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'
                      }`}
                  >
                    <span>Select Preset Character</span>
                    <ChevronDown className="w-5 h-5" />
                  </button>

                  {showPresetDropdown && selectedCharacters.length < 3 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {PRESET_CHARACTERS.map((character) => (
                        <button
                          key={character.id}
                          type="button"
                          onClick={() => addPresetCharacter(character)}
                          className="w-full p-3 text-left hover:bg-purple-50 border-b last:border-b-0"
                        >
                          <div className="font-medium">{character.name}</div>
                          <div className="text-sm text-gray-600">{character.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Supporting Character Selection */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSupportingDropdown(!showSupportingDropdown)}
                    disabled={selectedCharacters.length >= 3}
                    className={`w-full p-3 text-left border rounded flex items-center justify-between ${selectedCharacters.length >= 3 ? 'bg-gray-100 cursor-not-allowed' : 'bg-green-50 hover:bg-green-100'
                      }`}
                  >
                    <span>Select Supporting Character</span>
                    <ChevronDown className="w-5 h-5" />
                  </button>

                  {showSupportingDropdown && selectedCharacters.length < 3 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {SUPPORTING_CHARACTERS.map((character, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => addSupportingCharacter(character)}
                          className="w-full p-3 text-left hover:bg-green-50 border-b last:border-b-0"
                        >
                          <div className="font-medium">{character.name}</div>
                          <div className="text-sm text-gray-600">{character.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Character Input */}
                <div className="space-y-2">
                  <h4 className="font-medium">Add Custom Character:</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Character name"
                      value={customCharacterName}
                      onChange={(e) => setCustomCharacterName(e.target.value)}
                      className="flex-1 p-2 border rounded"
                      disabled={selectedCharacters.length >= 3}
                    />
                    <button
                      type="button"
                      onClick={addCustomCharacter}
                      disabled={selectedCharacters.length >= 3 || !customCharacterName.trim() || !customCharacterDescription.trim()}
                      className={`px-4 py-2 rounded flex items-center gap-2 ${selectedCharacters.length >= 3 || !customCharacterName.trim() || !customCharacterDescription.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  <textarea
                    placeholder="Character description (physical appearance, personality, etc.)"
                    value={customCharacterDescription}
                    onChange={(e) => setCustomCharacterDescription(e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={2}
                    disabled={selectedCharacters.length >= 3}
                  />
                </div>

                {/* Supporting Characters Auto-Fill Option */}
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded">
                  <input
                    type="checkbox"
                    id="needSupportingCharacters"
                    checked={needSupportingCharacters}
                    onChange={(e) => setNeedSupportingCharacters(e.target.checked)}
                    className="w-4 h-4 text-yellow-600 rounded"
                  />
                  <label htmlFor="needSupportingCharacters" className="text-sm">
                    Auto-fill remaining slots with random supporting characters if less than 3 characters selected
                  </label>
                </div>
              </>
            )}
          </div>
        )}
      </fieldset>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block mb-2 font-medium">Language:</label>
          <select
            className="w-full p-2 border rounded"
            value={languageOptions.Language}
            onChange={(e) => setLanguageOptions(prev => ({
              ...prev,
              Language: e.target.value
            }))}
          >
            <option value="Indonesia">Indonesia</option>
            <option value="Inggris">Inggris</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 font-medium">Accent:</label>
          <select
            className="w-full p-2 border rounded"
            value={languageOptions.Accent}
            onChange={(e) => setLanguageOptions(prev => ({
              ...prev,
              Accent: e.target.value
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
          <label className="block mb-2 font-medium">🧠 Visual force (Brain Prompt):</label>
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
          {isLoading ? 'Memproses...' : 'Create AI Film with Prompt Generator'}
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
              <strong>Dialog ({languageOptions.Accent === 'US' || languageOptions.Accent === 'British' ? 'English' : 'Indonesian'}):</strong>
              <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-2 rounded">
                {languageOptions.Accent === 'US' || languageOptions.Accent === 'British'
                  ? prompt.dialog_en
                  : prompt.dialog_id_gaul}
              </pre>
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
              <strong className="text-green-800">🎯Optimized VeO3 Prompt (Use this!):</strong>
              <textarea
                className="w-full p-2 bg-white border rounded mt-2"
                value={`Visual force (Brain Prompt):\n\n${prompt.veo3_optimized_prompt}`}
                readOnly
                rows={8}
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
