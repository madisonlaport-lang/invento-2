export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  const gaId = import.meta.env.VITE_GA_ID;

  if (!gaId || typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', eventName, params);
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
