// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { RotateCcw, Wand2, Copy, Download, Sparkles, Film, Users, Camera, Image, Video } from 'lucide-react';
import { callGeminiAPIForJSON, ensureJSONResponse } from '../utils/api';
import { getSettings } from '../utils/database';
import { APISettings } from '../types';
import { generateImage, enhancePrompt } from '../utils/image-generator';

interface CharacterReference {
    name: string;
    physicalCharacteristics: string;
    clothingStyle: string;
    accessories: string;
    facialExpressions: string;
    voiceStyle: string;
    textToImagePrompt: string;
    generatedImageData?: string;
    generatedImageUrl?: string;
}

interface SceneOutput {
    sceneNumber: number;
    sceneDescription: string;
    textToImagePrompt: string;
    imageToVideoPrompt: string;
    generatedImageData?: string;
    generatedImageUrl?: string;
}

interface FilmProject {
    characterName: string;
    mainSceneDescription: string;
    numberOfScenes: number;
    styleFilm: string;
    characterReference: CharacterReference | null;
    scenes: SceneOutput[];
    createdAt: Date;
}

const ImprovedFilmGenerator: React.FC = () => {
    const [currentProject, setCurrentProject] = useState<FilmProject | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [apiSettings, setApiSettings] = useState<APISettings | null>(null);
    const [currentStep, setCurrentStep] = useState<'input' | 'character' | 'scenes' | 'complete'>('input');

    // Project configuration
    const [projectConfig, setProjectConfig] = useState({
        characterName: '',
        mainSceneDescription: '',
        numberOfScenes: 3,
        styleFilm: 'cinematic'
    });

    // Film styles from brain files
    const filmStyles = [
        { value: 'cinematic', label: 'Cinematic Realistic', description: 'Photorealistic cinematic scene with professional lighting' },
        { value: 'pixar', label: 'Pixar Premium', description: 'High-quality 3D animated scene in Pixar style' },
        { value: 'anime', label: 'Anime Professional', description: 'Professional anime-style with dynamic camera work' },
        { value: 'drama', label: 'Drama Cinematic', description: 'Dramatic scene with moody lighting and emotional depth' },
        { value: 'thriller', label: 'Thriller Suspense', description: 'Suspenseful scene with high contrast lighting' },
        { value: 'romance', label: 'Romance Intimate', description: 'Intimate romantic scene with soft, warm lighting' },
        { value: 'comedy', label: 'Comedy Light', description: 'Lighthearted comedic scene with bright lighting' },
        { value: 'fantasy', label: 'Fantasy Epic', description: 'Epic fantasy scene with dramatic lighting' },
        { value: 'sci-fi', label: 'Sci-Fi Futuristic', description: 'Futuristic sci-fi scene with cool lighting' },
        { value: 'horror', label: 'Horror Atmospheric', description: 'Atmospheric horror scene with dark lighting' },
        { value: 'documentary', label: 'Documentary Realistic', description: 'Realistic documentary-style scene' },
        { value: 'experimental', label: 'Experimental Artistic', description: 'Experimental artistic scene with unique lighting' }
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

    const generateCharacterReference = async (): Promise<CharacterReference> => {
        if (!apiSettings?.isActive) throw new Error('API not configured');

        const selectedStyle = filmStyles.find(style => style.value === projectConfig.styleFilm);

        const prompt = `Create a detailed character reference for "${projectConfig.characterName}" for a ${selectedStyle?.label} film.

Character Requirements:
- Name: ${projectConfig.characterName}
- Film Style: ${selectedStyle?.label} - ${selectedStyle?.description}
- Main Scene Context: ${projectConfig.mainSceneDescription}

Return ONLY a JSON object with this exact structure:
{
  "name": "${projectConfig.characterName}",
  "physicalCharacteristics": "Detailed description of physical appearance, age, build, distinctive features",
  "clothingStyle": "Appropriate clothing for the character's role and the film style",
  "accessories": "Distinctive props, jewelry, tools, or items the character carries",
  "facialExpressions": "Typical facial expressions and emotional range",
  "voiceStyle": "Speaking style, tone, accent, mannerisms",
  "textToImagePrompt": "Complete prompt for AI image generator (MidJourney, Leonardo, etc.) including physical description, clothing, accessories, facial expression, and style specifications"
}

Make the character unique, memorable, and suitable for the ${selectedStyle?.label} style.`;

        const result = await callGeminiAPIForJSON(prompt, undefined, apiSettings);
        ensureJSONResponse(result, ['name', 'physicalCharacteristics', 'clothingStyle', 'accessories', 'facialExpressions', 'voiceStyle', 'textToImagePrompt']);

        return {
            name: result.name,
            physicalCharacteristics: result.physicalCharacteristics,
            clothingStyle: result.clothingStyle,
            accessories: result.accessories,
            facialExpressions: result.facialExpressions,
            voiceStyle: result.voiceStyle,
            textToImagePrompt: result.textToImagePrompt
        };
    };

    const generateCharacterImage = async (characterRef: CharacterReference): Promise<{ imageData?: string; imageUrl?: string } | undefined> => {
        try {
            const enhancedPrompt = enhancePrompt(characterRef.textToImagePrompt, 'photorealistic', 'high');
            const result = await generateImage(enhancedPrompt);

            if (result.success && (result.imageData || result.imageUrl)) {
                return { imageData: result.imageData, imageUrl: result.imageUrl };
            }
            return undefined;
        } catch (error) {
            console.error('Failed to generate character image:', error);
            return undefined;
        }
    };

    const generateSceneOutputs = async (characterRef: CharacterReference): Promise<SceneOutput[]> => {
        if (!apiSettings?.isActive) throw new Error('API not configured');

        const selectedStyle = filmStyles.find(style => style.value === projectConfig.styleFilm);
        const scenes: SceneOutput[] = [];

        for (let i = 1; i <= projectConfig.numberOfScenes; i++) {
            const prompt = `Create scene ${i} of ${projectConfig.numberOfScenes} for "${projectConfig.characterName}" in a ${selectedStyle?.label} film.

Character Reference:
- Name: ${characterRef.name}
- Physical: ${characterRef.physicalCharacteristics}
- Clothing: ${characterRef.clothingStyle}
- Accessories: ${characterRef.accessories}
- Voice: ${characterRef.voiceStyle}

Main Scene Context: ${projectConfig.mainSceneDescription}
Film Style: ${selectedStyle?.label} - ${selectedStyle?.description}

Return ONLY a JSON object with this exact structure:
{
  "sceneNumber": ${i},
  "sceneDescription": "Detailed description of what happens in this scene",
  "textToImagePrompt": "Complete prompt for AI image generator showing the character in this specific scene, maintaining character consistency",
  "imageToVideoPrompt": "Complete Google Veo 3 prompt including: 16:9 resolution, atmosphere description, camera movement (pan/tracking/zoom), spoken lines, visual details (lighting, depth of field, color), maintaining character consistency from the reference image"
}

Make sure the character remains consistent across all scenes and the prompts are optimized for the ${selectedStyle?.label} style.`;

            const result = await callGeminiAPIForJSON(prompt, undefined, apiSettings);
            ensureJSONResponse(result, ['sceneNumber', 'sceneDescription', 'textToImagePrompt', 'imageToVideoPrompt']);

            scenes.push({
                sceneNumber: result.sceneNumber,
                sceneDescription: result.sceneDescription,
                textToImagePrompt: result.textToImagePrompt,
                imageToVideoPrompt: result.imageToVideoPrompt
            });
        }

        return scenes;
    };

    const generateSceneImages = async (scenes: SceneOutput[]): Promise<SceneOutput[]> => {
        const updatedScenes = [...scenes];

        for (let i = 0; i < updatedScenes.length; i++) {
            try {
                const enhancedPrompt = enhancePrompt(updatedScenes[i].textToImagePrompt, 'photorealistic', 'high');
                const result = await generateImage(enhancedPrompt);

                if (result.success && (result.imageData || result.imageUrl)) {
                    updatedScenes[i].generatedImageData = result.imageData;
                    updatedScenes[i].generatedImageUrl = result.imageUrl;
                }
            } catch (error) {
                console.error(`Failed to generate image for scene ${updatedScenes[i].sceneNumber}:`, error);
            }
        }

        return updatedScenes;
    };

    const createNewProject = async () => {
        if (!apiSettings?.isActive) {
            alert('Please configure your API key first.');
            return;
        }

        if (!projectConfig.characterName.trim() || !projectConfig.mainSceneDescription.trim()) {
            alert('Please enter character name and main scene description.');
            return;
        }

        setIsGenerating(true);
        setCurrentStep('character');

        try {
            // Step 1: Generate character reference
            const characterRef = await generateCharacterReference();

            // Step 2: Generate character image
            const characterImage = await generateCharacterImage(characterRef);
            characterRef.generatedImageData = characterImage?.imageData;
            characterRef.generatedImageUrl = characterImage?.imageUrl;

            // Step 3: Generate scene outputs
            setCurrentStep('scenes');
            const scenes = await generateSceneOutputs(characterRef);

            // Step 4: Generate scene images
            const scenesWithImages = await generateSceneImages(scenes);

            const project: FilmProject = {
                characterName: projectConfig.characterName,
                mainSceneDescription: projectConfig.mainSceneDescription,
                numberOfScenes: projectConfig.numberOfScenes,
                styleFilm: projectConfig.styleFilm,
                characterReference: characterRef,
                scenes: scenesWithImages,
                createdAt: new Date()
            };

            setCurrentProject(project);
            setCurrentStep('complete');
        } catch (error) {
            console.error('Failed to create project:', error);
            alert('Failed to create project');
            setCurrentStep('input');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        alert(`${label} copied to clipboard!`);
    };

    const exportProject = () => {
        if (!currentProject) return;

        const exportData = {
            ...currentProject,
            exportedAt: new Date().toISOString(),
            filmStyle: filmStyles.find(style => style.value === currentProject.styleFilm)
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentProject.characterName.replace(/\s+/g, '_')}_film_project.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const resetProject = () => {
        setCurrentProject(null);
        setCurrentStep('input');
        setProjectConfig({
            characterName: '',
            mainSceneDescription: '',
            numberOfScenes: 3,
            styleFilm: 'cinematic'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <Helmet>
                <title>Improved Film Generator - Character-Consistent AI Film Creation - Shabira Prompt Lab</title>
                <meta name="description" content="Create consistent character films with text-to-image to image-to-video workflow. Professional film production tool." />
                <meta name="keywords" content="AI film generator, character consistency, text-to-image, image-to-video, film production" />
            </Helmet>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                        <Film className="w-12 h-12 text-purple-400" />
                        Improved Film Generator
                    </h1>
                    <p className="text-xl text-purple-200">
                        Character-Consistent Film Creation with Text-to-Image → Image-to-Video Workflow
                    </p>
                </div>

                {currentStep === 'input' && (
                    /* Project Setup */
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                            <Wand2 className="w-8 h-8 text-purple-400" />
                            Create New Film Project
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-white font-semibold mb-2">Character Name</label>
                                <input
                                    type="text"
                                    value={projectConfig.characterName}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, characterName: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
                                    placeholder="Enter character name"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Number of Scenes</label>
                                <input
                                    type="number"
                                    value={projectConfig.numberOfScenes}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, numberOfScenes: parseInt(e.target.value) })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                    min="1"
                                    max="10"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-white font-semibold mb-2">Main Scene Description</label>
                                <textarea
                                    value={projectConfig.mainSceneDescription}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, mainSceneDescription: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 h-24 resize-none"
                                    placeholder="Describe the main story or concept for your film..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-white font-semibold mb-2">Style Film</label>
                                <select
                                    value={projectConfig.styleFilm}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, styleFilm: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                >
                                    {filmStyles.map(style => (
                                        <option key={style.value} value={style.value} className="bg-slate-800">
                                            {style.label} - {style.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={createNewProject}
                            disabled={isGenerating || !projectConfig.characterName.trim() || !projectConfig.mainSceneDescription.trim()}
                            className="mt-8 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Generating Film...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6" />
                                    Generate Film
                                </>
                            )}
                        </button>
                    </div>
                )}

                {currentStep === 'character' && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h3 className="text-2xl font-bold text-white mb-2">Generating Character Reference</h3>
                        <p className="text-purple-200">Creating detailed character profile and generating reference image...</p>
                    </div>
                )}

                {currentStep === 'scenes' && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h3 className="text-2xl font-bold text-white mb-2">Generating Scenes</h3>
                        <p className="text-purple-200">Creating scene descriptions and generating scene images...</p>
                    </div>
                )}

                {currentStep === 'complete' && currentProject && (
                    /* Film Results */
                    <div className="space-y-6">
                        {/* Project Header */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">{currentProject.characterName}</h2>
                                    <p className="text-purple-200">{filmStyles.find(s => s.value === currentProject.styleFilm)?.label}</p>
                                    <p className="text-sm text-gray-300">
                                        {currentProject.numberOfScenes} scenes • Created {currentProject.createdAt.toLocaleDateString()}
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
                                        onClick={resetProject}
                                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        New Project
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Character Reference */}
                        {currentProject.characterReference && (
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <Users className="w-6 h-6 text-purple-400" />
                                    Character Reference
                                </h3>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Character Image */}
                                    {(currentProject.characterReference.generatedImageUrl || currentProject.characterReference.generatedImageData) && (
                                        <div>
                                            <h4 className="text-white font-semibold mb-2">Character Image</h4>
                                            <div className="bg-gray-900 p-4 rounded-lg">
                                                <img
                                                    src={currentProject.characterReference.generatedImageUrl || `data:image/png;base64,${currentProject.characterReference.generatedImageData}`}
                                                    alt={currentProject.characterReference.name}
                                                    className="w-full h-auto rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Character Details */}
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-white font-semibold mb-2">Physical Characteristics</h4>
                                            <p className="text-gray-300">{currentProject.characterReference.physicalCharacteristics}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold mb-2">Clothing Style</h4>
                                            <p className="text-gray-300">{currentProject.characterReference.clothingStyle}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold mb-2">Accessories</h4>
                                            <p className="text-gray-300">{currentProject.characterReference.accessories}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold mb-2">Voice Style</h4>
                                            <p className="text-gray-300">{currentProject.characterReference.voiceStyle}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Text-to-Image Prompt */}
                                <div className="mt-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-white font-semibold flex items-center gap-2">
                                            <Image className="w-4 h-4" />
                                            Text-to-Image Prompt (Character Reference)
                                        </h4>
                                        <button
                                            onClick={() => copyToClipboard(currentProject.characterReference!.textToImagePrompt, 'Character prompt')}
                                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition-colors"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </button>
                                    </div>
                                    <div className="bg-gray-900 p-4 rounded-lg">
                                        <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">
                                            {currentProject.characterReference.textToImagePrompt}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Scenes */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <Camera className="w-6 h-6 text-purple-400" />
                                Scenes ({currentProject.scenes.length})
                            </h3>

                            <div className="space-y-6">
                                {currentProject.scenes.map((scene) => (
                                    <div key={scene.sceneNumber} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                            <h4 className="font-bold text-lg">
                                                Scene {scene.sceneNumber}
                                            </h4>
                                        </div>

                                        <div className="p-6">
                                            {/* Scene Description */}
                                            <div className="mb-4">
                                                <h5 className="text-white font-semibold mb-2">Scene Description</h5>
                                                <p className="text-gray-300">{scene.sceneDescription}</p>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* Scene Image */}
                                                {(scene.generatedImageUrl || scene.generatedImageData) && (
                                                    <div>
                                                        <h5 className="text-white font-semibold mb-2">Scene Image</h5>
                                                        <div className="bg-gray-900 p-4 rounded-lg">
                                                            <img
                                                                src={scene.generatedImageUrl || `data:image/png;base64,${scene.generatedImageData}`}
                                                                alt={`Scene ${scene.sceneNumber}`}
                                                                className="w-full h-auto rounded-lg"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Prompts */}
                                                <div className="space-y-4">
                                                    {/* Text-to-Image Prompt */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h5 className="text-white font-semibold flex items-center gap-2">
                                                                <Image className="w-4 h-4" />
                                                                Text-to-Image Prompt
                                                            </h5>
                                                            <button
                                                                onClick={() => copyToClipboard(scene.textToImagePrompt, 'Scene image prompt')}
                                                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition-colors"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                                Copy
                                                            </button>
                                                        </div>
                                                        <div className="bg-gray-900 p-3 rounded-lg">
                                                            <pre className="whitespace-pre-wrap text-xs text-gray-300 font-mono">
                                                                {scene.textToImagePrompt}
                                                            </pre>
                                                        </div>
                                                    </div>

                                                    {/* Image-to-Video Prompt */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h5 className="text-white font-semibold flex items-center gap-2">
                                                                <Video className="w-4 h-4" />
                                                                Image-to-Video Prompt (Google Veo 3)
                                                            </h5>
                                                            <button
                                                                onClick={() => copyToClipboard(scene.imageToVideoPrompt, 'Video prompt')}
                                                                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded-lg transition-colors"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                                Copy
                                                            </button>
                                                        </div>
                                                        <div className="bg-gray-900 p-3 rounded-lg">
                                                            <pre className="whitespace-pre-wrap text-xs text-gray-300 font-mono">
                                                                {scene.imageToVideoPrompt}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImprovedFilmGenerator;
