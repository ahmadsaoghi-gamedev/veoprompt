// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { RotateCcw, Wand2, Copy, Download, Eye, Brain, Sparkles, Film, Users, Camera } from 'lucide-react';
import { callGeminiAPIForJSON, ensureJSONResponse } from '../utils/api';
import { getSettings } from '../utils/database';
import { APISettings } from '../types';
import { generateCompleteVeo3Prompt, Veo3SceneConfig } from '../utils/veo3-optimized-prompts';
import { generateProfessionalDialogue, ProfessionalDialogueConfig } from '../utils/professional-dialogue-system';
import { generateEnhancedStoryFlow, optimizeStoryFlow as optimizeStoryFlowEnhanced, StoryFlowConfig } from '../utils/enhanced-story-flow';

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
        storyComplexity: 'medium',
        animationType: 'realistic',
        language: 'indonesian',
        regionalLanguage: 'none',
        dialogueStyle: 'professional',
        characterConsistency: 'high',
        sceneContinuity: 'seamless'
    });

    const genres = [
        { value: 'drama', label: 'Drama', description: 'Character-driven storytelling' },
        { value: 'thriller', label: 'Thriller', description: 'Suspense and tension' },
        { value: 'sci-fi', label: 'Sci-Fi', description: 'Futuristic concepts' },
        { value: 'fantasy', label: 'Fantasy', description: 'Magical elements' },
        { value: 'noir', label: 'Noir', description: 'Dark, moody atmosphere' },
        { value: 'experimental', label: 'Experimental', description: 'Avant-garde approach' },
        { value: 'documentary', label: 'Documentary', description: 'Realistic portrayal' },
        { value: 'surreal', label: 'Surreal', description: 'Dreamlike, abstract' },
        { value: 'comedy', label: 'Comedy', description: 'Humor and entertainment' },
        { value: 'romance', label: 'Romance', description: 'Love and relationships' },
        { value: 'action', label: 'Action', description: 'High-energy sequences' },
        { value: 'horror', label: 'Horror', description: 'Fear and suspense' }
    ];

    const animationTypes = [
        { value: 'realistic', label: 'Realistic', description: 'Photorealistic CGI animation', icon: '🎬' },
        { value: 'traditional-2d', label: 'Traditional 2D Hand-Drawn', description: 'Classic hand-drawn animation', icon: '✏️' },
        { value: 'anime-modern', label: 'Anime Modern (2D + CGI)', description: 'Modern anime with CGI elements', icon: '🎌' },
        { value: '3d-cgi', label: '3D CGI Animation', description: 'Full 3D computer animation', icon: '🎮' },
        { value: 'stop-motion', label: 'Stop-Motion Animation', description: 'Frame-by-frame stop-motion', icon: '🎭' },
        { value: 'claymation', label: 'Claymation', description: 'Stop-motion with clay figures', icon: '🧱' },
        { value: 'motion-capture', label: 'Motion Capture + CGI', description: 'Real actor motion capture', icon: '👤' },
        { value: 'rotoscoping', label: 'Rotoscoping', description: 'Live-action traced animation', icon: '🎨' },
        { value: 'hybrid', label: 'Hybrid (Live-Action + Animation)', description: 'Mix of real and animated', icon: '🎪' },
        { value: 'anime', label: 'Anime (Japanese Animation)', description: 'Traditional Japanese anime style', icon: '🌸' },
        { value: 'stylized', label: 'Stylized / Mixed Media', description: 'Artistic mixed media approach', icon: '🎨' },
        { value: 'pixar', label: 'Pixar Style', description: 'Pixar-like 3D animation', icon: '🏠' }
    ];

    const languages = [
        { value: 'indonesian', label: 'Bahasa Indonesia', description: 'Bahasa Indonesia standar' },
        { value: 'english', label: 'English', description: 'International English' },
        { value: 'javanese', label: 'Bahasa Jawa', description: 'Bahasa Jawa dengan tingkatan' },
        { value: 'sundanese', label: 'Bahasa Sunda', description: 'Bahasa Sunda regional' },
        { value: 'mixed', label: 'Mixed Language', description: 'Campuran bahasa Indonesia dan daerah' }
    ];

    const regionalLanguages = [
        { value: 'none', label: 'Tidak Ada', description: 'Hanya bahasa utama' },
        { value: 'javanese-kromo', label: 'Jawa Kromo', description: 'Bahasa Jawa halus/tinggi' },
        { value: 'javanese-ngoko', label: 'Jawa Ngoko', description: 'Bahasa Jawa kasar/sehari-hari' },
        { value: 'sundanese-lemes', label: 'Sunda Lemes', description: 'Bahasa Sunda halus' },
        { value: 'sundanese-loma', label: 'Sunda Loma', description: 'Bahasa Sunda kasar' },
        { value: 'betawi', label: 'Bahasa Betawi', description: 'Bahasa Betawi Jakarta' },
        { value: 'minang', label: 'Bahasa Minang', description: 'Bahasa Minangkabau' },
        { value: 'batak', label: 'Bahasa Batak', description: 'Bahasa Batak' }
    ];

    const dialogueStyles = [
        { value: 'professional', label: 'Professional', description: 'Percakapan formal dan profesional' },
        { value: 'casual', label: 'Casual', description: 'Percakapan santai dan natural' },
        { value: 'dramatic', label: 'Dramatic', description: 'Percakapan dramatis dan emosional' },
        { value: 'comedic', label: 'Comedic', description: 'Percakapan lucu dan menghibur' },
        { value: 'poetic', label: 'Poetic', description: 'Percakapan puitis dan indah' },
        { value: 'technical', label: 'Technical', description: 'Percakapan teknis dan detail' }
    ];

    // Anti-mainstream elements are now integrated into scene generation

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
        if (!currentProject) throw new Error('No project loaded');

        const characters = currentProject.characters;
        const animationType = animationTypes.find(at => at.value === projectConfig.animationType);

        console.log(`Creating enhanced Veo3-optimized scene ${sceneNumber}`);

        // Create Veo3 scene configuration
        const veo3Config: Veo3SceneConfig = {
            sceneNumber,
            totalScenes: currentProject.totalScenes,
            duration: 8,
            genre: projectConfig.genre,
            animationType: projectConfig.animationType,
            language: projectConfig.language,
            characters: characters.map(char => ({
                name: char.name,
                age: char.age.toString(),
                personality: char.personality,
                appearance: char.appearance,
                speakingStyle: char.speakingStyle,
                emotionalState: char.emotionalRange[0] || 'neutral',
                position: 'center',
                clothing: 'casual attire'
            })),
            storyContext: projectConfig.theme,
            previousScene: previousScene ? {
                sceneNumber: previousScene.sceneNumber,
                totalScenes: currentProject.totalScenes,
                duration: previousScene.duration,
                genre: projectConfig.genre,
                animationType: projectConfig.animationType,
                language: projectConfig.language,
                characters: previousScene.characters.map(char => ({
                    name: char.name,
                    age: char.age.toString(),
                    personality: char.personality,
                    appearance: char.appearance,
                    speakingStyle: char.speakingStyle,
                    emotionalState: char.emotionalRange[0] || 'neutral',
                    position: 'center',
                    clothing: 'casual attire'
                })),
                storyContext: projectConfig.theme
            } : undefined
        };

        // Generate professional dialogue
        const dialogueConfig: ProfessionalDialogueConfig = {
            characters: characters.map(char => ({
                name: char.name,
                age: char.age.toString(),
                personality: char.personality,
                speakingStyle: char.speakingStyle,
                emotionalState: char.emotionalRange[0] || 'neutral',
                backstory: char.backstory,
                relationships: char.relationships,
                characterArc: char.characterArc,
                voiceCharacteristics: char.voiceCharacteristics
            })),
            sceneContext: projectConfig.theme,
            genre: projectConfig.genre,
            language: projectConfig.language,
            duration: 8,
            emotionalArc: sceneNumber === 1 ? 'opening' : sceneNumber === currentProject.totalScenes ? 'resolution' : 'development',
            previousDialogue: previousScene?.audio.dialogue
        };

        const professionalDialogue = generateProfessionalDialogue(dialogueConfig);

        // Generate Veo3-optimized prompt
        const veo3Prompt = generateCompleteVeo3Prompt(veo3Config, professionalDialogue.dialogue);

        // Create enhanced scene data
        const sceneId = `scene_${sceneNumber}_${Date.now()}`;
        const meaningfulPrompt = veo3Prompt.visualPrompt;

        // Determine story beat based on scene number
        let storyBeat = "";
        let characterDevelopment = "";
        let visualMetaphors = [];
        let antiMainstreamElements = [];

        if (sceneNumber === 1) {
            storyBeat = `Opening scene: ${projectConfig.theme} - ${characters.map(c => c.name).join(' and ')} are introduced to the story`;
            characterDevelopment = `${characters.map(c => c.name).join(', ')} establish their personalities and motivations`;
            visualMetaphors = ["opening_metaphor", "character_introduction"];
            antiMainstreamElements = ["unconventional_opening", "unique_character_intro"];
        } else if (sceneNumber === currentProject.totalScenes) {
            storyBeat = `Resolution scene: ${projectConfig.theme} - ${characters.map(c => c.name).join(' and ')} resolve the story`;
            characterDevelopment = `${characters.map(c => c.name).join(', ')} grow and change through the experience`;
            visualMetaphors = ["resolution_metaphor", "transformation_visual"];
            antiMainstreamElements = ["unconventional_resolution", "unique_ending"];
        } else {
            storyBeat = `Development scene: ${projectConfig.theme} - ${characters.map(c => c.name).join(' and ')} face the main conflict`;
            characterDevelopment = `${characters.map(c => c.name).join(', ')} react to the story challenge`;
            visualMetaphors = ["conflict_metaphor", "tension_visual"];
            antiMainstreamElements = ["unconventional_conflict", "unique_approach"];
        }

        return {
            id: sceneId,
            sceneNumber: sceneNumber,
            duration: 8,
            prompt: meaningfulPrompt,
            characters: characters,
            objects: ["key_prop", "environmental_element"],
            location: previousScene?.location || "Story location",
            timeOfDay: previousScene?.timeOfDay || "day",
            weather: previousScene?.weather || "clear",
            mood: previousScene?.mood || "dramatic",
            cinematography: {
                cameraWork: veo3Prompt.cinematographyPrompt.split('\n')[0] || `Dynamic shot for ${animationType?.label}`,
                lighting: veo3Prompt.cinematographyPrompt.split('\n')[2] || `Mood lighting for ${animationType?.label}`,
                colorPalette: veo3Prompt.cinematographyPrompt.split('\n')[4] || `Thematic colors for ${animationType?.label}`,
                visualEffects: ["atmospheric_effect"]
            },
            audio: {
                dialogue: professionalDialogue.dialogue,
                ambientSounds: ["environmental_sound"],
                music: "Thematic music",
                soundEffects: ["dramatic_sfx"]
            },
            storyBeat: storyBeat,
            characterDevelopment: characterDevelopment,
            visualMetaphors: visualMetaphors,
            antiMainstreamElements: antiMainstreamElements,
            continuityNotes: veo3Prompt.characterConsistencyPrompt,
            nextSceneSetup: veo3Prompt.sceneTransitionPrompt
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
        if (!currentProject) return;

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

    const regenerateScene = async (sceneNumber: number) => {
        if (!currentProject) return;

        setIsGenerating(true);
        try {
            const previousScene = sceneNumber > 1 ? currentProject.scenes[sceneNumber - 2] : undefined;
            const newScene = await generateScene(sceneNumber, previousScene);

            setCurrentProject(prev => prev ? {
                ...prev,
                scenes: prev.scenes.map(scene =>
                    scene.sceneNumber === sceneNumber ? newScene : scene
                ),
                updatedAt: new Date()
            } : null);

            alert(`Scene ${sceneNumber} regenerated successfully!`);
        } catch (error) {
            console.error('Failed to regenerate scene:', error);
            alert('Failed to regenerate scene');
        } finally {
            setIsGenerating(false);
        }
    };

    const generateAllScenes = async () => {
        if (!currentProject) return;

        setIsGenerating(true);
        try {
            const allScenes: SceneData[] = [];

            // Generate enhanced story flow first
            const storyFlowConfig: StoryFlowConfig = {
                totalScenes: currentProject.totalScenes,
                genre: projectConfig.genre,
                theme: projectConfig.theme,
                characters: currentProject.characters.map(char => ({
                    name: char.name,
                    role: char.personality,
                    arc: char.characterArc,
                    relationships: char.relationships,
                    emotionalState: char.emotionalRange[0] || 'neutral',
                    development: char.characterArc
                })),
                targetDuration: projectConfig.targetDuration,
                storyArc: projectConfig.theme,
                emotionalJourney: ['curiosity', 'tension', 'catharsis']
            };

            const enhancedStoryFlow = generateEnhancedStoryFlow(storyFlowConfig);
            optimizeStoryFlowEnhanced(enhancedStoryFlow);

            // Generate all scenes with enhanced Veo3 optimization
            for (let i = 1; i <= currentProject.totalScenes; i++) {
                const previousScene = allScenes[allScenes.length - 1];
                const newScene = await generateScene(i, previousScene);
                allScenes.push(newScene);

                // Update progress
                setCurrentProject(prev => prev ? {
                    ...prev,
                    scenes: [...allScenes],
                    updatedAt: new Date()
                } : null);

                // Small delay for visual effect
                if (i < currentProject.totalScenes) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            alert(`All ${allScenes.length} scenes generated successfully with Veo3 optimization!`);

            setCurrentProject(prev => prev ? {
                ...prev,
                scenes: allScenes,
                updatedAt: new Date()
            } : null);
        } catch (error) {
            console.error('Failed to generate all scenes:', error);
            alert(`Failed to generate all scenes: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

                            {/* Animation Type */}
                            <div>
                                <label className="block text-white font-semibold mb-2">Animation Type</label>
                                <select
                                    value={projectConfig.animationType}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, animationType: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                >
                                    {animationTypes.map(type => (
                                        <option key={type.value} value={type.value} className="bg-slate-800">
                                            {type.icon} {type.label} - {type.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Language Selection */}
                            <div>
                                <label className="block text-white font-semibold mb-2">Primary Language</label>
                                <select
                                    value={projectConfig.language}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, language: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                >
                                    {languages.map(lang => (
                                        <option key={lang.value} value={lang.value} className="bg-slate-800">
                                            {lang.label} - {lang.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Regional Language */}
                            {projectConfig.language !== 'english' && (
                                <div>
                                    <label className="block text-white font-semibold mb-2">Regional Language/Accent</label>
                                    <select
                                        value={projectConfig.regionalLanguage}
                                        onChange={(e) => setProjectConfig({ ...projectConfig, regionalLanguage: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                    >
                                        {regionalLanguages.map(regLang => (
                                            <option key={regLang.value} value={regLang.value} className="bg-slate-800">
                                                {regLang.label} - {regLang.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Dialogue Style */}
                            <div>
                                <label className="block text-white font-semibold mb-2">Dialogue Style</label>
                                <select
                                    value={projectConfig.dialogueStyle}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, dialogueStyle: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                >
                                    {dialogueStyles.map(style => (
                                        <option key={style.value} value={style.value} className="bg-slate-800">
                                            {style.label} - {style.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Character Consistency */}
                            <div>
                                <label className="block text-white font-semibold mb-2">Character Consistency Level</label>
                                <select
                                    value={projectConfig.characterConsistency}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, characterConsistency: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                >
                                    <option value="high" className="bg-slate-800">High - Strict character consistency</option>
                                    <option value="medium" className="bg-slate-800">Medium - Balanced consistency</option>
                                    <option value="low" className="bg-slate-800">Low - Flexible character development</option>
                                </select>
                            </div>

                            {/* Scene Continuity */}
                            <div>
                                <label className="block text-white font-semibold mb-2">Scene Continuity</label>
                                <select
                                    value={projectConfig.sceneContinuity}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, sceneContinuity: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                >
                                    <option value="seamless" className="bg-slate-800">Seamless - Perfect continuity</option>
                                    <option value="smooth" className="bg-slate-800">Smooth - Good continuity</option>
                                    <option value="loose" className="bg-slate-800">Loose - Flexible continuity</option>
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
                                <div className="flex gap-3">
                                    <button
                                        onClick={generateNextScene}
                                        disabled={isGenerating || !apiSettings?.isActive || currentProject.characters.length === 0 || currentProject.scenes.length >= currentProject.totalScenes}
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
                                    {currentProject.scenes.length === 0 && (
                                        <button
                                            onClick={generateAllScenes}
                                            disabled={isGenerating || !apiSettings?.isActive || currentProject.characters.length === 0}
                                            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-3"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Generating All Scenes...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5" />
                                                    Generate All Scenes
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
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
                                                    {scene.id.includes('fallback') && (
                                                        <button
                                                            onClick={() => regenerateScene(scene.sceneNumber)}
                                                            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded-lg transition-colors"
                                                        >
                                                            <Wand2 className="w-4 h-4" />
                                                            Regenerate
                                                        </button>
                                                    )}
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
                                                        <span className="text-purple-300 font-semibold">Animation Type:</span>
                                                        <p className="text-gray-300">{animationTypes.find(at => at.value === projectConfig.animationType)?.icon} {animationTypes.find(at => at.value === projectConfig.animationType)?.label}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-purple-300 font-semibold">Language:</span>
                                                        <p className="text-gray-300">{languages.find(l => l.value === projectConfig.language)?.label} {projectConfig.regionalLanguage !== 'none' ? `(${regionalLanguages.find(rl => rl.value === projectConfig.regionalLanguage)?.label})` : ''}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-purple-300 font-semibold">Dialogue Style:</span>
                                                        <p className="text-gray-300">{dialogueStyles.find(ds => ds.value === projectConfig.dialogueStyle)?.label}</p>
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
