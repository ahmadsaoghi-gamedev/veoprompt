// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState } from 'react';
import { generateASMRSlicePrompt } from '../utils/asmr-slice-generator';

interface ASMRSliceResult {
    version: string;
    mode: 'asmr' | 'epic';
    prompt: string;
    meta: {
        word_count: number;
        camera: string;
        lighting: string;
        must_have: {
            cutting_board: boolean;
            black_background: boolean;
            gloves_and_knife: boolean;
        };
        fx: string[];
        pacing: string;
        transition: string;
        sound_design: string[];
    };
    files_used: {
        used: boolean;
        ids: string[];
        notice: string;
    };
}

const ASMRSlicePromptGenerator = () => {
    const [userInput, setUserInput] = useState('');
    const [result, setResult] = useState<ASMRSliceResult | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!userInput.trim()) {
            setError('Please enter a slice idea');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setResult(null);

        try {
            const generatedResult = generateASMRSlicePrompt(userInput.trim());
            setResult(generatedResult);
        } catch (err) {
            setError('Failed to generate ASMR prompt');
            console.error('ASMR generation error:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const copyJSON = () => {
        if (result) {
            copyToClipboard(JSON.stringify(result, null, 2));
        }
    };

    const copyPrompt = () => {
        if (result) {
            copyToClipboard(result.prompt);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-4">
                    🎬 ASMR Slice Prompt Generator
                </h1>
                <p className="text-xl text-blue-200 mb-2">
                    Cinematic Slice Prompt Maker - Anti-Mainstream & Spectacular
                </p>
                <p className="text-lg text-gray-300">
                    Transform simple ideas into stunning Veo3-ready cinematic prompts
                </p>
            </div>

            {/* Input Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">✨ Input Your Slice Idea</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-white font-semibold mb-2">
                            Slice Concept (e.g., "slice earth", "slice planets", "slice forest", "slice moon", "slice ocean")
                        </label>
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Enter your slice idea..."
                            className="w-full p-4 rounded-xl bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                        />
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-blue-200">
                        <span className="bg-blue-500/20 px-3 py-1 rounded-full">🌍 slice earth</span>
                        <span className="bg-blue-500/20 px-3 py-1 rounded-full">🪐 slice planets</span>
                        <span className="bg-blue-500/20 px-3 py-1 rounded-full">🌲 slice forest</span>
                        <span className="bg-blue-500/20 px-3 py-1 rounded-full">🌙 slice moon</span>
                        <span className="bg-blue-500/20 px-3 py-1 rounded-full">🌊 slice ocean</span>
                        <span className="bg-blue-500/20 px-3 py-1 rounded-full">⚡ slice lightning</span>
                        <span className="bg-blue-500/20 px-3 py-1 rounded-full">💎 slice diamond</span>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !userInput.trim()}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <span className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Generating Spectacular Prompt...
                            </span>
                        ) : (
                            '🎬 Generate Cinematic ASMR Prompt'
                        )}
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
                    <p className="text-red-200">{error}</p>
                </div>
            )}

            {/* Result Display */}
            {result && (
                <div className="space-y-6">
                    {/* Mode Indicator */}
                    <div className="text-center">
                        <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-bold ${result.mode === 'asmr'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                            : 'bg-red-500/20 text-red-300 border border-red-500/50'
                            }`}>
                            {result.mode === 'asmr' ? '🧘 ASMR Mode' : '💥 EPIC Mode'}
                        </div>
                    </div>

                    {/* Generated Prompt */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-white">🎬 Generated Cinematic Prompt</h3>
                            <button
                                onClick={copyPrompt}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                📋 Copy Prompt
                            </button>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                            <p className="text-white leading-relaxed text-lg">{result.prompt}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
                            <span>Word Count: {result.meta.word_count}</span>
                            <span>Mode: {result.mode.toUpperCase()}</span>
                        </div>
                    </div>

                    {/* Meta Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Camera & Lighting */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <h4 className="text-xl font-bold text-white mb-4">📹 Cinematography</h4>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-blue-300 font-semibold">Camera:</span>
                                    <p className="text-white">{result.meta.camera}</p>
                                </div>
                                <div>
                                    <span className="text-blue-300 font-semibold">Lighting:</span>
                                    <p className="text-white">{result.meta.lighting}</p>
                                </div>
                                <div>
                                    <span className="text-blue-300 font-semibold">Pacing:</span>
                                    <p className="text-white">{result.meta.pacing}</p>
                                </div>
                                <div>
                                    <span className="text-blue-300 font-semibold">Transition:</span>
                                    <p className="text-white">{result.meta.transition}</p>
                                </div>
                            </div>
                        </div>

                        {/* Effects & Sound */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <h4 className="text-xl font-bold text-white mb-4">🎭 Effects & Sound</h4>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-purple-300 font-semibold">Visual FX:</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {result.meta.fx.map((effect, index) => (
                                            <span key={index} className="bg-purple-500/20 text-purple-200 px-2 py-1 rounded text-sm">
                                                {effect}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-green-300 font-semibold">Sound Design:</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {result.meta.sound_design.map((sound, index) => (
                                            <span key={index} className="bg-green-500/20 text-green-200 px-2 py-1 rounded text-sm">
                                                {sound}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Must Have Elements */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <h4 className="text-xl font-bold text-white mb-4">✅ Must Have Elements</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className={`p-4 rounded-xl border ${result.meta.must_have.cutting_board
                                ? 'bg-green-500/20 border-green-500/50 text-green-200'
                                : 'bg-red-500/20 border-red-500/50 text-red-200'
                                }`}>
                                <div className="flex items-center">
                                    <span className="text-2xl mr-2">🪵</span>
                                    <span className="font-semibold">Cutting Board</span>
                                </div>
                            </div>
                            <div className={`p-4 rounded-xl border ${result.meta.must_have.black_background
                                ? 'bg-green-500/20 border-green-500/50 text-green-200'
                                : 'bg-red-500/20 border-red-500/50 text-red-200'
                                }`}>
                                <div className="flex items-center">
                                    <span className="text-2xl mr-2">⚫</span>
                                    <span className="font-semibold">Black Background</span>
                                </div>
                            </div>
                            <div className={`p-4 rounded-xl border ${result.meta.must_have.gloves_and_knife
                                ? 'bg-green-500/20 border-green-500/50 text-green-200'
                                : 'bg-red-500/20 border-red-500/50 text-red-200'
                                }`}>
                                <div className="flex items-center">
                                    <span className="text-2xl mr-2">🧤🔪</span>
                                    <span className="font-semibold">Gloves & Knife</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* JSON Output */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-bold text-white">📄 JSON Output</h4>
                            <button
                                onClick={copyJSON}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                📋 Copy JSON
                            </button>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 border border-white/10 overflow-x-auto">
                            <pre className="text-green-300 text-sm whitespace-pre-wrap">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">📖 How It Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
                    <div>
                        <h4 className="font-semibold text-blue-300 mb-2">🧘 ASMR Mode</h4>
                        <ul className="text-sm space-y-1 text-gray-300">
                            <li>• Calm, tactile, macro ASMR slicing</li>
                            <li>• Surreal catastrophic reveals</li>
                            <li>• Close-up, shallow depth of field</li>
                            <li>• Deliberate slow slice motion</li>
                            <li>• Tactile ASMR sounds</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-red-300 mb-2">💥 EPIC Mode</h4>
                        <ul className="text-sm space-y-1 text-gray-300">
                            <li>• Explosive, powerful CGI trailer style</li>
                            <li>• Destructive grandeur</li>
                            <li>• Medium/wide framing + quick cuts</li>
                            <li>• Spectacular slow-motion explosions</li>
                            <li>• Immersive sound cues</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-4 p-4 bg-blue-500/20 rounded-xl border border-blue-500/50">
                    <p className="text-blue-200 text-sm">
                        <strong>Auto-Detection:</strong> Keywords like "planet", "universe", "explosion", "sun", "lightning", "apocalypse" trigger EPIC mode. Everything else uses ASMR mode.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ASMRSlicePromptGenerator;
