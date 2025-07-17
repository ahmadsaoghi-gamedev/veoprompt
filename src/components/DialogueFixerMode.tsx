import React, { useState } from 'react';
import { MessageSquare, Wand2, Copy, Download, Settings2, AlertCircle } from 'lucide-react';
import { fixMultiCharacterDialogue } from '../utils/api';
import { getSettings } from '../utils/database';
import { DialogueFixerSettings, DialogueBeat } from '../types';

const DialogueFixerMode: React.FC = () => {
    const [problematicDialogue, setProblematicDialogue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fixedDialogue, setFixedDialogue] = useState<{
        scene: string;
        characters: Array<{
            name: string;
            description: string;
            position: string;
        }>;
        dialogueSequence: DialogueBeat[];
        tips: string[];
    } | null>(null);

    const [settings, setSettings] = useState<DialogueFixerSettings>({
        sceneDuration: 11,
        numberOfCharacters: 2,
        includeNarration: false,
        language: 'indonesian',
        tone: 'neutral'
    });

    const [showSettings, setShowSettings] = useState(false);

    const exampleDialogue = `[Brian (concerned), Mom, they're hungry?] 
[Ibu (softly), Honey, life's tough.] 
[Brian (determined), We gotta help!] 
[Ibu (resigned), What can we do, Brian?]`;

    const handleFixDialogue = async () => {
        if (!problematicDialogue.trim()) {
            setError('Please enter dialogue to fix');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setFixedDialogue(null);

        try {
            const apiSettings = await getSettings();
            if (!apiSettings?.isActive) {
                throw new Error('API is not configured. Please set up your API key in the API Settings.');
            }

            const result = await fixMultiCharacterDialogue(
                problematicDialogue,
                settings,
                apiSettings
            );

            setFixedDialogue(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fix dialogue');
        } finally {
            setIsProcessing(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const downloadAsText = () => {
        if (!fixedDialogue) return;

        const content = formatFixedDialogueAsText(fixedDialogue);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fixed-dialogue-gemini-veo3.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const formatFixedDialogueAsText = (dialogue: typeof fixedDialogue) => {
        if (!dialogue) return '';

        let text = `SCENE: ${dialogue.scene}\n\n`;

        text += 'CHARACTERS:\n';
        dialogue.characters.forEach(char => {
            text += `- ${char.name}: ${char.description} (Position: ${char.position})\n`;
        });

        text += '\nDIALOGUE SEQUENCE:\n';
        dialogue.dialogueSequence.forEach(beat => {
            text += `\n[BEAT ${beat.beatNumber} - ${beat.timing}]\n`;
            text += `CHARACTER: ${beat.character}\n`;
            text += `ACTION: ${beat.action}\n`;
            text += `DIALOGUE: "${beat.dialogue}"\n`;
            text += `CAMERA: ${beat.camera}\n`;
            text += `AUDIO: ${beat.audio}\n`;
        });

        if (dialogue.tips && dialogue.tips.length > 0) {
            text += '\n\nTIPS FOR IMPROVEMENT:\n';
            dialogue.tips.forEach((tip, index) => {
                text += `${index + 1}. ${tip}\n`;
            });
        }

        return text;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Dialogue Fixer for Gemini Veo 3</h1>
                        <p className="text-gray-600">Transform messy multi-character dialogues into clear BEAT system format</p>
                    </div>
                </div>
            </div>

            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Problematic Dialogue</h2>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <Settings2 className="w-4 h-4" />
                        Settings
                    </button>
                </div>

                {showSettings && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Scene Duration (seconds)
                                </label>
                                <input
                                    type="number"
                                    min="5"
                                    max="30"
                                    value={settings.sceneDuration}
                                    onChange={(e) => setSettings({ ...settings, sceneDuration: parseInt(e.target.value) || 11 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Language
                                </label>
                                <select
                                    value={settings.language}
                                    onChange={(e) => setSettings({ ...settings, language: e.target.value as 'indonesian' | 'english' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="indonesian">Indonesian</option>
                                    <option value="english">English</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tone
                                </label>
                                <select
                                    value={settings.tone}
                                    onChange={(e) => setSettings({ ...settings, tone: e.target.value as 'dramatic' | 'comedic' | 'neutral' | 'emotional' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="neutral">Neutral</option>
                                    <option value="dramatic">Dramatic</option>
                                    <option value="comedic">Comedic</option>
                                    <option value="emotional">Emotional</option>
                                </select>
                            </div>
                            <div className="flex items-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.includeNarration}
                                        onChange={(e) => setSettings({ ...settings, includeNarration: e.target.checked })}
                                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Include Narration</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <textarea
                        value={problematicDialogue}
                        onChange={(e) => setProblematicDialogue(e.target.value)}
                        placeholder={`Enter your problematic dialogue here...\n\nExample:\n${exampleDialogue}`}
                        className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={() => setProblematicDialogue(exampleDialogue)}
                            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Use Example
                        </button>
                        <button
                            onClick={handleFixDialogue}
                            disabled={isProcessing || !problematicDialogue.trim()}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Wand2 className="w-5 h-5" />
                            {isProcessing ? 'Fixing Dialogue...' : 'Fix Dialogue'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}
            </div>

            {/* Fixed Dialogue Output */}
            {fixedDialogue && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Fixed Dialogue (BEAT System)</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => copyToClipboard(formatFixedDialogueAsText(fixedDialogue))}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <Copy className="w-4 h-4" />
                                Copy
                            </button>
                            <button
                                onClick={downloadAsText}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                    </div>

                    {/* Scene Description */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-700 mb-2">Scene</h3>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{fixedDialogue.scene}</p>
                    </div>

                    {/* Characters */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-700 mb-2">Characters</h3>
                        <div className="space-y-2">
                            {fixedDialogue.characters.map((char, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-medium text-gray-800">{char.name}</p>
                                    <p className="text-sm text-gray-600">{char.description}</p>
                                    <p className="text-sm text-gray-500">Position: {char.position}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dialogue Sequence */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-700 mb-2">Dialogue Sequence</h3>
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700">
                                <strong>Speaking Order:</strong> Characters speak in the exact order they appear in the original dialogue.
                                Character 1 speaks first, Character 2 responds, and so on.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {fixedDialogue.dialogueSequence.map((beat) => {
                                const characterIndex = fixedDialogue.characters.findIndex(char => char.name === beat.character) + 1;
                                return (
                                    <div key={beat.beatNumber} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-purple-600">BEAT {beat.beatNumber}</span>
                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                                    Character {characterIndex}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-500">{beat.timing}</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="font-medium text-gray-700">Character:</span> {beat.character}</p>
                                            <p><span className="font-medium text-gray-700">Action:</span> {beat.action}</p>
                                            <p><span className="font-medium text-gray-700">Dialogue:</span> "{beat.dialogue}"</p>
                                            <p><span className="font-medium text-gray-700">Camera:</span> {beat.camera}</p>
                                            <p><span className="font-medium text-gray-700">Audio:</span> {beat.audio}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tips */}
                    {fixedDialogue.tips && fixedDialogue.tips.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Tips for Improvement</h3>
                            <ul className="space-y-2">
                                {fixedDialogue.tips.map((tip, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-purple-500 mt-0.5">•</span>
                                        <span className="text-sm text-gray-600">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Instructions */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-800 mb-3">How to Use</h3>
                <ol className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                        <span className="font-semibold text-purple-600">1.</span>
                        <span>Paste your problematic multi-character dialogue in the input area</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-semibold text-purple-600">2.</span>
                        <span>Adjust settings like duration, language, and tone as needed</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-semibold text-purple-600">3.</span>
                        <span>Click "Fix Dialogue" to transform it into the BEAT system format</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-semibold text-purple-600">4.</span>
                        <span>Copy or download the fixed dialogue for use in Gemini Veo 3</span>
                    </li>
                </ol>
            </div>
        </div>
    );
};

export default DialogueFixerMode;
