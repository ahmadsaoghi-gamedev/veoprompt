import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Video, Sparkles, Film, Wand2, MessageSquare } from 'lucide-react';

interface GuidePageProps {
    onBack?: () => void;
}

const GuidePage: React.FC<GuidePageProps> = ({ onBack }) => {
    return (
        <div className="guide-page p-6 max-w-4xl mx-auto">
            <Helmet>
                <title>How to make a movie with AI: Complete Guide to Cinematic Video Prompt - Shabira Prompt Lab</title>
                <meta name="description" content="Panduan lengkap cara membuat film dengan AI. Pelajari tips membuat prompt video sinematik, animasi 3D AI, dan video vertikal 9:16 untuk TikTok dengan AI video generator." />
                <meta name="keywords" content="cara membuat film dengan AI, prompt video sinematik, animasi 3D AI, AI video generator, video vertikal 9:16, TikTok video prompt, alternatif Veo3, Pixar style animation prompt, aplikasi untuk membuat cerita film, AI untuk video vertikal" />
            </Helmet>

            {onBack && (
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-700"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Dashboard
                </button>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">
                    5 Tips on How to Make a Movie With Ai and Cinematic Video Prompt
                </h1>
                <p className="text-lg text-gray-600">
                    Complete guide for beginners and professionals in using AI Video Generator
                </p>
            </div>

            <article className="prose prose-lg max-w-none">
                <section className="mb-10 bg-blue-50 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Video className="w-6 h-6 text-blue-600" />
                        1. Understand the basic AI video generator & alternative veo3
                    </h2>
                    <p className="mb-4">
                        To get the <strong>best AI video results</strong>, your prompt must be detailed and specific.
                        Shabira Prompt Lab is a <strong>Veo3 alternative</strong> that helps you create <strong>high-quality cinematic video prompts</strong> with Gemini technology.

                    </p>
                    <div className="bg-white p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Important Tips:</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Use detailed visual descriptions (lighting, camera angle, color palette)</li>
                            <li>Define a clear mood and atmosphere</li>
                            <li>Mention visual style references (Pixar, Studio Ghibli, etc.)</li>
                            <li>Select the appropriate aspect ratio: 16:9 for YouTube, 9:16 for TikTok</li>
                        </ul>
                    </div>

                </section>

                <section className="mb-10 bg-purple-50 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                        2. Creating AI 3D Animation in Pixar Style
                    </h2>
                    <p className="mb-4">
                        When creating <strong>AI 3D animations</strong>, mentioning a specific style like
                        <strong> Pixar style animation prompt</strong> or Studio Ghibli will deliver consistent results.
                        Our Concept Visualization Mode offers 14+ professional animation style presets.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Example of an Effective Prompt:</h3>
                        <p className="italic text-gray-700 mb-2">
                            "A cheerful robot chef in a futuristic kitchen, Pixar animation style, bright colorful lighting,
                            dynamic camera movement, ultra-detailed 3D rendering, 8K quality"
                        </p>
                        <p className="text-sm text-gray-600">
                            Result: High-quality 3D animated video with distinctive Pixar visual characteristics
                        </p>
                    </div>

                </section>

                <section className="mb-10 bg-green-50 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Film className="w-6 h-6 text-green-600" />
                        3. Creating 9:16 Vertical Videos for TikTok
                    </h2>
                    <p className="mb-4">
                        Creating <strong>9:16 vertical videos for TikTok</strong> requires different framing instructions.
                        <strong>AI for vertical videos</strong> must be explicitly informed about portrait composition.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Vertical Video Tips:</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Use "vertical framing" or "portrait orientation" in the prompt</li>
                            <li>Focus the action in the center of the frame for optimal mobile results</li>
                            <li>Prefer close-up and medium shots over wide shots</li>
                            <li>Add "9:16 aspect ratio" at the end of the prompt to ensure the correct format</li>
                        </ul>
                    </div>

                </section>

                <section className="mb-10 bg-yellow-50 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Wand2 className="w-6 h-6 text-yellow-600" />
                        4. Surreal Story Generator with Anomaly Mode
                    </h2>
                    <p className="mb-4">
                        Our <strong>surreal story generator</strong> uses AI technology to create
                        <strong> AI short films</strong> with unique twists. Anomaly Mode is an
                        <strong> application for creating film stories</strong> that produces non-linear narratives and never-before-seen visuals.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">How to Use:</h3>
                        <ol className="list-decimal pl-6 space-y-2">
                            <li>Enter your basic story idea</li>
                            <li>Select the desired "twist" or strangeness elements</li>
                            <li>Define the visual style from the Brain Prompt library</li>
                            <li>Generate multiple scenes with consistent dialogue</li>
                        </ol>
                    </div>

                </section>

                <section className="mb-10 bg-red-50 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-red-600" />
                        5. How to Create Natural AI Dialogue
                    </h2>
                    <p className="mb-4">
                        The question "<strong>how to create AI dialogue</strong>" often comes up.
                        The key is to provide clear character context and use
                        <strong> TikTok video prompts</strong> that include personality traits.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">AI Dialogue Framework:</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Character</strong>: Define personality, background, and speaking style</li>
                            <li><strong>Context</strong>: Explain the situation and emotions in the scene</li>
                            <li><strong>Tone</strong>: Casual for TikTok, formal for corporate videos</li>
                            <li><strong>Language</strong>: Choose language and accent suited to the target audience</li>
                        </ul>
                    </div>

                </section>

                <section className="mb-10 bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4">Conclusion: Start Creating Your AI Film</h2>
                    <p className="mb-4">
                        By following this guide, you are ready to use the <strong>AI video generator</strong> to
                        create high-quality content. Shabira Prompt Lab provides all the tools you need,
                        from the <strong>prompt generator</strong> to the powerful <strong>Veo3 alternative</strong>.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                        <p className="font-semibold mb-2">Next Steps:</p>
                        <ol className="list-decimal pl-6 space-y-2">
                            <li>Choose the mode that fits your needs (Anomaly, Concept Viz, etc.)</li>
                            <li>Use the Brain Prompt library for style references</li>
                            <li>Experiment with various aspect ratios</li>
                            <li>Save your best prompts in the Prompt Bank for future use</li>
                        </ol>
                    </div>

                </section>

                <section className="mt-10 p-6 bg-gray-100 rounded-lg text-center">
                    <h3 className="text-xl font-bold mb-4">Ready to Create Your First AI Film?</h3>
                    <p className="mb-4">
                        Use Shabira Prompt Lab now and transform your ideas into high-quality cinematic videos!
                    </p>
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Get Started
                        </button>
                    )}
                </section>
            </article>
        </div>
    );
};

export default GuidePage;
