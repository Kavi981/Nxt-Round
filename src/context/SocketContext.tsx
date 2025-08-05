import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5003';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectError: string | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3; // Reduced from 5
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const connectSocket = () => {
      // Clear any existing connection
      if (socket) {
        socket.close();
      }

      console.log('Attempting to connect to:', API_BASE_URL);

      const newSocket = io(API_BASE_URL, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        timeout: 10000, // Reduced timeout
        forceNew: true,
        reconnection: false, // Disable automatic reconnection
        autoConnect: true
      });

      newSocket.on('connect', () => {
        console.log('Socket connected successfully:', newSocket.id);
        setIsConnected(true);
        setConnectError(null);
        reconnectAttempts.current = 0;
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        
        // Don't attempt reconnection for intentional disconnects
        if (reason === 'io server disconnect' || reason === 'io client disconnect') {
          return;
        }
        
        // For network issues, attempt manual reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`Manual reconnection attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
          
          reconnectTimeout.current = setTimeout(() => {
            connectSocket();
          }, 2000); // Fixed 2-second delay
        } else {
          setConnectError('Failed to connect after multiple attempts');
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
        setConnectError(error.message);
        
        // Only attempt reconnection for network errors
        if (error.message.includes('Invalid namespace') || error.message.includes('xhr poll error')) {
          console.log('Namespace or transport error, not attempting reconnection');
          return;
        }
        
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`Connection error, attempting reconnection ${reconnectAttempts.current}/${maxReconnectAttempts}`);
          
          reconnectTimeout.current = setTimeout(() => {
            connectSocket();
          }, 2000);
        }
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        setConnectError(`Socket error: ${error.message}`);
      });

      setSocket(newSocket);
    };

    // Only connect if we have a valid API URL
    if (API_BASE_URL && API_BASE_URL !== 'http://localhost:5003') {
      connectSocket();
    } else {
      console.log('Socket connection disabled - using localhost or invalid URL');
    }

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectError }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    return { socket: null, isConnected: false, connectError: null };
  }
  return context;
};