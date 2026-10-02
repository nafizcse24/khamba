import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from local storage and verify token in background
  useEffect(() => {
    const initializeAuth = async () => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        setCurrentUser(parsed);
        setToken(parsed.token);
        
        // Immediately fetch fresh profile to avoid stale balance
        try {
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${parsed.token}` }
          });
          const updatedUser = { ...parsed, ...data };
          setCurrentUser(updatedUser);
          localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        } catch (error) {
          console.error('Initial token verification failed', error);
          if (error.response?.status === 401) {
            // Token is expired or invalid, forcibly log them out
            setCurrentUser(null);
            setToken(null);
            localStorage.removeItem('userInfo');
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
      setCurrentUser(data);
      setToken(data.token);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error 
        ? `Error: ${error.response.data.error}` 
        : error.response?.data?.message || 'Login failed';
      return { success: false, message: errorMsg };
    }
  };

  const register = async (name, email, password, profession) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, { name, email, password, profession });
      setCurrentUser(data);
      setToken(data.token);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error 
        ? `Error: ${error.response.data.error}` 
        : error.response?.data?.message || 'Registration failed';
      return { success: false, message: errorMsg };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('userInfo');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Important: Ensure we preserve the token in the merged state!
      const updatedUser = { ...currentUser, ...data, token };
      setCurrentUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to refresh user data', error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, token, login, register, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
