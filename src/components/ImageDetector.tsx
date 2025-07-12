import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Upload, Image as ImageIcon, Wand2, Copy, Save, Loader } from 'lucide-react';
import { callGeminiAPI } from '../utils/api';
import { saveCharacter, saveObject, getSettings } from '../utils/database';
import { Character, VideoObject, APISettings } from '../types';

const ImageDetector: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [editedPrompt, setEditedPrompt] = useState<string>('');
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [apiSettings, setApiSettings] = useState<APISettings | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setAnalysisResult('');
      setEditedPrompt('');
      setShowSaveOptions(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;

    if (!apiSettings || !apiSettings.isActive) {
      alert('Please configure and validate your API key in the API Settings first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Save character logic
      const prompt = `Analyze this image in detail and provide a comprehensive description that can be used for video generation. Include:

1. Main subjects (people, objects, animals)
2. Physical characteristics and appearance details
3. Setting and environment
4. Actions or poses
5. Lighting and mood
6. Colors and visual style
7. Any text or signage visible

Format the response as a detailed, professional video prompt that could be used for AI video generation. Be specific about visual elements, positioning, and atmosphere.`;

      const result = await callGeminiAPI(prompt, uploadedImage, apiSettings);
      setAnalysisResult(result);
      setEditedPrompt(result);
      setShowSaveOptions(true);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze image. Please check your API settings.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      // Save object logic
      await navigator.clipboard.writeText(editedPrompt);
      alert('Prompt copied to clipboard!');
    } catch {
      alert('Failed to copy to clipboard');
    }
  };

  const saveAsCharacter = async () => {
    const name = prompt('Enter character name:');
    if (!name) return;

    try {
      const character: Character = {
        id: `char_${Date.now()}`,
        name,
        age: 25,
        hairColor: 'Unknown',
        faceShape: 'Unknown',
        accessories: '',
        bodyShape: 'Unknown',
        height: 'Unknown',
        additionalFeatures: editedPrompt,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await saveCharacter(character);
      alert('Character saved successfully!');
    } catch (error) {
      console.error('Failed to save character:', error);
      alert('Failed to save character');
    }
  };

  const saveAsObject = async () => {
    const name = prompt('Enter object name:');
    if (!name) return;

    const category = prompt('Enter category (products/clothing/vehicles/etc.):') || 'other';

    try {
      const object: VideoObject = {
        id: `obj_${Date.now()}`,
        name,
        category,
        description: editedPrompt,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await saveObject(object);
      alert('Object saved successfully!');
    } catch (error) {
      console.error('Failed to save object:', error);
      alert('Failed to save object');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Detektor Gambar & Analisis AI - Shabira Prompt Lab</title>
        <meta name="description" content="Unggah gambar apa pun dan biarkan AI menganalisisnya secara detail, mengubah visual menjadi prompt video sinematik yang siap pakai." />
      </Helmet>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Image Detector & Analyzer</h2>
        <p className="text-lg text-gray-600">
          Upload images to automatically generate detailed video prompts using AI analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Image Upload & Analysis
          </h3>

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${uploadedImage
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !uploadedImage && fileInputRef.current?.click()}
          >
            {uploadedImage ? (
              <div className="space-y-4">
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="max-h-64 mx-auto rounded-lg shadow-md"
                />
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedImage(null);
                      setAnalysisResult('');
                      setEditedPrompt('');
                      setShowSaveOptions(false);
                    }}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove Image
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      analyzeImage();
                    }}
                    disabled={isAnalyzing || !apiSettings?.isActive}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Analyze Image
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-blue-600">Drop your image here</p>
                  <p className="text-gray-500">or click to browse files</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Supports JPG, PNG, WebP (max 5MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />
        </div>

        {/* Results Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Wand2 className="w-6 h-6" />
            Analysis Results
          </h3>

          {analysisResult ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generated Prompt (Editable)
                </label>
                <textarea
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Analysis results will appear here..."
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy Prompt
                </button>

                {showSaveOptions && (
                  <>
                    <button
                      onClick={saveAsCharacter}
                      className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save as Character
                    </button>
                    <button
                      onClick={saveAsObject}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save as Object
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-gray-500">Your generated scenes will appear here...</p>
              <p className="text-sm">AI will generate a detailed video prompt based on the image content</p>
              <p className="text-sm">AI will generate a detailed video prompt based on the image content</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-bold text-blue-800 mb-2">💡 Tips for Better Analysis</h4>
        <ul className="text-blue-700 space-y-1 text-sm">
          <li>• Use high-quality, well-lit images for better analysis</li>
          <li>• Images with clear subjects and minimal clutter work best</li>
          <li>• The AI can identify people, objects, settings, and visual styles</li>
          <li>• Edit the generated prompt to add specific details or requirements</li>
          <li>• Save frequently used characters and objects for quick access</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageDetector;
