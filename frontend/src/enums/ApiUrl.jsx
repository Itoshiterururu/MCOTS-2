const ApiUrl = {
  MAP_SERVICE: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost'}:${import.meta.env.VITE_MAP_SERVICE_PORT || 8080}/api/v1/map`,
  INTELLIGENCE_SERVICE: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost'}:${import.meta.env.VITE_INTELLIGENCE_SERVICE_PORT || 8084}/api/v1`,
  AUTH_SERVICE: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost'}:${import.meta.env.VITE_AUTH_SERVICE_PORT || 8081}/api/v1/auth`
};

export default ApiUrl;