// API Configuration for dynamic URL handling
export const getApiBaseUrl = () => {
  // In Vite, use same-origin paths in dev so it works on localhost and LAN/mobile
  // via the dev-server proxy in `vite.config.ts`.
  if (import.meta.env.DEV) return '';

  // Production fallback (can be overridden via env if needed)
  return import.meta.env.VITE_API_ORIGIN || 'http://localhost:8000';
};

export const getAuthApiUrl = () => {
  // Auth endpoints are integrated into main backend on port 8000
  if (import.meta.env.DEV) return '';

  return import.meta.env.VITE_API_ORIGIN || 'http://localhost:8000';
};
