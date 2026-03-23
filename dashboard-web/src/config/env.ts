// Environment configuration for LuminaMedia Dashboard
// This file centralizes access to environment variables

const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003',
};

export default env;