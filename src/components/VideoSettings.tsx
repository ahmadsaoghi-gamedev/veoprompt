import React from 'react';
import { CaptionSettings, LanguageSettings } from '../types';

interface VideoSettingsProps {
  captions: CaptionSettings;
  languages: LanguageSettings;
  onCaptionChange: (settings: CaptionSettings) => void;
  onLanguageChange: (settings: LanguageSettings) => void;
}

const VideoSettings: React.FC<VideoSettingsProps> = ({
  captions,
  languages,
  onCaptionChange,
  onLanguageChange
}) => {
  const handleCaptionToggle = (enabled: boolean) => {
    onCaptionChange({
      ...captions,
      enabled,
      accuracy: enabled ? 'high' : captions.accuracy
    });
  };

  const handleAccuracyChange = (accuracy: 'high' | 'medium' | 'low') => {
    onCaptionChange({
      ...captions,
      accuracy
    });
  };

  const handleDialogLanguageChange = (language: LanguageSettings['dialog']) => {
    onLanguageChange({
      ...languages,
      dialog: language
    });
  };

  const handleMonologLanguageChange = (language: LanguageSettings['monolog']) => {
    onLanguageChange({
      ...languages,
      monolog: language
    });
  };

  return (
    <div className="space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
      {/* Caption Settings */}
      <div className="caption-control">
        <h3 className="text-lg font-semibold mb-3">Caption Settings</h3>
        <div className="toggle-group space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="captions"
              checked={!captions.enabled}
              onChange={() => handleCaptionToggle(false)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span>No Captions (Recommended)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="captions"
              checked={captions.enabled}
              onChange={() => handleCaptionToggle(true)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span>With Captions</span>
          </label>

          {captions.enabled && (
            <div className="ml-6 mt-3 space-y-3">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption Accuracy
                </label>
                <select
                  value={captions.accuracy}
                  onChange={(e) => handleAccuracyChange(e.target.value as 'high' | 'medium' | 'low')}
                  className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="high">High Precision</option>
                  <option value="medium">Medium</option>
                  <option value="low">Basic</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Language Settings */}
      <div className="language-control">
        <h3 className="text-lg font-semibold mb-3">Language Settings</h3>
        <div className="space-y-4">
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dialog Language
            </label>
            <select
              value={languages.dialog}
              onChange={(e) => handleDialogLanguageChange(e.target.value as LanguageSettings['dialog'])}
              className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="indonesian">Bahasa Indonesia</option>
              <option value="sundanese">Bahasa Sunda</option>
              <option value="betawi">Bahasa Betawi</option>
              <option value="javanese">Bahasa Jawa</option>
              <option value="minang">Bahasa Minang</option>
            </select>
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monolog/Narration Language
            </label>
            <select
              value={languages.monolog}
              onChange={(e) => handleMonologLanguageChange(e.target.value as LanguageSettings['monolog'])}
              className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="indonesian">Bahasa Indonesia</option>
              <option value="sundanese">Bahasa Sunda</option>
              <option value="betawi">Bahasa Betawi</option>
              <option value="javanese">Bahasa Jawa</option>
              <option value="minang">Bahasa Minang</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSettings;
