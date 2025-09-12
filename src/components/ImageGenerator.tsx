import React from 'react';
import { generateImage, ImageGenerationResult } from '../utils/image-generator';

const ImageGenerator = () => {
    const useState = (React as { useState: <T>(initial: T) => [T, (value: T) => void] }).useState;
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<ImageGenerationResult | null>(null);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setResult(null);

        try {
            const imageResult = await generateImage(prompt);
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

    const examplePrompts = [
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
                        Generate images from text descriptions using <a href="https://pollinations.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Pollinations.ai</a> (Free AI Image Generation).
                    </p>
                </div>

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

                <div className="mb-6">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
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
                                onClick={() => setPrompt(example)}
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
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Tips for Better Results:</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Be specific about style, lighting, and composition</li>
                        <li>• Include details about colors, textures, and mood</li>
                        <li>• Mention camera angles or artistic styles when relevant</li>
                        <li>• Specify image format (square, landscape, portrait) if needed</li>
                        <li>• Use descriptive adjectives to enhance visual quality</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ImageGenerator;
