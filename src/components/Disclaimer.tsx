import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const Disclaimer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <Helmet>
        <title>Disclaimer - Shabira Prompt Lab</title>
        <meta name="description" content="Baca disclaimer kami untuk informasi penting tentang penggunaan Shabira Prompt Lab dan batasan tanggung jawab kami." />
      </Helmet>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{t('disclaimer.title')}</h2>
      <p className="text-gray-700 mb-4">{t('disclaimer.content1')}</p>
      <p className="text-gray-700 mb-4">{t('disclaimer.content2')}</p>
      <p className="text-gray-700">{t('disclaimer.content3')}</p>
    </div>
  );
};

export default Disclaimer;
