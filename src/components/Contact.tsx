import React from 'react';
import { useTranslation } from 'react-i18next';

const Contact: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{t('contact.title')}</h2>
      <p className="text-gray-700 mb-4">{t('contact.content1')}</p>
      <p className="text-gray-700 mb-4">{t('contact.content2')}</p>
      <p className="text-gray-700">{t('contact.content3')}</p>
      <p className="text-gray-700">
        <strong>{t('contact.facebook')}:</strong>{' '}
        <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
          facebook.com/ahmad.saoghi
        </a>
      </p>
    </div>
  );
};

export default Contact;
