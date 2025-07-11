// src/utils/analytics.ts

// Deklarasikan gtag di window untuk menghindari error TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'event',
      action: string,
      params?: { [key: string]: string | number | boolean | undefined | null }
    ) => void;
  }
}

/**
 * Melacak event kustom di Google Analytics.
 * @param action - Nama aksi yang ingin dilacak (misal: 'click').
 * @param category - Kategori event (misal: 'Generation').
 * @param label - Label spesifik untuk event (misal: 'Generate Anomaly Film Button').
 * @param value - Nilai numerik yang terkait dengan event (opsional).
 */
export const trackEvent = (
  action: string,
  category: string,
  label: string,
  value?: number
) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
    console.log(`GA Event: ${action}, Category: ${category}, Label: ${label}`);
  } else {
    console.warn('Google Analytics gtag function not found.');
  }
};
