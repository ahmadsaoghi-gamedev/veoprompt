// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { RotateCcw, Wand2, Copy, Download, Eye, Brain, Sparkles, Film, Users, Camera } from 'lucide-react';
import { callGeminiAPIForJSON, ensureJSONResponse } from '../utils/api';
import { getSettings } from '../utils/database';
import { APISettings } from '../types';

interface CharacterProfile {
    id: string;
    name: string;
    age: number;
    personality: string;
    appearance: string;
    backstory: string;
    speakingStyle: string;
    emotionalRange: string[];
    relationships: { [key: string]: string };
    characterArc: string;
    visualStyle: string;
    voiceCharacteristics: string;
}

interface SceneData {
    id: string;
    sceneNumber: number;
    duration: number;
    prompt: string;
    characters: CharacterProfile[];
    objects: string[];
    location: string;
    timeOfDay: string;
    weather: string;
    mood: string;
    cinematography: {
        cameraWork: string;
        lighting: string;
        colorPalette: string;
        visualEffects: string[];
    };
    audio: {
        dialogue: string[];
        ambientSounds: string[];
        music: string;
        soundEffects: string[];
    };
    storyBeat: string;
    characterDevelopment: string;
    visualMetaphors: string[];
    antiMainstreamElements: string[];
    continuityNotes: string;
    nextSceneSetup: string;
}

interface FilmProject {
    id: string;
    title: string;
    genre: string;
    theme: string;
    targetDuration: number;
    totalScenes: number;
    characters: CharacterProfile[];
    storyOutline: string;
    visualStyle: string;
    antiMainstreamApproach: string;
    scenes: SceneData[];
    createdAt: Date;
    updatedAt: Date;
}

