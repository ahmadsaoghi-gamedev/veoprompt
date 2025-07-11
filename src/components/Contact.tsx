import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const Contact: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <Helmet>
        <title>Contact - Shabira Prompt Lab</title>
        <meta name="description" content="Hubungi kami di Shabira Prompt Lab. Dapatkan dukungan, ajukan pertanyaan, atau berikan masukan untuk membantu kami meningkatkan layanan." />
      </Helmet>
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
