import React from 'react';
import { generateImage, ImageGenerationResult } from '../utils/image-generator';

const ImageGenerator = () => {
    const useState = (React as { useState: <T>(initial: T) => [T, (value: T) => void] }).useState;
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<ImageGenerationResult | null>(null);
    const [error, setError] = useState(null);
    const [uploadedFace, setUploadedFace] = useState<string | null>(null);
    const [useFigurineMode, setUseFigurineMode] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');

    // Template prompts untuk figurine mode
    const figurineTemplates = [
        {
            id: 'sculpture-desk',
            name: '🏺 Sculpture on Desk',
            prompt: 'Create a 1/18th scale commercial sculpture from the image, in a realistic style, in a real-life environment. The sculpture is placed on a computer desk. The sculpture has a transparent acrylic base, with no text on the base. The content on the computer screen is the ZBrush modeling process of the figure. Next to the computer screen is a frame containing the photo printed with the original artwork'
        },
        {
            id: 'action-figure',
            name: '🦸 Action Figure',
            prompt: 'Create a 1/12 scale action figure based on the person in the image, in a realistic style. The figure is displayed on a collector\'s shelf with proper lighting. The figure has articulated joints and comes with accessories. The packaging shows the original photo and figure details. Professional photography, studio lighting, detailed sculpting'
        },
        {
            id: 'bust-sculpture',
            name: '🗿 Bust Sculpture',
            prompt: 'Create a detailed bust sculpture of the person from the image, in a realistic style. The bust is displayed on a marble pedestal in a museum setting. The sculpture captures all facial features accurately with fine details. Professional museum lighting, classical art style, high-quality marble finish'
        },
        {
            id: 'miniature-figure',
            name: '🎯 Miniature Figure',
            prompt: 'Create a 1/35 scale miniature figure of the person from the image, in a realistic style. The figure is placed on a gaming table with terrain and other miniatures. The figure has detailed painting and realistic proportions. Gaming table setup, hobbyist environment, detailed miniature painting'
        }
    ];

    const handleFaceUpload = (event: { target: { files?: FileList | null } }) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File size must be less than 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedFace(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            setError(null);
        }
    };

    const handleGenerate = async () => {
        if (!useFigurineMode && !prompt.trim()) {
            setError('Please enter a prompt');
            return;
        }

        if (useFigurineMode && !uploadedFace) {
            setError('Please upload a face image for figurine mode');
            return;
        }

        if (useFigurineMode && !selectedTemplate) {
            setError('Please select a template for figurine mode');
            return;
        }


        setIsGenerating(true);
        setError(null);
        setResult(null);

        try {
            let finalPrompt = prompt;

            if (useFigurineMode && uploadedFace && selectedTemplate) {
                // Use selected template prompt
                const template = figurineTemplates.find(t => t.id === selectedTemplate);
                if (template) {
                    finalPrompt = template.prompt;
                }
            }

            const imageResult = await generateImage(finalPrompt, useFigurineMode ? uploadedFace : undefined);
            setResult(imageResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate image');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (result?.imageData) {
            const link = document.createElement('a');
            link.href = `data:image/png;base64,${result.imageData}`;
            link.download = `generated-image-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const examplePrompts = useFigurineMode ? [
        "🏺 Sculpture on Desk - Perfect for office display",
        "🦸 Action Figure - Great for collectors",
        "🗿 Bust Sculpture - Classic museum style",
        "🎯 Miniature Figure - Perfect for gaming"
    ] : [
        "A photorealistic close-up portrait of an elderly Japanese ceramicist with deep, sun-etched wrinkles and a warm, knowing smile. He is carefully inspecting a freshly glazed tea bowl.",
        "A kawaii-style sticker of a happy red panda wearing a tiny bamboo hat. It's munching on a green bamboo leaf. The design features bold, clean outlines and vibrant colors.",
        "A modern, minimalist logo for a coffee shop called 'The Daily Grind'. The design should feature a simple, stylized coffee bean integrated with clean, bold text.",
        "A high-resolution, studio-lit product photograph of a minimalist ceramic coffee mug in matte black, presented on a polished concrete surface.",
        "A single comic book panel in a gritty, noir art style with high-contrast black and white inks. A detective in a trench coat stands under a flickering streetlamp.",
        "A minimalist composition featuring a single, delicate red maple leaf positioned in the bottom-right of the frame with vast negative space."
    ];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    🎨 Image Generator
                </h1>

                <div className="mb-6 text-center">
                    <p className="text-gray-600">
                        Generate images from text descriptions and photos using <a href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Gemini API</a> (Supports Image Input).
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        💡 If Gemini quota is exceeded, the system will automatically use <a href="https://pollinations.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Pollinations.ai</a> as a free fallback.
                    </p>
                </div>

                {/* Figurine Mode Toggle */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">🎭 Figurine Mode</h3>
                            <p className="text-sm text-gray-600">Create custom figurines with your face</p>
                        </div>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useFigurineMode}
                                onChange={(e) => setUseFigurineMode(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useFigurineMode ? 'bg-blue-600' : 'bg-gray-300'
                                }`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useFigurineMode ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </div>
                        </label>
                    </div>
                </div>

                {/* Face Upload Section */}
                {useFigurineMode && (
                    <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                        <label htmlFor="face-upload" className="block text-sm font-medium text-gray-700 mb-2">
                            Upload your face photo:
                        </label>
                        <input
                            id="face-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFaceUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG recommended</p>

                        {uploadedFace && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Uploaded face:</p>
                                <img
                                    src={uploadedFace}
                                    alt="Uploaded face"
                                    className="w-24 h-24 object-cover rounded-lg border"
                                />

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Choose a template:
                                    </label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {figurineTemplates.map((template) => (
                                            <button
                                                key={template.id}
                                                onClick={() => setSelectedTemplate(template.id)}
                                                className={`p-3 text-left rounded-lg border transition-colors ${selectedTemplate === template.id
                                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <div className="font-medium text-sm">{template.name}</div>
                                                <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                    {template.prompt.substring(0, 100)}...
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!useFigurineMode && (
                    <div className="mb-6">
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                            Describe the image you want to generate:
                        </label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Enter a detailed description of the image you want to generate..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={4}
                        />
                    </div>
                )}

                {useFigurineMode && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">🎭 Figurine Mode Active</h3>
                        <p className="text-sm text-blue-700">
                            Upload your photo and select a template above. The AI will analyze your uploaded image and create a figurine that looks like you using the selected template.
                        </p>
                        <p className="text-xs text-blue-600 mt-2">
                            ⚠️ Note: If Gemini quota is exceeded, fallback mode will use text-only generation (no image input).
                        </p>
                    </div>
                )}

                <div className="mb-6">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || (!useFigurineMode && !prompt.trim()) || (useFigurineMode && (!uploadedFace || !selectedTemplate))}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isGenerating ? 'Generating Image...' : 'Generate Image'}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        <div className="font-semibold mb-2">Error:</div>
                        <div className="mb-3">{error}</div>
                        {error.includes('quota exceeded') && (
                            <div className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
                                <strong>💡 Solution:</strong>
                                <ul className="mt-2 space-y-1">
                                    <li>• This error should not occur with Pollinations.ai (free service)</li>
                                    <li>• Check your internet connection</li>
                                    <li>• Try again in a few moments</li>
                                    <li>• Visit <a href="https://pollinations.ai/" target="_blank" rel="noopener noreferrer" className="underline">Pollinations.ai</a> for more info</li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {result && (
                    <div className="mb-6">
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Generated Image:</h3>
                            <div className="text-center">
                                <img
                                    src={`data:image/png;base64,${result.imageData}`}
                                    alt="Generated"
                                    className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                                />
                            </div>
                            <div className="mt-4 text-center">
                                <button
                                    onClick={handleDownload}
                                    className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                                >
                                    Download Image
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Example Prompts:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {examplePrompts.map((example, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    if (useFigurineMode) {
                                        // For figurine mode, select the corresponding template
                                        const templateIds = ['sculpture-desk', 'action-figure', 'bust-sculpture', 'miniature-figure'];
                                        setSelectedTemplate(templateIds[index]);
                                    } else {
                                        setPrompt(example);
                                    }
                                }}
                                className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                            >
                                <span className="text-sm text-gray-600 line-clamp-3">
                                    {example}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        {useFigurineMode ? 'Tips for Figurine Mode:' : 'Tips for Better Results:'}
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                        {useFigurineMode ? (
                            <>
                                <li>• Upload a clear, well-lit photo of your face</li>
                                <li>• Choose the template that best fits your desired style</li>
                                <li>• AI will automatically analyze your photo and create a figurine</li>
                                <li>• Each template creates a different type of figurine/sculpture</li>
                                <li>• Results will show your actual face in the selected figurine style</li>
                            </>
                        ) : (
                            <>
                                <li>• Be specific about style, lighting, and composition</li>
                                <li>• Include details about colors, textures, and mood</li>
                                <li>• Mention camera angles or artistic styles when relevant</li>
                                <li>• Specify image format (square, landscape, portrait) if needed</li>
                                <li>• Use descriptive adjectives to enhance visual quality</li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ImageGenerator;
