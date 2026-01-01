/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient } from './api';

const authService = {
  /**
   * Login user
   */
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
      });

      if (response.data.success) {
        const { token, refreshToken, user } = response.data.data;

        // Store tokens and user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        return { success: true, user };
      }

      return { success: false, error: response.data.error };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed. Please try again.',
      };
    }
  },

  /**
   * Register new user
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);

      if (response.data.success) {
        const { token, refreshToken, user } = response.data.data;

        // Store tokens and user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        return { success: true, user };
      }

      return { success: false, error: response.data.error };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed. Please try again.',
      };
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  /**
   * Verify token validity
   */
  verifyToken: async () => {
    try {
      const response = await apiClient.get('/auth/verify');
      return response.data.success;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  /**
   * Admin login
   */
  adminLogin: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/admin-login', {
        admin_username: username,
        admin_password: password,
      });

      if (response.data.success) {
        const { token, refreshToken, user } = response.data.data;

        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify({ ...user, isAdmin: true }));

        return { success: true, user };
      }

      return { success: false, error: response.data.error };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Admin login failed.',
      };
    }
  },
};

export default authService;
