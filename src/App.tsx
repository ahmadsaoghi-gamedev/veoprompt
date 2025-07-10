import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import AssetManagement from './components/AssetManagement';
import ImageDetector from './components/ImageDetector';
import SatsetMode from './components/SatsetMode';
import ManualMode from './components/ManualMode';
import MarketingMode from './components/MarketingMode';
import PromptBank from './components/PromptBank';
import APISettings from './components/APISettings';
import ImageAnalysis from './components/ImageAnalysis';
import { initDB } from './utils/database';

function App() {
  const [activeTab, setActiveTab] = useState('assets');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Add timeout for database initialization
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database initialization timeout')), 5000)
        );
        
        await Promise.race([initDB(), timeoutPromise]);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setIsInitialized(true); // Continue anyway
      }
    };

    initialize();
  }, []);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'assets':
        return <AssetManagement />;
      case 'detector':
        return <ImageDetector />;
      case 'image-analysis':
        return <ImageAnalysis />;
      case 'satset':
        return <SatsetMode />;
      case 'manual':
        return <ManualMode />;
      case 'marketing':
        return <MarketingMode />;
      case 'bank':
        return <PromptBank />;
      case 'api':
        return <APISettings />;
      default:
        return <AssetManagement />;
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Initializing AI Video Creator...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderActiveComponent()}
    </Layout>
  );
}

export default App;
