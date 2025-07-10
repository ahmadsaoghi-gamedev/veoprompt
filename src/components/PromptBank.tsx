import React, { useState, useEffect } from 'react';
import { Database, Search, Filter, Trash2, Copy, Download, Upload, Zap } from 'lucide-react';
import { VideoPrompt, CaptionSettings, LanguageSettings } from '../types';
import VideoSettings from './VideoSettings';
import { getPrompts, deletePrompt, savePrompt } from '../utils/database';
import { exportData, importData } from '../utils/storage';

const PromptBank: React.FC = () => {
  const [prompts, setPrompts] = useState<VideoPrompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<VideoPrompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'satset' | 'manual' | 'marketing'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'type'>('date');
  const [isLoading, setIsLoading] = useState(true);
  const [captionSettings, setCaptionSettings] = useState<CaptionSettings>({
    enabled: false,
    accuracy: 'high',
    language: 'match_dialog',
    font: 'Arial',
    position: 'bottom'
  });
  const [languageSettings, setLanguageSettings] = useState<LanguageSettings>({
    dialog: 'indonesian',
    monolog: 'indonesian'
  });

  useEffect(() => {
    loadPrompts();
  }, []);

  useEffect(() => {
    filterAndSortPrompts();
  }, [prompts, searchTerm, filterType, sortBy]);

  const loadPrompts = async () => {
    try {
      setIsLoading(true);
      const data = await getPrompts();
      setPrompts(data);
    } catch (err) {
      console.error('Failed to load prompts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortPrompts = () => {
    let filtered = prompts;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(prompt => prompt.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.mainDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredPrompts(filtered);
  };

  const handleDeletePrompt = async (id: string) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      try {
        await deletePrompt(id);
        await loadPrompts();
      } catch (err) {
        console.error('Failed to delete prompt:', err);
        alert('Failed to delete prompt');
      }
    }
  };

  const enhancePrompt = (prompt: VideoPrompt): string => {
    return prompt.scenes.map(scene => {
      return `**Enhanced Cinematic Video Production:**\n` +
             `**Visual Concept:**\n${scene.visualDescription}\n\n` +
             `**Location:**\n${scene.location}\n\n` +
             `**Time:**\n${scene.time}\n\n` +
             `**Weather:**\n${scene.weather}\n\n` +
             `**Cinematography:**\n` +
             scene.cinematography.cameraTechniques.map(t => `- ${t}`).join('\n') + '\n' +
             `- Lighting: ${scene.cinematography.lighting}\n` +
             `- Color Palette: ${scene.cinematography.colorPalette}\n\n` +
             `**Audio:**\n` +
             `Dialogue in ${languageSettings.dialog}:\n` +
             scene.audio.dialogue.map(d => 
               `${d.character} (${d.description}): "${d.text}"`
             ).join('\n') + '\n\n' +
             `Ambient Sounds:\n` +
             scene.audio.ambientSounds.map(s => 
               `${s.name} (${s.volume})`
             ).join('\n') + '\n\n' +
             `Audio Mix:\n${scene.audio.audioMix}\n\n` +
             `**Production Quality:**\n` +
             `- Resolution: ${prompt.settings.resolution}\n` +
             `- Frame Rate: ${prompt.settings.frameRate}fps\n` +
             `${captionSettings.enabled ? 
               `- Captions: Enabled (${captionSettings.accuracy} accuracy, ${captionSettings.language})` : 
               `- Captions: Disabled (clean video output)`
             }\n` +
             `- Ultra-sharp 4K with stabilized motion`;
    }).join('\n\n--- SCENE TRANSITION ---\n\n');
  };

  const copyPromptToClipboard = async (prompt: VideoPrompt) => {
    try {
      const promptText = prompt.scenes.map(scene => {
        return `Create a cinematic and viral video\n` +
               `${scene.visualDescription}\n\n` +
               `Location\n` +
               `${scene.location}\n\n` +
               `Time\n` +
               `${scene.time}\n\n` +
               `Weather\n` +
               `${scene.weather}\n\n` +
               `Cinematography\n` +
               scene.cinematography.cameraTechniques.map(t => `- ${t}`).join('\n') + '\n' +
               `- ${scene.cinematography.lighting}\n` +
               `- ${scene.cinematography.colorPalette}\n\n` +
               `Audio\n` +
               `Dialogue in ${languageSettings.dialog}\n` +
               scene.audio.dialogue.map(d => 
                 `${d.character} with ${d.description} says "${d.text}"`
               ).join('\n') + '\n\n' +
               `Ambient Sounds\n` +
               scene.audio.ambientSounds.map(s => 
                 `${s.name} ${s.volume}`
               ).join('\n') + '\n\n' +
               `Audio Mix\n` +
               `${scene.audio.audioMix}\n\n` +
               `${captionSettings.enabled ? 
                 `Caption Settings:\n` +
                 `- Display captions: Yes\n` +
                 `- Caption language: ${captionSettings.language}\n` +
                 `- Caption accuracy: ${captionSettings.accuracy}\n` +
                 `- Sync with audio: Exact timing match\n` +
                 `- Font: Clean, readable\n` +
                 `- Position: Bottom center\n\n` :
                 `Caption Settings:\n` +
                 `- No captions display\n` +
                 `- Clean video output without text overlay\n\n`
               }` +
               `Ultra-sharp 4K quality with stabilized motion`;
      }).join('\n\n---\n\n');
      await navigator.clipboard.writeText(promptText);
      alert('Prompt berhasil disalin ke clipboard!');
    } catch (err) {
      console.error('Failed to copy prompt:', err);
      alert('Gagal menyalin prompt');
    }
  };

  const exportPrompts = () => {
    exportData(prompts, `prompt-bank-${new Date().toISOString().split('T')[0]}.json`);
  };

  const importPrompts = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await importData(file);
      if (Array.isArray(data)) {
        for (const prompt of data) {
          if (prompt.id && prompt.title && prompt.type) {
            await savePrompt(prompt);
          }
        }
        await loadPrompts();
        alert('Prompts imported successfully!');
      } else {
        alert('Invalid file format');
      }
    } catch (err) {
      console.error('Failed to import prompts:', err);
      alert('Failed to import prompts');
    }
    
    // Reset file input
    event.target.value = '';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'satset':
        return 'bg-blue-100 text-blue-800';
      case 'manual':
        return 'bg-green-100 text-green-800';
      case 'marketing':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'satset':
        return '🎬';
      case 'manual':
        return '⚙️';
      case 'marketing':
        return '📈';
      default:
        return '📝';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Prompt Bank - Repository</h2>
        <p className="text-lg text-gray-600">
          Manage, search, and organize all your saved video prompts
        </p>
      </div>

      {/* Video Settings */}
      <VideoSettings
        captions={captionSettings}
        languages={languageSettings}
        onCaptionChange={setCaptionSettings}
        onLanguageChange={setLanguageSettings}
      />

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search prompts..."
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'satset' | 'manual' | 'marketing')}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="satset">Satset</option>
                <option value="manual">Manual</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'type')}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="type">Sort by Type</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={exportPrompts}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            
            <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importPrompts}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{prompts.length}</p>
              <p className="text-sm text-gray-600">Total Prompts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎬</span>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {prompts.filter(p => p.type === 'satset').length}
              </p>
              <p className="text-sm text-gray-600">Satset</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {prompts.filter(p => p.type === 'manual').length}
              </p>
              <p className="text-sm text-gray-600">Manual</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📈</span>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {prompts.filter(p => p.type === 'marketing').length}
              </p>
              <p className="text-sm text-gray-600">Marketing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Prompts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading prompts...</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No prompts found</p>
            <p className="text-sm">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Create some prompts to see them here'}
            </p>
          </div>
        ) : (
          filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(prompt.type)}</span>
                      <h3 className="text-xl font-bold text-gray-800">{prompt.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(prompt.type)}`}>
                        {prompt.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{prompt.mainDescription}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Scenes: {prompt.scenes.length}</span>
                      <span>Duration: {prompt.settings.duration}s</span>
                      <span>Created: {new Date(prompt.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => copyPromptToClipboard(prompt)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        const enhanced = enhancePrompt(prompt);
                        await navigator.clipboard.writeText(enhanced);
                        alert('Enhanced prompt copied!');
                      }}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="Enhanced Prompt"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(prompt.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete prompt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Scenes Preview */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Scenes:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {prompt.scenes.map((scene) => (
                      <div
                        key={scene.id}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm text-gray-700">
                            Scene {scene.sceneNumber}
                          </span>
                          <span className="text-xs text-gray-500">{scene.duration}s</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-700">
                            {scene.visualDescription.substring(0, 80)}...
                          </p>
                          <div className="flex gap-2 text-xs text-gray-500">
                            <span>📍 {scene.location}</span>
                            <span>⏱ {scene.time}</span>
                          </div>
                          <div className="flex gap-2 text-xs text-gray-500">
                            <span>🎥 {scene.cinematography.cameraTechniques[0]}</span>
                            <span>💡 {scene.cinematography.lighting}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Characters and Objects */}
                {(prompt.characters.length > 0 || prompt.objects.length > 0) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex gap-6 text-sm">
                      {prompt.characters.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">Characters:</span>
                          <span className="text-gray-600 ml-2">
                            {prompt.characters.map(char => char.name).join(', ')}
                          </span>
                        </div>
                      )}
                      {prompt.objects.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">Objects:</span>
                          <span className="text-gray-600 ml-2">
                            {prompt.objects.map(obj => obj.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PromptBank;
