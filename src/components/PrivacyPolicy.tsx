import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <Helmet>
        <title>Privacy Policy - Shabira Prompt Lab</title>
        <meta name="description" content="Kebijakan Privasi Shabira Prompt Lab. Pelajari bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda." />
      </Helmet>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{t('privacyPolicy.title')}</h2>
      <p className="text-gray-700 mb-4">{t('privacyPolicy.content1')}</p>
      <p className="text-gray-700 mb-4">{t('privacyPolicy.content2')}</p>
      <p className="text-gray-700">{t('privacyPolicy.content3')}</p>
    </div>
  );
};

export default PrivacyPolicy;
