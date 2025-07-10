import React from 'react';
import { useTranslation } from 'react-i18next';

const Disclaimer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{t('disclaimer.title')}</h2>
      <p className="text-gray-700 mb-4">{t('disclaimer.content1')}</p>
      <p className="text-gray-700 mb-4">{t('disclaimer.content2')}</p>
      <p className="text-gray-700">{t('disclaimer.content3')}</p>
    </div>
  );
};

export default Disclaimer;
