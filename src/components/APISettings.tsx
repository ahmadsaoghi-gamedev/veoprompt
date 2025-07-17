import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Zap, Key, Check, X, AlertCircle, Save } from 'lucide-react';
import { APISettings as APISettingsType } from '../types';
import { getSettings, saveSettings } from '../utils/database';
import { validateAPIKey } from '../utils/api';

const APISettings: React.FC = () => {
  const [settings, setSettings] = useState<APISettingsType>({
    usePrivateKey: true,
    privateKey: '',
    isActive: false,
    lastValidated: null
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; error?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await getSettings();
      if (loadedSettings) {
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Optionally, set a default state or show an error message
    }
  };

  // Set usePrivateKey to true by default since we no longer have a default key
  useEffect(() => {
    if (!settings.usePrivateKey && !settings.privateKey) {
      setSettings(prev => ({ ...prev, usePrivateKey: true }));
    }
  }, []);

  const handleValidateKey = async (key: string) => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await validateAPIKey(key);
      setValidationResult(result);

      if (result.isValid) {
        const updatedSettings = {
          ...settings,
          privateKey: key,
          usePrivateKey: true,
          isActive: true,
          lastValidated: new Date()
        };
        setSettings(updatedSettings);
        await saveSettings(updatedSettings);
      }
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationResult({ isValid: false, error: 'Validation failed due to network error' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await saveSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="space-y-8">
      <Helmet>
        <title>Pengaturan API Gemini - Shabira Prompt Lab</title>
        <meta name="description" content="Konfigurasikan kunci API Google Gemini Anda. Pilih antara kunci default atau kunci pribadi untuk kontrol penuh." />
      </Helmet>
      <div className="text-center">
        <h2 className="text-4xl font-bold gradient-title mb-4">API Settings</h2>
        <p className="text-xl text-gray-600">
          Configure your Google Generative Language API settings
        </p>
      </div>

      {/* API Status */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Zap className="w-7 h-7 icon-prompt-en" />
            API Status
          </h3>

          <div className={`status-indicator ${settings.isActive ? 'status-active' : 'status-inactive'
            }`}>
            {settings.isActive ? (
              <>
                <Check className="w-4 h-4" />
                Active
              </>
            ) : (
              <>
                <X className="w-4 h-4" />
                Inactive
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
            <div className="text-sm text-purple-600 font-semibold">Current Key</div>
            <div className="text-lg font-bold text-purple-800">
              {settings.usePrivateKey ? 'Private Key' : 'Default Key'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <div className="text-sm text-blue-600 font-semibold">Last Validated</div>
            <div className="text-lg font-bold text-blue-800">
              {settings.lastValidated
                ? new Date(settings.lastValidated).toLocaleString()
                : 'Never'
              }
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <div className="text-sm text-green-600 font-semibold">Status</div>
            <div className={`text-lg font-bold ${settings.isActive ? 'text-green-700' : 'text-red-600'
              }`}>
              {settings.isActive ? 'Ready to use' : 'Needs validation'}
            </div>
          </div>
        </div>
      </div>

      {/* API Key Configuration */}
      <div className="glass-card p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Key className="w-7 h-7 icon-prompt-id" />
          Google Generative Language API Key
        </h3>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 icon-prompt-en mt-1" />
              <div className="text-blue-800">
                <p className="font-bold text-lg mb-2">API Key Required</p>
                <p className="mb-3">You need to provide your own Google Generative Language API key to use this application. This ensures better security, reliability, and removes usage limitations.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Your Google Generative Language API Key
            </label>
            <input
              type="password"
              value={settings.privateKey}
              onChange={(e) => setSettings({ ...settings, privateKey: e.target.value })}
              className="custom-input w-full"
              placeholder="Enter your API key (starts with AIza...)..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleValidateKey(settings.privateKey)}
              disabled={isValidating || !settings.privateKey.trim()}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 font-semibold"
            >
              {isValidating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Validate API Key
                </>
              )}
            </button>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 icon-idea-bulb mt-1" />
              <div className="text-yellow-800">
                <p className="font-bold text-lg mb-3">How to get your API key:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Google Cloud Console</a></li>
                  <li>Create a new project or select an existing one</li>
                  <li>Enable the "Generative Language API" (also called "AI Platform API")</li>
                  <li>Go to "Credentials" and create an API key</li>
                  <li>Restrict the API key to only the "Generative Language API" for security</li>
                  <li>Copy and paste the key here</li>
                </ol>
                <p className="mt-3 text-sm font-semibold">💡 Tip: Your API key should start with "AIza" and be about 39 characters long.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Result */}
      {validationResult && (
        <div className={`rounded-2xl p-6 ${validationResult.isValid
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
            : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'
          }`}>
          <div className="flex items-start gap-4">
            {validationResult.isValid ? (
              <>
                <Check className="w-6 h-6 text-green-600 mt-1" />
                <div className="text-green-800">
                  <p className="font-bold text-lg">API Key Valid!</p>
                  <p>Your API key is working correctly and ready to use.</p>
                </div>
              </>
            ) : (
              <>
                <X className="w-6 h-6 text-red-600 mt-1" />
                <div className="text-red-800">
                  <p className="font-bold text-lg">API Key Invalid</p>
                  <p className="mb-2">{validationResult.error || 'Please check your API key and ensure the Generative Language API is enabled.'}</p>
                  <div className="text-sm">
                    <p className="font-semibold">Common issues:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>API key format is incorrect (should start with "AIza")</li>
                      <li>Generative Language API is not enabled in Google Cloud Console</li>
                      <li>API key doesn't have permission for the Generative Language API</li>
                      <li>API key has exceeded its quota or billing is not set up</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Save Settings */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="btn-highlight px-8 py-4 rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>

      {/* Usage Guidelines */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 rounded-2xl p-8">
        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-3 text-xl">
          <AlertCircle className="w-6 h-6 icon-idea-bulb" />
          Usage Guidelines & Security
        </h4>
        <ul className="text-gray-700 space-y-3 text-lg">
          <li className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">•</span>
            Your API key is required to access Google's Generative Language API
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">•</span>
            Your API key is stored locally in your browser and never sent to our servers
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">•</span>
            You have full control over your API usage and billing through Google Cloud Console
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">•</span>
            Restrict your API key to only the "Generative Language API" for better security
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">•</span>
            Monitor your API usage and set up billing alerts in Google Cloud Console
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">•</span>
            Validate your key after any changes to ensure functionality
          </li>
        </ul>
      </div>
    </div>
  );
};

export default APISettings;
