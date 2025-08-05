import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOffline) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">You're offline</span>
        <button
          onClick={() => setShowOffline(false)}
          className="ml-2 text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default NetworkStatus; 