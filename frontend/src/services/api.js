/**
 * API Service Layer
 * Handles all HTTP requests to the FastAPI backend
 */

import axios from 'axios';

// Base API URL - Change this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for logging (optional)
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Predict career path based on user profile
 * @param {Object} profile - User profile data
 * @returns {Promise} API response with predicted career and confidence
 */
export const predictCareer = async (profile) => {
  try {
    const response = await api.post('/predict-career', profile);
    return response.data;
  } catch (error) {
    // Handle different error formats
    if (error.response?.data) {
      throw error.response.data;
    } else if (error.response?.data?.detail) {
      throw { detail: error.response.data.detail };
    } else if (error.message) {
      throw { detail: error.message };
    } else {
      throw { detail: 'Failed to connect to the API. Please ensure the backend is running on http://localhost:8000' };
    }
  }
};

/**
 * Analyze skill gaps for a target role
 * @param {Object} data - Current skills and target role
 * @returns {Promise} API response with missing skills and readiness level
 */
export const analyzeSkillGap = async (data) => {
  try {
    const response = await api.post('/skill-gap', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Match resume with job description
 * @param {Object} data - Resume text and job description
 * @returns {Promise} API response with match percentage and missing keywords
 */
export const matchResume = async (data) => {
  try {
    const response = await api.post('/resume-match', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Chat with AI career advisor using Gemini API
 * @param {string} message - User message
 * @param {Array} conversationHistory - Optional conversation history
 * @returns {Promise} API response with AI reply
 */
export const chatWithAI = async (message, conversationHistory = []) => {
  try {
    const response = await api.post('/api/chat', {
      message,
      conversation_history: conversationHistory
    });
    return response.data;
  } catch (error) {
    // Fallback response if endpoint doesn't exist or API is not configured
    if (error.response?.status === 404 || error.response?.status === 503) {
      return {
        reply: error.response?.data?.detail || "I'm a career advisor AI. I can help you with career predictions, skill gap analysis, and resume matching. Try using the other features for now! Note: Gemini API key needs to be configured."
      };
    }
    throw error.response?.data || error.message;
  }
};

/**
 * Search and generate career roadmap using Gemini API
 * @param {Object} searchData - Search parameters
 * @returns {Promise} API response with roadmap data
 */
export const searchRoadmap = async (searchData) => {
  try {
    const response = await api.post('/api/roadmap-search', searchData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Check API health status
 * @returns {Promise} API health response
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api;
