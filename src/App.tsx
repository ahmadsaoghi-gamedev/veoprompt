// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
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
import Disclaimer from './components/Disclaimer';
import PrivacyPolicy from './components/PrivacyPolicy';
import Contact from './components/Contact';
import AnomalyMode from './components/AnomalyMode';
import ConceptVizMode from './components/ConceptVizMode';
import DialogueFixerMode from './components/DialogueFixerMode';
import AdvancedFilmGenerator from './components/AdvancedFilmGenerator';
import AdvancedPromoGenerator from './components/AdvancedPromoGenerator';
import GuidePage from './components/GuidePage';
import { Helmet } from 'react-helmet-async';
import { initDB } from './utils/database';

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "AI Video Creator - Shabira Prompt Lab",
  "operatingSystem": "WEB",
  "applicationCategory": "MultimediaApplication",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "88"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "Platform AI untuk menghasilkan prompt video sinematik dari ide, gambar, dan teks. Mendukung gaya surealis 'Anomaly Brainroot' dan alur kerja visual-ke-video.'"
};

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
      case 'disclaimer':
        return <Disclaimer />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'contact':
        return <Contact />;
      case 'anomaly':
        return <AnomalyMode />;
      case 'concept-viz':
        return <ConceptVizMode />;
      case 'dialogue-fixer':
        return <DialogueFixerMode />;
      case 'advanced-film':
        return <AdvancedFilmGenerator />;
      case 'advanced-promo':
        return <AdvancedPromoGenerator />;
      case 'guide':
        return <GuidePage onBack={() => setActiveTab('assets')} />;
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
    <>
      <Helmet>
        <title>AI Video Generator & Short Film AI Creator - Shabira Prompt Lab | Veo Alternative</title>
        <meta name="description" content="AI Video Generator terbaik untuk Short Film AI dan animasi 3D AI. Prompt Generator canggih dengan teknologi Gemini untuk alternatif Veo3. Buat video sinematik berkualitas tinggi." />
        <meta name="keywords" content="AI video generator, short film AI, 3D AI animation, prompt generator, Veo, Gemini, alternatif Veo3, cinematic video prompt, AI untuk video vertikal 9:16" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Helmet>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderActiveComponent()}
      </Layout>
      m    </>
  );
}

export default App;
