import React, { useState, useEffect } from 'react';
import { Zap, Key, Check, X, AlertCircle, Save } from 'lucide-react';
import { APISettings as APISettingsType } from '../types';
import { getSettings, saveSettings } from '../utils/database';
import { validateAPIKey } from '../utils/api';
import { useTranslation } from 'react-i18next';

const APISettings: React.FC = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<APISettingsType>({
    usePrivateKey: false,
    privateKey: '',
    isActive: false,
    lastValidated: null
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const DEFAULT_API_KEY = 'AIzaSyBBQW5vk3boXhE5aief20oVmbLizso_Y6Q';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleValidateKey = async (key: string) => {
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      const isValid = await validateAPIKey(key);
      setValidationResult(isValid ? 'valid' : 'invalid');
      
      if (isValid) {
        const updatedSettings = {
          ...settings,
          isActive: true,
          lastValidated: new Date()
        };
        setSettings(updatedSettings);
        await saveSettings(updatedSettings);
      }
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationResult('invalid');
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

  const handleTogglePrivateKey = (usePrivate: boolean) => {
    setSettings({
      ...settings,
      usePrivateKey: usePrivate,
      isActive: false,
      lastValidated: null
    });
    setValidationResult(null);
  };

  const currentKey = settings.usePrivateKey ? settings.privateKey : DEFAULT_API_KEY;

  return (
    <div className="space-y-8">
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
          
          <div className={`status-indicator ${
            settings.isActive ? 'status-active' : 'status-inactive'
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
            <div className={`text-lg font-bold ${
              settings.isActive ? 'text-green-700' : 'text-red-600'
            }`}>
              {settings.isActive ? 'Ready to use' : 'Needs validation'}
            </div>
          </div>
        </div>
      </div>

      {/* Default API Key */}
      <div className="glass-card p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Default API Key</h3>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <input
              type="radio"
              id="default-key"
              name="key-type"
              checked={!settings.usePrivateKey}
              onChange={() => handleTogglePrivateKey(false)}
              className="w-5 h-5 text-purple-600"
            />
            <label htmlFor="default-key" className="text-lg font-semibold text-gray-700 cursor-pointer">
              Use default API key (recommended)
            </label>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 icon-prompt-en mt-1" />
              <div className="text-blue-800">
                <p className="font-bold text-lg mb-2">Default API Key Information</p>
                <p className="mb-3">We provide a default API key for your convenience. This key is shared and may have usage limitations.</p>
                <p className="font-mono text-sm bg-blue-100 px-3 py-2 rounded-lg">
                  Key: {DEFAULT_API_KEY}
                </p>
              </div>
            </div>
          </div>

          {!settings.usePrivateKey && (
            <button
              onClick={() => handleValidateKey(DEFAULT_API_KEY)}
              disabled={isValidating}
              className="btn-highlight px-6 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {isValidating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Validate Default Key
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Private API Key */}
      <div className="glass-card p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Key className="w-7 h-7 icon-prompt-id" />
            {t('apiSettings.privateApiKey')}
          </h3>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <input
              type="radio"
              id="private-key"
              name="key-type"
              checked={settings.usePrivateKey}
              onChange={() => handleTogglePrivateKey(true)}
              className="w-5 h-5 text-purple-600"
            />
            <label htmlFor="private-key" className="text-lg font-semibold text-gray-700 cursor-pointer">
              Use my own private API key
            </label>
          </div>

          {settings.usePrivateKey && (
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Your Google Generative Language API Key
                </label>
                <input
                  type="password"
                  value={settings.privateKey}
                  onChange={(e) => setSettings({ ...settings, privateKey: e.target.value })}
                  className="custom-input w-full"
                  placeholder="Enter your API key..."
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
                      Validate Key
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
                      <li>Enable the "Generative Language API"</li>
                      <li>Go to "Credentials" and create an API key</li>
                      <li>Copy and paste the key here</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Validation Result */}
      {validationResult && (
        <div className={`rounded-2xl p-6 ${
          validationResult === 'valid' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' 
            : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'
        }`}>
          <div className="flex items-center gap-4">
            {validationResult === 'valid' ? (
              <>
                <Check className="w-6 h-6 text-green-600" />
                <div className="text-green-800">
                  <p className="font-bold text-lg">API Key Valid!</p>
                  <p>Your API key is working correctly and ready to use.</p>
                </div>
              </>
            ) : (
              <>
                <X className="w-6 h-6 text-red-600" />
                <div className="text-red-800">
                  <p className="font-bold text-lg">API Key Invalid</p>
                  <p>Please check your API key and ensure the Generative Language API is enabled.</p>
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
          Usage Guidelines
        </h4>
        <ul className="text-gray-700 space-y-3 text-lg">
          <li className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">•</span>
            The default API key is provided for convenience and testing
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">•</span>
            For production use, we recommend using your own private API key
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">•</span>
            Private keys provide better rate limits and usage control
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">•</span>
            Your API key is stored locally and never sent to our servers
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">•</span>
            Validate your key after any changes to ensure functionality
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">•</span>
            Monitor your API usage in the Google Cloud Console
          </li>
        </ul>
      </div>
    </div>
  );
};

export default APISettings;