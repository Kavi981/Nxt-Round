// Debug utility to check environment configuration
export const debugConfig = () => {
  const config = {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5003/api',
    nodeEnv: import.meta.env.MODE,
    socketUrl: import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5003',
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV
  };

  console.log('🔧 Environment Configuration:', config);
  return config;
};

// Check if backend is accessible
export const checkBackendHealth = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
    const response = await fetch(`${apiUrl.replace('/api', '')}/health`);
    
    if (response.ok) {
      console.log('✅ Backend is accessible');
      return true;
    } else {
      console.error('❌ Backend health check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Backend connection error:', error);
    return false;
  }
};

// Initialize debug on app start
if (import.meta.env.DEV) {
  debugConfig();
  checkBackendHealth();
} 