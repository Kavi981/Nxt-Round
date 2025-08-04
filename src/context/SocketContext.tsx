import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003';

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
  const maxReconnectAttempts = 5;
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const connectSocket = () => {
      // Clear any existing connection
      if (socket) {
        socket.close();
      }

      const newSocket = io(API_BASE_URL, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        timeout: 20000, // 20 second timeout
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        autoConnect: true
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
        setConnectError(null);
        reconnectAttempts.current = 0;
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        
        // Only attempt reconnection for certain disconnect reasons
        if (reason === 'io server disconnect' || reason === 'io client disconnect') {
          // Server or client initiated disconnect, don't reconnect
          return;
        }
        
        // For other reasons (network issues, etc.), attempt reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`Attempting reconnection ${reconnectAttempts.current}/${maxReconnectAttempts}`);
          
          reconnectTimeout.current = setTimeout(() => {
            connectSocket();
          }, Math.min(1000 * Math.pow(2, reconnectAttempts.current), 5000));
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
        setConnectError(error.message);
        
        // Attempt reconnection on connection errors
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`Connection error, attempting reconnection ${reconnectAttempts.current}/${maxReconnectAttempts}`);
          
          reconnectTimeout.current = setTimeout(() => {
            connectSocket();
          }, Math.min(1000 * Math.pow(2, reconnectAttempts.current), 5000));
        }
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log(`Socket reconnected after ${attemptNumber} attempts`);
        setIsConnected(true);
        setConnectError(null);
        reconnectAttempts.current = 0;
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error);
        setConnectError(`Reconnection failed: ${error.message}`);
      });

      newSocket.on('reconnect_failed', () => {
        console.error('Socket reconnection failed after all attempts');
        setConnectError('Failed to reconnect after multiple attempts');
      });

      setSocket(newSocket);
    };

    connectSocket();

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