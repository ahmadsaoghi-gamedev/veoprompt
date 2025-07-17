import React, { useState, useEffect } from 'react';
import {
  Users,
  Image,
  Wand2,
  Settings,
  Database,
  Video,
  Moon,
  Sun,
  Zap,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { FaYoutube, FaTiktok, FaApple, FaHeart } from 'react-icons/fa';
import { SiBuymeacoffee } from 'react-icons/si';
import { getSettings } from '../utils/database';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [apiStatus, setApiStatus] = useState<'active' | 'inactive' | 'error'>('inactive');
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const settings = await getSettings();
        if (settings?.isActive) {
          setApiStatus('active');
        } else {
          setApiStatus('inactive');
        }
      } catch {
        setApiStatus('error');
      }
    };

    checkApiStatus();
  }, []);

  const tabs = [
    { id: 'assets', label: t('assetManagement.title'), icon: Users },
    { id: 'detector', label: t('imageDetector.title'), icon: Image },
    { id: 'image-analysis', label: t('imageAnalysis.title'), icon: Lightbulb },
    { id: 'satset', label: t('satsetMode.title'), icon: Wand2 },
    { id: 'manual', label: t('manualMode.title'), icon: Settings },
    { id: 'marketing', label: t('marketingMode.title'), icon: Video },
    { id: 'bank', label: t('promptBank.title'), icon: Database },
    { id: 'api', label: t('apiSettings.title'), icon: Zap },
    { id: 'anomaly', label: 'Anomaly Mode', icon: Lightbulb },
    { id: 'concept-viz', label: 'Visualisasi Konsep', icon: Image },
    { id: 'dialogue-fixer', label: 'Dialogue Fixer', icon: MessageSquare }
  ];

  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  const changeLanguage = async (lng: string) => {
    if (isChangingLanguage || i18n.language === lng) return;

    setIsChangingLanguage(true);
    try {
      await i18n.changeLanguage(lng);
      localStorage.setItem('i18nextLng', lng);

      document.body.style.opacity = '0.8';
      document.body.style.transition = 'opacity 300ms ease-out';

      setTimeout(() => {
        window.location.reload();
      }, 300);
    } catch (error) {
      console.error('Failed to change language:', error);
      setIsChangingLanguage(false);
      document.body.style.opacity = '1';
      alert(t('errors.languageChangeFailed'));
    }
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="beautiful-header">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${apiStatus === 'active' ? 'bg-green-500' :
                apiStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                } shadow-lg`}>
                <Video className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {t('layout.title')}
                  </h1>
                  <p className="text-white/80 text-lg">
                    {t('layout.subtitle')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <a
                    href="https://www.youtube.com/@ahmadsaoghi/shorts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
                    aria-label="YouTube"
                  >
                    <FaYoutube className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href="https://www.tiktok.com/@scenecrafter"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
                    aria-label="TikTok"
                  >
                    <FaTiktok className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href="https://apps.apple.com/to/developer/hermizariafis/id1662246465"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
                    aria-label="App Store"
                  >
                    <FaApple className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href="https://lynk.id/oghiezr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
                    aria-label="MyLynkid"
                  >
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-600">ML</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`status-indicator ${apiStatus === 'active' ? 'status-active' :
                apiStatus === 'error' ? 'status-error' : 'status-inactive'
                }`}>
                <div className={`w-2 h-2 rounded-full ${apiStatus === 'active' ? 'bg-white' :
                  apiStatus === 'error' ? 'bg-white' : 'bg-white'
                  }`} />
                {apiStatus === 'active' ? t('apiSettings.apiActive') :
                  apiStatus === 'error' ? t('apiSettings.apiError') : t('apiSettings.apiInactive')}
              </div>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
              </button>

              <select
                id="language-select"
                onChange={(e) => changeLanguage(e.target.value)}
                value={i18n.language}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-white"
              >
                <option value="en">{t('common.english')}</option>
                <option value="id">{t('common.indonesian')}</option>
              </select>
              {isChangingLanguage && (
                <span className="ml-2 text-white">
                  {t('common.loading')}...
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white/60 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-3 transition-all ${activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-white/10 backdrop-blur-sm border-t border-white/20 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-800">
              <span>Dibuat dengan</span>
              <FaHeart className="text-pink-500 animate-pulse" />
              <span>cinta</span>
            </div>
            <a
              href="https://saweria.co/ahmadsaoghi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
            >
              <SiBuymeacoffee className="w-5 h-5" />
              <span>Buy me coffee</span>
            </a>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-4 text-gray-800">
            <button onClick={() => onTabChange('disclaimer')} className="hover:underline">
              {t('disclaimer.title')}
            </button>
            <button onClick={() => onTabChange('privacy-policy')} className="hover:underline">
              {t('privacyPolicy.title')}
            </button>
            <button onClick={() => onTabChange('contact')} className="hover:underline">
              {t('contact.title')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Layout;
