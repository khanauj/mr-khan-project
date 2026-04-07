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
    console.warn('[API] predictCareer failed, using frontend fallback:', error.message);
    
    // Front-end Fallback Logic (matches api.py logic)
    const education = (profile.education || '').toLowerCase();
    const interest = (profile.interest || '').toLowerCase();
    const skills = (profile.skills || []).map(s => s.toLowerCase());

    let predicted_role = "Software Developer";
    if (interest.includes('data') || skills.some(s => s.includes('python') || s.includes('sql'))) {
      predicted_role = "Data Analyst";
    } else if (interest.includes('web') || skills.some(s => s.includes('javascript') || s.includes('html'))) {
      predicted_role = "Frontend Developer";
    } else if (interest.includes('business') || skills.some(s => s.includes('excel') || s.includes('power bi'))) {
      predicted_role = "Business Analyst";
    } else if (interest.includes('ai') || skills.some(s => s.includes('ml') || s.includes('statistics'))) {
      predicted_role = "ML Engineer";
    }

    return {
      predicted_career: predicted_role,
      confidence: 0.85,
      is_fallback: true
    };
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
    console.warn('[API] analyzeSkillGap failed, using frontend fallback');
    
    const role_skill_requirements = {
      'Data Analyst': ['Python', 'SQL', 'Excel', 'Power BI', 'Statistics'],
      'Business Analyst': ['Excel', 'SQL', 'Power BI', 'Communication', 'Statistics'],
      'Frontend Developer': ['JavaScript', 'HTML', 'CSS', 'Communication'],
      'Backend Developer': ['Python', 'JavaScript', 'SQL'],
      'ML Engineer': ['Python', 'ML', 'Statistics', 'SQL'],
      'QA Tester': ['JavaScript', 'Python', 'Communication'],
      'Product Manager': ['Communication', 'Excel', 'Statistics']
    };

    const target = data.target_role || 'Data Analyst';
    const required = role_skill_requirements[target] || ['Communication', 'Problem Solving'];
    const current = (data.current_skills || []).map(s => s.toLowerCase());
    
    const missing_skills = required.filter(s => !current.includes(s.toLowerCase()));
    const coverage = (required.length - missing_skills.length) / required.length;

    let readiness_level = "Beginner";
    if (coverage >= 0.8) readiness_level = "Advanced";
    else if (coverage >= 0.5) readiness_level = "Intermediate";

    return {
      missing_skills,
      readiness_level,
      is_fallback: true
    };
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
    console.warn('[API] matchResume failed, using frontend fallback');
    
    // Simple keyword matching for fallback
    const resume = (data.resume_text || '').toLowerCase();
    const jd = (data.job_description || '').toLowerCase();
    
    const commonKeywords = ['python', 'sql', 'javascript', 'react', 'node', 'aws', 'docker', 'ml', 'ai', 'communication'];
    const foundKeywords = commonKeywords.filter(k => jd.includes(k));
    const missing = foundKeywords.filter(k => !resume.includes(k));
    
    const match_percentage = foundKeywords.length > 0 
      ? Math.round(((foundKeywords.length - missing.length) / foundKeywords.length) * 100)
      : 50;

    return {
      match_percentage: Math.max(match_percentage, 40),
      missing_keywords: missing.slice(0, 5),
      is_fallback: true
    };
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
    return {
      reply: "I'm currently in basic mode because the backend is unavailable. I can still help you! Try using the Profile, Skill Gap, or Resume Match features which are fully functional offline.",
      is_fallback: true
    };
  }
};

/**
 * Search and generate career roadmap using Gemini API
 */
export const searchRoadmap = async (searchData) => {
  try {
    const response = await api.post('/api/roadmap-search', searchData);
    return response.data;
  } catch (error) {
    return {
      roadmap: { title: "Career Growth Roadmap (Offline)", description: "Backend connection required for personalized roadmap generation." },
      steps: [
        { title: "Master Core Skills", duration: "1-2 Months", description: "Focus on the fundamental tools of your chosen field.", tasks: ["Learn Syntax", "Build Projects"], skills: ["Problem Solving"], icon: "BookOpen" },
        { title: "Industry Certification", duration: "3-4 Months", description: "Validate your knowledge with industry standards.", tasks: ["Take Exam", "Study Modules"], skills: ["Persistence"], icon: "Award" }
      ],
      timeline: "6 Months",
      is_fallback: true
    };
  }
};

/**
 * Check API health status
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return { status: "offline", detail: "Backend not reachable. Running in Frontend Fallback mode." };
  }
};

export default api;
