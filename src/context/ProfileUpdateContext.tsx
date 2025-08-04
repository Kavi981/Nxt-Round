import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';

interface ProfileUpdateContextType {
  refreshContent: () => void;
  isRefreshing: boolean;
}

const ProfileUpdateContext = createContext<ProfileUpdateContextType | null>(null);

export const ProfileUpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on('user-profile-updated', () => {
        // Trigger a global refresh of content
        setIsRefreshing(true);
        
        // Force a re-render of components that display user names
        setTimeout(() => {
          setIsRefreshing(false);
        }, 100);
      });

      return () => {
        socket.off('user-profile-updated');
      };
    }
  }, [socket]);

  const refreshContent = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 100);
  };

  return (
    <ProfileUpdateContext.Provider value={{ refreshContent, isRefreshing }}>
      {children}
    </ProfileUpdateContext.Provider>
  );
};

export const useProfileUpdate = () => {
  const context = useContext(ProfileUpdateContext);
  if (!context) {
    throw new Error('useProfileUpdate must be used within a ProfileUpdateProvider');
  }
  return context;
}; 