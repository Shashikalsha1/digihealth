const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Access-Control-Allow-Origin': '*',
  },
} as const;

export default API_CONFIG;