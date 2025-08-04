import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/api';
import { useSocket } from './SocketContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('token'),
    isLoading: true,
    isAuthenticated: false
  });

  const { socket } = useSocket();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          console.log('Auth check response:', response.data);
          
          // Transform the backend response to match frontend interface
          const transformedUser = {
            id: response.data.user._id || response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            role: response.data.user.role,
            avatar: response.data.user.avatar
          };
          
          console.log('Transformed user data from auth check:', transformedUser);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: transformedUser, token }
          });
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        }
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    checkAuth();
  }, []);

  // Listen for profile updates from socket
  useEffect(() => {
    if (socket && state.user) {
      socket.on('user-profile-updated', (data: { userId: string; name: string; avatar: string }) => {
        console.log('Profile update received:', data);
        console.log('Current user:', state.user);
        console.log('User ID comparison:', { 
          receivedUserId: data.userId, 
          currentUserId: state.user?.id,
          match: state.user?.id === data.userId 
        });
        
        // Update the current user's data if it matches
        if (state.user && state.user.id === data.userId) {
          console.log('Updating user profile in AuthContext');
          dispatch({
            type: 'UPDATE_USER',
            payload: {
              ...state.user,
              name: data.name,
              avatar: data.avatar
            }
          });
        } else {
          console.log('User ID mismatch - not updating');
        }
      });

      return () => {
        socket.off('user-profile-updated');
      };
    }
  }, [socket, state.user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      // Transform the backend response to match frontend interface
      const transformedUser = {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      };
      
      localStorage.setItem('token', token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: transformedUser, token } });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { user, token } = response.data;
      
      // Transform the backend response to match frontend interface
      const transformedUser = {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      };
      
      localStorage.setItem('token', token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: transformedUser, token } });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      console.log('updateProfile called with data:', data);
      const response = await api.put('/users/profile', data);
      console.log('Profile update response:', response.data);
      
      // Transform the backend response to match frontend interface
      const transformedUser = {
        id: response.data._id || response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        avatar: response.data.avatar
      };
      
      console.log('Transformed user data:', transformedUser);
      dispatch({ type: 'UPDATE_USER', payload: transformedUser });
      console.log('User updated in AuthContext');
    } catch (error: any) {
      console.error('Profile update error in AuthContext:', error);
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};