// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../service/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('subadmin_token'));

  useEffect(() => {
    // Initialize the auth service with token
    const initAuth = async () => {
      if (token) {
        console.log("Initializing with token:", token);
        authService.setToken(token);
        await fetchUserProfile();
      } else {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      console.log("Fetching user profile...");
      const userData = await authService.getProfile();
      console.log("User profile fetched:", userData);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Don't logout immediately, might be a temporary server issue
      if (error.message.includes('401') || error.message.includes('Token')) {
        logout(); // Only logout on authentication errors
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password, language = 'en') => {
    try {
      setIsLoading(true);
      const response = await authService.login({email, password, language});
      
      console.log("Login response:", response.data?.token);
      
      // Handle different response structures
      const newToken =  response.data?.token;
      const userData = response.data.user || response;
      
      if (newToken) {
        setToken(newToken);
        localStorage.setItem('subadmin_token', newToken);
        authService.setToken(newToken);
      }
      
      setUser(userData);
      
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('subadmin_token');
    authService.setToken(null);
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};