const AdvancedFilmGenerator: React.FC = () => {
    const [currentProject, setCurrentProject] = useState<FilmProject | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [, setCurrentSceneIndex] = useState(0);
    const [apiSettings, setApiSettings] = useState<APISettings | null>(null);
    const [showCharacterBuilder, setShowCharacterBuilder] = useState(false);
    const [newCharacter, setNewCharacter] = useState<Partial<CharacterProfile>>({
        name: '',
        age: 25,
        personality: '',
        appearance: '',
        backstory: '',
        speakingStyle: '',
        emotionalRange: [],
        relationships: {},
        characterArc: '',
        visualStyle: '',
        voiceCharacteristics: ''
    });

    // Project configuration
    const [projectConfig, setProjectConfig] = useState({
        title: '',
        genre: 'drama',
        theme: '',
        targetDuration: 24, // 3 scenes x 8 seconds
        antiMainstreamLevel: 'high',
        visualStyle: 'cinematic',
        storyComplexity: 'medium'
    });

    const genres = [
        { value: 'drama', label: 'Drama', description: 'Character-driven storytelling' },
        { value: 'thriller', label: 'Thriller', description: 'Suspense and tension' },
        { value: 'sci-fi', label: 'Sci-Fi', description: 'Futuristic concepts' },
        { value: 'fantasy', label: 'Fantasy', description: 'Magical elements' },
        { value: 'noir', label: 'Noir', description: 'Dark, moody atmosphere' },
        { value: 'experimental', label: 'Experimental', description: 'Avant-garde approach' },
        { value: 'documentary', label: 'Documentary', description: 'Realistic portrayal' },
        { value: 'surreal', label: 'Surreal', description: 'Dreamlike, abstract' }
    ];

    const antiMainstreamElements = [
        'Unconventional narrative structure',
        'Unique visual metaphors',
        'Non-linear storytelling',
        'Experimental cinematography',
        'Unusual character perspectives',
        'Abstract symbolism',
        'Minimalist approach',
        'Maximalist visual style',
        'Breaking fourth wall',
        'Meta-narrative elements',
        'Unconventional dialogue',
        'Unique sound design',
        'Experimental editing',
        'Unusual color grading',
        'Non-traditional pacing'
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

    const generateCharacterProfile = async (characterName: string): Promise<CharacterProfile> => {
        if (!apiSettings?.isActive) throw new Error('API not configured');

        const prompt = `Create a detailed character profile for "${characterName}" in a ${projectConfig.genre} film with ${projectConfig.antiMainstreamLevel} anti-mainstream elements.

Character Requirements:
- Name: ${characterName}
- Genre: ${projectConfig.genre}
- Anti-mainstream level: ${projectConfig.antiMainstreamLevel}
- Visual style: ${projectConfig.visualStyle}

Return ONLY a JSON object with this exact structure:
{
  "id": "unique_character_id",
  "name": "${characterName}",
  "age": 25,
  "personality": "Detailed personality description with unique quirks",
  "appearance": "Detailed physical description including distinctive features",
  "backstory": "Compelling backstory that influences current behavior",
  "speakingStyle": "Unique way of speaking, word choices, speech patterns",
  "emotionalRange": ["emotion1", "emotion2", "emotion3"],
  "relationships": {"other_character": "relationship_description"},
  "characterArc": "How this character will develop throughout the story",
  "visualStyle": "How this character should be visually represented",
  "voiceCharacteristics": "Voice tone, accent, speaking mannerisms"
}

Make this character unique, memorable, and suitable for anti-mainstream storytelling.`;

        const result = await callGeminiAPIForJSON(prompt, undefined, apiSettings);
        ensureJSONResponse(result, ['id', 'name', 'personality', 'appearance', 'backstory']);

        return {
            id: result.id || `char_${Date.now()}`,
            name: result.name,
            age: result.age || 25,
            personality: result.personality,
            appearance: result.appearance,
            backstory: result.backstory,
            speakingStyle: result.speakingStyle,
            emotionalRange: result.emotionalRange || [],
            relationships: result.relationships || {},
            characterArc: result.characterArc,
            visualStyle: result.visualStyle,
            voiceCharacteristics: result.voiceCharacteristics
        };
    };

    const generateScene = async (sceneNumber: number, previousScene?: SceneData): Promise<SceneData> => {
        if (!apiSettings?.isActive) throw new Error('API not configured');
        if (!currentProject) throw new Error('No project loaded');

        const characters = currentProject.characters;
        // const characterNames = characters.map(c => c.name).join(', ');
        const characterProfiles = characters.map(c => `${c.name}: ${c.personality} (${c.appearance})`).join('; ');

        const continuityContext = previousScene ? `
CONTINUITY FROM PREVIOUS SCENE:
- Previous location: ${previousScene.location}
- Previous mood: ${previousScene.mood}
- Character states: ${previousScene.characters.map(c => `${c.name}: ${c.emotionalRange[0] || 'neutral'}`).join(', ')}
- Story beat: ${previousScene.storyBeat}
- Next scene setup: ${previousScene.nextSceneSetup}
` : '';

        const prompt = `Generate Scene ${sceneNumber} of a ${projectConfig.genre} film titled "${projectConfig.title}".

PROJECT CONTEXT:
- Genre: ${projectConfig.genre}
- Theme: ${projectConfig.theme}
- Anti-mainstream level: ${projectConfig.antiMainstreamLevel}
- Visual style: ${projectConfig.visualStyle}
- Story complexity: ${projectConfig.storyComplexity}

CHARACTERS IN THIS SCENE:
${characterProfiles}

${continuityContext}

SCENE REQUIREMENTS:
- Duration: 8 seconds
- Must advance the story meaningfully
- Maintain character consistency
- Include anti-mainstream elements: ${antiMainstreamElements.slice(0, 3).join(', ')}
- Create visual metaphors
- Develop character relationships
- Set up next scene

Return ONLY a JSON object with this exact structure:
{
  "id": "scene_${sceneNumber}_${Date.now()}",
  "sceneNumber": ${sceneNumber},
  "duration": 8,
  "prompt": "Detailed 8-second scene description for AI video generation",
  "characters": [${characters.map(c => `{"id": "${c.id}", "name": "${c.name}", "personality": "${c.personality}", "appearance": "${c.appearance}", "speakingStyle": "${c.speakingStyle}", "emotionalRange": ${JSON.stringify(c.emotionalRange)}, "relationships": ${JSON.stringify(c.relationships)}, "characterArc": "${c.characterArc}", "visualStyle": "${c.visualStyle}", "voiceCharacteristics": "${c.voiceCharacteristics}"}`).join(', ')}],
  "objects": ["object1", "object2"],
  "location": "Detailed location description",
  "timeOfDay": "morning/afternoon/evening/night",
  "weather": "clear/cloudy/rainy/stormy",
  "mood": "emotional tone of the scene",
  "cinematography": {
    "cameraWork": "Detailed camera movement and framing",
    "lighting": "Lighting setup and mood",
    "colorPalette": "Color scheme and grading",
    "visualEffects": ["effect1", "effect2"]
  },
  "audio": {
    "dialogue": ["Character dialogue lines"],
    "ambientSounds": ["background sound1", "background sound2"],
    "music": "Music style and mood",
    "soundEffects": ["sfx1", "sfx2"]
  },
  "storyBeat": "What this scene accomplishes in the story",
  "characterDevelopment": "How characters develop in this scene",
  "visualMetaphors": ["metaphor1", "metaphor2"],
  "antiMainstreamElements": ["element1", "element2"],
  "continuityNotes": "Notes for maintaining continuity",
  "nextSceneSetup": "How this scene sets up the next one"
}

Make this scene compelling, unique, and anti-mainstream while maintaining character consistency.`;

        const result = await callGeminiAPIForJSON(prompt, undefined, apiSettings);
        ensureJSONResponse(result, ['id', 'sceneNumber', 'prompt', 'characters', 'location', 'mood']);

        return {
            id: result.id,
            sceneNumber: result.sceneNumber,
            duration: result.duration || 8,
            prompt: result.prompt,
            characters: result.characters || characters,
            objects: result.objects || [],
            location: result.location,
            timeOfDay: result.timeOfDay,
            weather: result.weather,
            mood: result.mood,
            cinematography: result.cinematography || {
                cameraWork: '',
                lighting: '',
                colorPalette: '',
                visualEffects: []
            },
            audio: result.audio || {
                dialogue: [],
                ambientSounds: [],
                music: '',
                soundEffects: []
            },
            storyBeat: result.storyBeat,
            characterDevelopment: result.characterDevelopment,
            visualMetaphors: result.visualMetaphors || [],
            antiMainstreamElements: result.antiMainstreamElements || [],
            continuityNotes: result.continuityNotes,
            nextSceneSetup: result.nextSceneSetup
        };
    };

    const createNewProject = async () => {
        if (!apiSettings?.isActive) {
            alert('Please configure your API key first.');
            return;
        }

        if (!projectConfig.title.trim() || !projectConfig.theme.trim()) {
            alert('Please enter project title and theme.');
            return;
        }

        setIsGenerating(true);
        try {
            const project: FilmProject = {
                id: `project_${Date.now()}`,
                title: projectConfig.title,
                genre: projectConfig.genre,
                theme: projectConfig.theme,
                targetDuration: projectConfig.targetDuration,
                totalScenes: Math.ceil(projectConfig.targetDuration / 8),
                characters: [],
                storyOutline: '',
                visualStyle: projectConfig.visualStyle,
                antiMainstreamApproach: projectConfig.antiMainstreamLevel,
                scenes: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            setCurrentProject(project);
            setCurrentSceneIndex(0);
        } catch (error) {
            console.error('Failed to create project:', error);
            alert('Failed to create project');
        } finally {
            setIsGenerating(false);
        }
    };

    const addCharacter = async () => {
        if (!newCharacter.name?.trim()) {
            alert('Please enter character name');
            return;
        }

        try {
            const character = await generateCharacterProfile(newCharacter.name);
            setCurrentProject(prev => prev ? {
                ...prev,
                characters: [...prev.characters, character]
            } : null);
            setNewCharacter({
                name: '',
                age: 25,
                personality: '',
                appearance: '',
                backstory: '',
                speakingStyle: '',
                emotionalRange: [],
                relationships: {},
                characterArc: '',
                visualStyle: '',
                voiceCharacteristics: ''
            });
            setShowCharacterBuilder(false);
        } catch (error) {
            console.error('Failed to generate character:', error);
            alert('Failed to generate character');
        }
    };

    const generateNextScene = async () => {
        if (!currentProject || !apiSettings?.isActive) return;

        setIsGenerating(true);
        try {
            const previousScene = currentProject.scenes[currentProject.scenes.length - 1];
            const newScene = await generateScene(currentProject.scenes.length + 1, previousScene);

            setCurrentProject(prev => prev ? {
                ...prev,
                scenes: [...prev.scenes, newScene],
                updatedAt: new Date()
            } : null);

            setCurrentSceneIndex(currentProject.scenes.length);
        } catch (error) {
            console.error('Failed to generate scene:', error);
            alert('Failed to generate scene');
        } finally {
            setIsGenerating(false);
        }
    };

    const copySceneAsJSON = (scene: SceneData) => {
        const jsonOutput = {
            sceneNumber: scene.sceneNumber,
            duration: scene.duration,
            prompt: scene.prompt,
            characters: scene.characters.map(c => ({
                name: c.name,
                personality: c.personality,
                appearance: c.appearance,
                speakingStyle: c.speakingStyle
            })),
            location: scene.location,
            timeOfDay: scene.timeOfDay,
            weather: scene.weather,
            mood: scene.mood,
            cinematography: scene.cinematography,
            audio: scene.audio,
            storyBeat: scene.storyBeat,
            characterDevelopment: scene.characterDevelopment,
            visualMetaphors: scene.visualMetaphors,
            antiMainstreamElements: scene.antiMainstreamElements
        };

        navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2));
        alert('Scene (JSON format) copied to clipboard!');
    };

    const exportProject = () => {
        if (!currentProject) return;

        const exportData = {
            ...currentProject,
            exportedAt: new Date().toISOString(),
            totalDuration: currentProject.scenes.reduce((acc, scene) => acc + scene.duration, 0)
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentProject.title.replace(/\s+/g, '_')}_film_project.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <Helmet>
                <title>Advanced Film Generator - AI-Powered Scene-by-Scene Creation - Shabira Prompt Lab</title>
                <meta name="description" content="Create anti-mainstream short films with consistent characters and advanced AI scene generation. Professional film production tool." />
                <meta name="keywords" content="AI film generator, scene generator, character consistency, anti-mainstream, short film, cinematic AI" />
            </Helmet>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                        <Film className="w-12 h-12 text-purple-400" />
                        Advanced Film Generator
                    </h1>
                    <p className="text-xl text-purple-200">
                        Create Anti-Mainstream Short Films with Consistent Characters
                    </p>
                </div>

                {!currentProject ? (
                    /* Project Setup */
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                            <Wand2 className="w-8 h-8 text-purple-400" />
                            Create New Film Project
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-white font-semibold mb-2">Film Title</label>
                                <input
                                    type="text"
                                    value={projectConfig.title}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, title: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
                                    placeholder="Enter your film title"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Genre</label>
                                <select
                                    value={projectConfig.genre}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, genre: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                >
                                    {genres.map(genre => (
                                        <option key={genre.value} value={genre.value} className="bg-slate-800">
                                            {genre.label} - {genre.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Theme/Concept</label>
                                <input
                                    type="text"
                                    value={projectConfig.theme}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, theme: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
                                    placeholder="e.g., Time, Memory, Identity, Love, Loss"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Target Duration (seconds)</label>
                                <input
                                    type="number"
                                    value={projectConfig.targetDuration}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, targetDuration: parseInt(e.target.value) })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                    min="8"
                                    step="8"
                                />
                                <p className="text-purple-200 text-sm mt-1">
                                    {Math.ceil(projectConfig.targetDuration / 8)} scenes × 8 seconds each
                                </p>
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Anti-Mainstream Level</label>
                                <select
                                    value={projectConfig.antiMainstreamLevel}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, antiMainstreamLevel: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                >
                                    <option value="low" className="bg-slate-800">Low - Subtle uniqueness</option>
                                    <option value="medium" className="bg-slate-800">Medium - Noticeable originality</option>
                                    <option value="high" className="bg-slate-800">High - Bold experimentation</option>
                                    <option value="extreme" className="bg-slate-800">Extreme - Avant-garde approach</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Visual Style</label>
                                <select
                                    value={projectConfig.visualStyle}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, visualStyle: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                >
                                    <option value="cinematic" className="bg-slate-800">Cinematic</option>
                                    <option value="documentary" className="bg-slate-800">Documentary</option>
                                    <option value="experimental" className="bg-slate-800">Experimental</option>
                                    <option value="noir" className="bg-slate-800">Noir</option>
                                    <option value="surreal" className="bg-slate-800">Surreal</option>
                                    <option value="minimalist" className="bg-slate-800">Minimalist</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={createNewProject}
                            disabled={isGenerating || !projectConfig.title.trim() || !projectConfig.theme.trim()}
                            className="mt-8 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating Project...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6" />
                                    Create Film Project
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    /* Film Production Interface */
                    <div className="space-y-6">
                        {/* Project Header */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">{currentProject.title}</h2>
                                    <p className="text-purple-200">{currentProject.genre} • {currentProject.theme}</p>
                                    <p className="text-sm text-gray-300">
                                        {currentProject.scenes.length} / {currentProject.totalScenes} scenes •
                                        {currentProject.scenes.reduce((acc, scene) => acc + scene.duration, 0)} / {currentProject.targetDuration} seconds
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={exportProject}
                                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                    >
                                        <Download className="w-4 h-4" />
                                        Export
                                    </button>
                                    <button
                                        onClick={() => setCurrentProject(null)}
                                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        New Project
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Character Management */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Users className="w-6 h-6 text-purple-400" />
                                    Characters ({currentProject.characters.length})
                                </h3>
                                <button
                                    onClick={() => setShowCharacterBuilder(!showCharacterBuilder)}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                                >
                                    Add Character
                                </button>
                            </div>

                            {showCharacterBuilder && (
                                <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                                    <h4 className="text-white font-semibold mb-3">Create New Character</h4>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newCharacter.name || ''}
                                            onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                                            placeholder="Character name"
                                            className="flex-1 p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
                                        />
                                        <button
                                            onClick={addCharacter}
                                            disabled={!newCharacter.name?.trim()}
                                            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                        >
                                            Generate
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currentProject.characters.map((character) => (
                                    <div key={character.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
                                        <h4 className="text-white font-semibold">{character.name}</h4>
                                        <p className="text-purple-200 text-sm">{character.age} years old</p>
                                        <p className="text-gray-300 text-sm mt-2">{character.personality}</p>
                                        <p className="text-gray-400 text-xs mt-2">{character.appearance}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Scene Generation */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Camera className="w-6 h-6 text-purple-400" />
                                    Scenes ({currentProject.scenes.length})
                                </h3>
                                <button
                                    onClick={generateNextScene}
                                    disabled={isGenerating || !apiSettings?.isActive || currentProject.characters.length === 0}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-3"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Generating Scene {currentProject.scenes.length + 1}...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="w-5 h-5" />
                                            Generate Next Scene
                                        </>
                                    )}
                                </button>
                            </div>

                            {currentProject.scenes.length === 0 ? (
                                <div className="text-center py-12 text-gray-300">
                                    <Film className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">No scenes generated yet</p>
                                    <p className="text-sm">Add characters and generate your first scene</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {currentProject.scenes.map((scene) => (
                                        <div key={scene.id} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                                <h4 className="font-bold text-lg">
                                                    Scene {scene.sceneNumber} ({scene.duration}s)
                                                </h4>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => copySceneAsJSON(scene)}
                                                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                        Copy JSON
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-6">
                                                {/* JSON Format Display */}
                                                <div className="bg-gray-900 p-4 rounded-lg mb-4">
                                                    <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                                                        <Brain className="w-4 h-4" />
                                                        Scene Data (JSON)
                                                    </h5>
                                                    <pre className="whitespace-pre-wrap text-xs text-gray-300 font-mono overflow-x-auto">
                                                        {JSON.stringify({
                                                            sceneNumber: scene.sceneNumber,
                                                            duration: scene.duration,
                                                            prompt: scene.prompt,
                                                            characters: scene.characters.map(c => c.name),
                                                            location: scene.location,
                                                            timeOfDay: scene.timeOfDay,
                                                            weather: scene.weather,
                                                            mood: scene.mood,
                                                            storyBeat: scene.storyBeat,
                                                            characterDevelopment: scene.characterDevelopment,
                                                            visualMetaphors: scene.visualMetaphors,
                                                            antiMainstreamElements: scene.antiMainstreamElements
                                                        }, null, 2)}
                                                    </pre>
                                                </div>

                                                {/* Raw Prompt */}
                                                <div className="mb-4">
                                                    <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                                                        <Eye className="w-4 h-4" />
                                                        Video Prompt
                                                    </h5>
                                                    <div className="bg-gray-900 p-4 rounded-lg">
                                                        <pre className="whitespace-pre-wrap text-sm text-gray-300">{scene.prompt}</pre>
                                                    </div>
                                                </div>

                                                {/* Scene Details */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-purple-300 font-semibold">Location:</span>
                                                        <p className="text-gray-300">{scene.location}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-purple-300 font-semibold">Time:</span>
                                                        <p className="text-gray-300">{scene.timeOfDay}, {scene.weather}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-purple-300 font-semibold">Mood:</span>
                                                        <p className="text-gray-300">{scene.mood}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-purple-300 font-semibold">Story Beat:</span>
                                                        <p className="text-gray-300">{scene.storyBeat}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-purple-300 font-semibold">Character Development:</span>
                                                        <p className="text-gray-300">{scene.characterDevelopment}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-purple-300 font-semibold">Anti-Mainstream Elements:</span>
                                                        <p className="text-gray-300">{scene.antiMainstreamElements.join(', ')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancedFilmGenerator;
