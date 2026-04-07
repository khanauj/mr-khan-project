"""
FastAPI ML Service
REST API endpoints for career prediction, skill gap analysis, and resume matching.
"""

from fastapi import FastAPI, HTTPException  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from pydantic import BaseModel  # type: ignore
from typing import List, Optional
import numpy as np  # type: ignore
import pandas as pd  # type: ignore
import joblib  # type: ignore
import os
from dotenv import load_dotenv  # type: ignore

load_dotenv()
from sklearn.feature_extraction.text import TfidfVectorizer  # type: ignore
from sklearn.metrics.pairwise import cosine_similarity  # type: ignore
import warnings
warnings.filterwarnings('ignore')

# OpenRouter API
import httpx  # type: ignore
import json

# Import preprocessing utilities
from preprocessing import FeaturePreprocessor  # type: ignore

app = FastAPI(
    title="AI-Powered Career & Skills Advisor API",
    description="Machine Learning API for career prediction, skill gap analysis, and resume matching",
    version="1.0.0"
)

# Add CORS middleware - MUST be added before routes
# Allow specific origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # Allow all origins for development
        "https://*.vercel.app",  # Allow all Vercel deployments
        "https://*.netlify.app",  # Allow all Netlify deployments
        "http://localhost:3000",  # Local development
        "http://localhost:5173",  # Vite default port
    ],
    allow_credentials=False,  # Must be False when using "*"
    allow_methods=["*"],  # Allow all methods including OPTIONS
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Constants
# Determine the correct models directory path
_script_dir = os.path.dirname(os.path.abspath(__file__))
_models_path_1 = os.path.join(_script_dir, 'ml', 'models')
_models_path_2 = os.path.join(_script_dir, 'models')
if os.path.exists(_models_path_1):
    MODELS_DIR = _models_path_1
elif os.path.exists(_models_path_2):
    MODELS_DIR = _models_path_2
else:
    MODELS_DIR = _models_path_1  # Default to ml/models

SKILLS_LIST = ['Python', 'SQL', 'Excel', 'Power BI', 'JavaScript', 'HTML', 'CSS', 
               'Communication', 'Statistics', 'ML']

# Global variables for loaded models
career_model = None
skill_gap_model = None
tfidf_vectorizer = None
preprocessor = None


# Pydantic models for request/response
class CareerPredictionRequest(BaseModel):
    education: str
    skills: List[str]
    interest: str
    experience_years: int


class CareerPredictionResponse(BaseModel):
    predicted_career: str
    confidence: float


class SkillGapRequest(BaseModel):
    current_skills: List[str]
    target_role: str


class SkillGapResponse(BaseModel):
    missing_skills: List[str]
    readiness_level: str


class ResumeMatchRequest(BaseModel):
    resume_text: str
    job_description: str


class ResumeMatchResponse(BaseModel):
    match_percentage: float
    missing_keywords: List[str]


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[dict]] = []


class ChatResponse(BaseModel):
    reply: str


class RoadmapSearchRequest(BaseModel):
    query: str
    current_role: Optional[str] = None
    target_role: Optional[str] = None
    current_skills: Optional[List[str]] = []


class RoadmapSearchResponse(BaseModel):
    roadmap: dict
    steps: List[dict]
    timeline: str


class CompareCareersRequest(BaseModel):
    careers: List[str]


class CompareCareersResponse(BaseModel):
    comparison_data: List[dict]


class LinkedInAnalyzeRequest(BaseModel):
    profile_text: str
    target_role: str


class LinkedInAnalyzeResponse(BaseModel):
    fit_score: float
    gap_analysis: List[str]
    strengths: List[str]


# Interview models
class InterviewStartRequest(BaseModel):
    role: str
    level: str  # Fresher / Intermediate / Advanced
    tech_stack: str


class InterviewAnswerRequest(BaseModel):
    answer: str
    session_id: str


class InterviewSession(BaseModel):
    session_id: str
    role: str
    level: str
    tech_stack: str
    question_count: int = 0
    conversation: list = []
    scores: list = []


# Interview sessions storage (in-memory)
from typing import Dict, Any, List
interview_sessions: Dict[str, Any] = {}

# Gemini API Configuration for Interview
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent"

# NVIDIA NIM API Configuration for STT/TTS
NVIDIA_STT_API_KEY = os.getenv('NVIDIA_STT_API_KEY', '')
NVIDIA_TTS_API_KEY = os.getenv('NVIDIA_TTS_API_KEY', '')
NVIDIA_STT_URL = "https://integrate.api.nvidia.com/v1/audio/transcriptions"
NVIDIA_TTS_URL = "https://integrate.api.nvidia.com/v1/audio/speech"

if GEMINI_API_KEY:
    print(f"[OK] Gemini API configured for Interview feature")
else:
    print("[WARNING] GEMINI_API_KEY not set. Interview feature will be unavailable.")

if NVIDIA_STT_API_KEY:
    print(f"[OK] NVIDIA STT API configured")
if NVIDIA_TTS_API_KEY:
    print(f"[OK] NVIDIA TTS API configured")

# OpenRouter API Configuration
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "openai/gpt-4o-mini"  # Using GPT-4o-mini via OpenRouter

if OPENROUTER_API_KEY and isinstance(OPENROUTER_API_KEY, str):
    print(f"[OK] OpenRouter API configured")
    # Use slicing only after type asserting it's a string, or avoid slicing to bypass Pyright stub bug
    key_start = OPENROUTER_API_KEY[0:20]  # type: ignore
    key_end = OPENROUTER_API_KEY[len(OPENROUTER_API_KEY)-10:len(OPENROUTER_API_KEY)]  # type: ignore
    print(f"[OK] API Key configured: {key_start}...{key_end}")
    print(f"[OK] Using model: {OPENROUTER_MODEL}")
else:
    print("[WARNING] OpenRouter API key not available.")
    print("[INFO] Please set OPENROUTER_API_KEY environment variable in Railway dashboard")


def load_models():
    """Load all trained models and preprocessors."""
    global career_model, skill_gap_model, tfidf_vectorizer, preprocessor
    
    try:
        # Load career prediction model
        career_model_path = os.path.join(MODELS_DIR, 'career_model.pkl')
        if os.path.exists(career_model_path):
            career_model = joblib.load(career_model_path)
            print(f"[OK] Loaded career model from {career_model_path}")
        
        # Load skill gap model
        skill_gap_model_path = os.path.join(MODELS_DIR, 'skill_gap_model.pkl')
        if os.path.exists(skill_gap_model_path):
            skill_gap_model = joblib.load(skill_gap_model_path)
            print(f"[OK] Loaded skill gap model from {skill_gap_model_path}")
        
        # Load TF-IDF vectorizer
        tfidf_path = os.path.join(MODELS_DIR, 'tfidf_vectorizer.pkl')
        if os.path.exists(tfidf_path):
            tfidf_vectorizer = joblib.load(tfidf_path)
            print(f"[OK] Loaded TF-IDF vectorizer from {tfidf_path}")
        
        # Load preprocessor
        preprocessor = FeaturePreprocessor.load_encoders(MODELS_DIR)
        print(f"[OK] Loaded preprocessor from {MODELS_DIR}")
        
    except Exception as e:
        print(f"Warning: Error loading models: {e}")
        print("Make sure models are trained first by running train_models.py")


def build_tfidf_vectors(source_text: str, target_text: str):
    """Use the trained vectorizer when available, otherwise fit one for this request."""
    if tfidf_vectorizer is not None:
        vectorizer = tfidf_vectorizer
        source_vec = vectorizer.transform([source_text])
        target_vec = vectorizer.transform([target_text])
    else:
        vectorizer = TfidfVectorizer(
            max_features=500,
            ngram_range=(1, 2),
            stop_words='english'
        )
        source_vec, target_vec = vectorizer.fit_transform([source_text, target_text])

    return vectorizer, source_vec, target_vec


def get_missing_keywords(source_vec, target_vec, vectorizer, limit: int):
    """Return the top target keywords that are absent from the source text."""
    target_tfidf = target_vec.toarray()[0]
    source_tfidf = source_vec.toarray()[0]
    feature_names = vectorizer.get_feature_names_out()
    feature_index = {term: idx for idx, term in enumerate(feature_names)}

    top_indices = np.argsort(target_tfidf)[::-1]
    missing_keywords = []
    for idx in top_indices:
        if target_tfidf[idx] <= 0:
            continue

        term = feature_names[idx]
        term_idx = feature_index[term]
        if source_tfidf[term_idx] == 0:
            missing_keywords.append(term)

        if len(missing_keywords) >= limit:
            break

    return missing_keywords


@app.on_event("startup")
async def startup_event():
    """Load models on startup."""
    load_models()


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "AI-Powered Career & Skills Advisor API",
        "version": "1.0.0",
        "endpoints": {
            "/predict-career": "POST - Predict career path based on profile",
            "/skill-gap": "POST - Analyze skill gaps for target role",
            "/resume-match": "POST - Match resume with job description",
            "/health": "GET - Check API health status"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    models_loaded = all([
        career_model is not None,
        skill_gap_model is not None,
        tfidf_vectorizer is not None,
        preprocessor is not None
    ])
    
    return {
        "status": "healthy" if models_loaded else "models_not_loaded",
        "models_loaded": models_loaded,
        "career_model": career_model is not None,
        "skill_gap_model": skill_gap_model is not None,
        "tfidf_vectorizer": tfidf_vectorizer is not None,
        "preprocessor": preprocessor is not None
    }


@app.post("/predict-career", response_model=CareerPredictionResponse)
async def predict_career(request: CareerPredictionRequest):
    """
    Predict career path based on profile features.
    
    Input:
    - education: One of [BCA, BBA, BA, BSc, BCom, MBA]
    - skills: List of skills
    - interest: One of [Data, Web, Business, AI, Teaching, Sales]
    - experience_years: Integer from 0 to 5
    
    Output:
    - predicted_career: Predicted career role
    - confidence: Prediction confidence score (0-1)
    """
    try:
        # Validate inputs
        valid_educations = ['BCA', 'BBA', 'BA', 'BSc', 'BCom', 'MBA']
        valid_interests = ['Data', 'Web', 'Business', 'AI', 'Teaching', 'Sales']
        
        if request.education not in valid_educations:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid education. Must be one of {valid_educations}"
            )
        
        if request.interest not in valid_interests:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid interest. Must be one of {valid_interests}"
            )
        
        if not (0 <= request.experience_years <= 5):
            raise HTTPException(
                status_code=400,
                detail="experience_years must be between 0 and 5"
            )

        # If trained models and preprocessor are available, use them
        if career_model is not None and preprocessor is not None:
            # Create feature vector
            skills_str = ', '.join(request.skills)
            profile_df = pd.DataFrame([{
                'education': request.education,
                'skills': skills_str,
                'interest': request.interest,
                'experience_years': request.experience_years
            }])
            
            # Preprocess features
            X = preprocessor.create_feature_matrix(profile_df, fit=False)
            
            # Predict
            y_pred = career_model.predict(X)[0]
            y_pred_proba = career_model.predict_proba(X)[0]
            
            # Get predicted role and confidence
            predicted_role = preprocessor.target_encoder.inverse_transform([y_pred])[0]
            confidence = float(np.max(y_pred_proba))
        else:
            # Fallback: simple rule-based prediction so the feature
            # still works even when models are not trained/deployed.
            education = request.education.lower()
            interest = request.interest.lower()
            skills = [skill.lower() for skill in request.skills]

            if 'data' in interest or any('python' in s or 'sql' in s for s in skills):
                predicted_role = "Data Analyst"
            elif 'web' in interest or any('javascript' in s or 'html' in s or 'css' in s for s in skills):
                predicted_role = "Frontend Developer"
            elif 'business' in interest or any('excel' in s or 'power bi' in s for s in skills):
                predicted_role = "Business Analyst"
            elif 'ai' in interest or 'ml' in skills or 'statistics' in skills:
                predicted_role = "ML Engineer"
            else:
                predicted_role = "Software Developer"

            confidence = 0.85
        
        return CareerPredictionResponse(
            predicted_career=predicted_role,  # type: ignore
            confidence=confidence  # type: ignore
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/skill-gap", response_model=SkillGapResponse)
async def analyze_skill_gap(request: SkillGapRequest):
    """
    Analyze skill gaps and readiness level for target role.
    
    Input:
    - current_skills: List of current skills
    - target_role: Target career role
    
    Output:
    - missing_skills: List of skills needed for target role
    - readiness_level: Overall readiness level (Beginner/Intermediate/Advanced)
    """
    # Note:
    # This endpoint uses rule-based logic and does NOT require the
    # OpenRouter API key. It should work even if OPENROUTER_API_KEY
    # is not configured, so that the Skill Gap feature remains available.
    try:
        # Define required skills for each role
        role_skill_requirements = {
            'Data Analyst': ['Python', 'SQL', 'Excel', 'Power BI', 'Statistics'],
            'Business Analyst': ['Excel', 'SQL', 'Power BI', 'Communication', 'Statistics'],
            'Frontend Developer': ['JavaScript', 'HTML', 'CSS', 'Communication'],
            'Backend Developer': ['Python', 'JavaScript', 'SQL'],
            'ML Engineer': ['Python', 'ML', 'Statistics', 'SQL'],
            'QA Tester': ['JavaScript', 'Python', 'Communication'],
            'Product Manager': ['Communication', 'Excel', 'Statistics']
        }
        
        if request.target_role not in role_skill_requirements:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid target_role. Must be one of {list(role_skill_requirements.keys())}"
            )
        
        # Find missing skills
        required_skills = set(role_skill_requirements[request.target_role])
        current_skills_set = set(skill for skill in request.current_skills)
        missing_skills = list(required_skills - current_skills_set)
        
        # Calculate readiness level
        skill_coverage = len(current_skills_set & required_skills) / len(required_skills) if required_skills else 0
        
        if skill_coverage >= 0.8:
            readiness_level = "Advanced"
        elif skill_coverage >= 0.5:
            readiness_level = "Intermediate"
        else:
            readiness_level = "Beginner"
        
        return SkillGapResponse(
            missing_skills=missing_skills,  # type: ignore
            readiness_level=readiness_level  # type: ignore
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill gap analysis error: {str(e)}")


@app.post("/resume-match", response_model=ResumeMatchResponse)
async def match_resume(request: ResumeMatchRequest):
    """
    Match resume with job description using TF-IDF and cosine similarity.
    
    Input:
    - resume_text: Resume text content
    - job_description: Job description text
    
    Output:
    - match_percentage: Similarity score (0-100)
    - missing_keywords: Important keywords from job description missing in resume
    """
    try:
        # Vectorize resume and job description
        vectorizer, resume_vec, job_vec = build_tfidf_vectors(
            request.resume_text,
            request.job_description
        )
        
        # Calculate cosine similarity
        similarity = cosine_similarity(resume_vec, job_vec)[0][0]
        match_percentage = float(similarity * 100)
        
        # Extract missing keywords
        missing_keywords = get_missing_keywords(resume_vec, job_vec, vectorizer, limit=10)
        
        return ResumeMatchResponse(
            match_percentage=round(match_percentage, 2),  # type: ignore
            missing_keywords=missing_keywords  # type: ignore
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume matching error: {str(e)}")


@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """
    Chat with AI career advisor using OpenRouter API.
    
    Input:
    - message: User's message
    - conversation_history: Optional conversation history
    
    Output:
    - reply: AI's response
    """
    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="OpenRouter API is not configured. Please set OPENROUTER_API_KEY environment variable."
        )
    
    try:
        # Build conversation messages for OpenRouter
        messages = [
            {
                "role": "system",
                "content": """You are an AI Career Advisor. Your role is to help users with:
- Career predictions and recommendations
- Skill gap analysis and learning paths
- Resume and job matching advice
- Career transition guidance
- Answering questions about career development, skills, and job market trends

Be helpful, professional, and concise. If the user asks about specific features, guide them to use the Profile, Skill Gap, or Resume Match features of this application."""
            }
        ]
        
        # Add conversation history (last 10 messages for context)
        hist = request.conversation_history
        if isinstance(hist, list) and len(hist) > 0:
            hist_len = len(hist)
            start_idx = max(0, hist_len - 10)
            for i in range(start_idx, hist_len):
                msg = hist[i]
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                if role in ['user', 'assistant']:
                    messages.append({
                        "role": role,
                        "content": content
                    })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        # Call OpenRouter API
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                OPENROUTER_API_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://skillence.app",  # Optional: for analytics
                    "X-Title": "Skillence Career Advisor"  # Optional: for analytics
                },
                json={
                    "model": OPENROUTER_MODEL,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 1000
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                reply = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                if not reply:
                    raise HTTPException(
                        status_code=500,
                        detail="Empty response from AI model"
                    )
                return ChatResponse(reply=reply)  # type: ignore
            elif response.status_code == 429:
                raise HTTPException(
                    status_code=429,
                    detail="API rate limit exceeded. Please wait a moment and try again."
                )
            elif response.status_code == 401:
                raise HTTPException(
                    status_code=503,
                    detail="OpenRouter API key is invalid. Please check your API key."
                )
            else:
                error_data = response.json() if response.content else {}
                error_msg = error_data.get("error", {}).get("message", f"HTTP {response.status_code}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Error calling OpenRouter API: {error_msg}"
                )
        
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Request timeout. The AI service is taking too long to respond."
        )
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating AI response: {str(e)}"
        )


@app.post("/api/roadmap-search", response_model=RoadmapSearchResponse)
async def generate_roadmap(request: RoadmapSearchRequest):
    """
    Generate a personalized career roadmap using OpenRouter API.
    
    Input:
    - query: User's search query or career transition request
    - current_role: User's current role (optional)
    - target_role: Target role (optional)
    - current_skills: List of current skills (optional)
    
    Output:
    - roadmap: Structured roadmap data
    - steps: List of roadmap steps
    - timeline: Overall timeline estimate
    """
    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="OpenRouter API is not configured. Please set OPENROUTER_API_KEY environment variable."
        )
    
    try:
        # Build prompt for roadmap generation
        user_query = f"""Generate a detailed, actionable career roadmap for the following scenario:

User Query: {request.query}
"""
        
        if request.current_role:
            user_query += f"Current Role: {request.current_role}\n"
        if request.target_role:
            user_query += f"Target Role: {request.target_role}\n"
        if request.current_skills is not None:
            skills_list = request.current_skills
            if isinstance(skills_list, list) and len(skills_list) > 0:
                user_query += f"Current Skills: {', '.join(skills_list)}\n"
        
        user_query += """
Please provide a structured roadmap with:
1. Title/Name for the roadmap
2. 5-7 clear steps with:
   - Step name/title
   - Duration (e.g., "Week 1", "Weeks 2-8", "Month 3-6")
   - Description of what to do
   - 3-5 specific actionable tasks
   - Required skills or knowledge for that step
3. Overall timeline estimate
4. Key milestones

Format the response as a JSON object with this structure:
{
  "title": "Roadmap title",
  "description": "Brief description",
  "timeline": "Overall timeline estimate",
  "steps": [
    {
      "title": "Step name",
      "duration": "Duration",
      "description": "What to do",
      "tasks": ["task 1", "task 2", "task 3"],
      "skills": ["skill 1", "skill 2"],
      "icon": "suggested_icon_name"
    }
  ]
}

Return ONLY the JSON, no additional text or markdown formatting."""

        messages = [
            {
                "role": "system",
                "content": "You are a career advisor expert. Generate detailed, actionable career roadmaps in JSON format. Always return valid JSON only."
            },
            {
                "role": "user",
                "content": user_query
            }
        ]
        
        # Call OpenRouter API
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(
                OPENROUTER_API_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://skillence.app",
                    "X-Title": "Skillence Career Advisor"
                },
                json={
                    "model": OPENROUTER_MODEL,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 2000,
                    "response_format": {"type": "json_object"}  # Request JSON response
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                reply = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                
                if not reply:
                    raise HTTPException(
                        status_code=500,
                        detail="Empty response from AI model"
                    )
                
                # Extract JSON from response (in case there's extra text)
                import re
                json_match = re.search(r'\{.*\}', reply, re.DOTALL)
                if json_match:
                    roadmap_data = json.loads(json_match.group())
                else:
                    # Fallback: try to parse the entire response
                    roadmap_data = json.loads(reply)
                
                # Structure the response
                steps = roadmap_data.get('steps', [])
                
                return RoadmapSearchResponse(
                    roadmap={  # type: ignore
                        "title": roadmap_data.get('title', 'Career Roadmap'),
                        "description": roadmap_data.get('description', ''),
                        "timeline": roadmap_data.get('timeline', '')
                    },
                    steps=steps,  # type: ignore
                    timeline=roadmap_data.get('timeline', '3-6 months')  # type: ignore
                )
            elif response.status_code == 429:
                raise HTTPException(
                    status_code=429,
                    detail="API rate limit exceeded. Please wait a moment and try again."
                )
            elif response.status_code == 401:
                raise HTTPException(
                    status_code=503,
                    detail="OpenRouter API key is invalid. Please check your API key."
                )
            else:
                error_data = response.json() if response.content else {}
                error_msg = error_data.get("error", {}).get("message", f"HTTP {response.status_code}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Error calling OpenRouter API: {error_msg}"
                )
        
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Request timeout. The AI service is taking too long to respond."
        )
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse roadmap response. Please try again. Error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating roadmap: {str(e)}"
        )


# ========================
# INTERVIEW ENDPOINTS
# ========================

import uuid
from fastapi import UploadFile, File, Form  # type: ignore
from fastapi.responses import StreamingResponse  # type: ignore
import io
import base64


def build_interview_system_prompt(role: str, level: str, tech_stack: str) -> str:
    return f"""You are Skillence AI Interviewer, a highly professional and realistic job interviewer.

INTERVIEW CONTEXT:
Role: {role}
Level: {level} (Fresher / Intermediate / Advanced)
Tech Stack: {tech_stack}

BEHAVIOR RULES:
- Ask ONLY one question at a time
- Keep responses concise and voice-friendly (max 2-3 sentences for questions)
- Mix HR + Technical questions
- Adjust difficulty based on candidate performance
- Do NOT provide answers to questions
- Maintain a professional, slightly strict tone
- Simulate real interview pressure (but not rude)

EVALUATION CRITERIA - Score each from 0-10:
- Technical Accuracy
- Communication Clarity
- Confidence & Structure
- Relevance to Question

Be slightly strict like a real interviewer.

ADAPTIVE INTELLIGENCE:
- If answer is weak, ask easier or foundational question
- If answer is strong, ask deeper or scenario-based question
- If answer is vague, ask follow-up for clarification
- Track performance across responses

VOICE OPTIMIZATION:
- Keep questions natural and conversational
- Avoid long paragraphs
- Make output suitable for text-to-speech

IMPORTANT RESTRICTIONS:
- ALWAYS return valid JSON (no extra text)
- NEVER break JSON format
- NEVER include explanations outside JSON
- NEVER ask multiple questions at once

RESPONSE FORMAT:
For ongoing interview (when asking questions):
{{
  "type": "question",
  "question": "Next interview question (short and clear)",
  "evaluation": {{
    "technical_score": number,
    "communication_score": number,
    "confidence_score": number,
    "overall_score": number,
    "feedback": "Short constructive feedback (2-3 lines)",
    "improvements": ["point 1", "point 2", "point 3"]
  }}
}}

For the FIRST question only, set all evaluation scores to 0 and feedback to empty since there's no answer to evaluate yet.

For final response (after 5-7 questions have been asked):
{{
  "type": "final_report",
  "final_score": number,
  "strengths": ["point", "point"],
  "weaknesses": ["point", "point"],
  "hire_recommendation": "Yes or No",
  "summary": "Detailed overall performance summary (4-5 lines)"
}}
"""


async def call_interview_llm(messages: List[Dict[str, str]]) -> str:
    """Call LLM for interview. Uses OpenRouter (primary) or Gemini (fallback)."""
    # Convert messages: first message content becomes system prompt
    openrouter_messages = []
    for i, msg in enumerate(messages):
        if i == 0 and msg["role"] == "user":
            # First user message contains the system prompt + instruction
            openrouter_messages.append({"role": "system", "content": msg["content"]})
        else:
            role = msg["role"] if msg["role"] in ("user", "assistant") else "user"
            openrouter_messages.append({"role": role, "content": msg["content"]})

    # Try OpenRouter first
    if OPENROUTER_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    OPENROUTER_API_URL,
                    headers={
                        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://skillence.app",
                        "X-Title": "Skillence AI Interviewer"
                    },
                    json={
                        "model": OPENROUTER_MODEL,
                        "messages": openrouter_messages,
                        "temperature": 0.7,
                        "max_tokens": 1000,
                        "response_format": {"type": "json_object"}
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    reply = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                    if reply:
                        return reply
                print(f"[WARNING] OpenRouter failed ({response.status_code}), falling back to Gemini")
        except Exception as e:
            print(f"[WARNING] OpenRouter error: {e}, falling back to Gemini")

    # Fallback to Gemini
    if GEMINI_API_KEY:
        contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg["content"]}]})

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                json={
                    "contents": contents,
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 1000,
                        "responseMimeType": "application/json"
                    }
                }
            )
            if response.status_code == 200:
                data = response.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
            raise Exception(f"Gemini API error {response.status_code}: {response.text}")

    raise Exception("No LLM API key configured. Set OPENROUTER_API_KEY or GEMINI_API_KEY.")


@app.post("/api/interview/start")
async def start_interview(request: InterviewStartRequest):
    """Start a new interview session."""
    if not OPENROUTER_API_KEY and not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="No LLM API key configured for interview feature.")

    session_id = str(uuid.uuid4())
    system_prompt = build_interview_system_prompt(request.role, request.level, request.tech_stack)

    # Get first question from Gemini
    messages = [
        {"role": "user", "content": system_prompt + "\n\nStart the interview now. Greet briefly and ask the first question. Return JSON only."}
    ]

    try:
        reply = await call_interview_llm(messages)
        result = json.loads(reply)

        # Store session
        interview_sessions[session_id] = {
            "role": request.role,
            "level": request.level,
            "tech_stack": request.tech_stack,
            "question_count": 1,
            "system_prompt": system_prompt,
            "conversation": [
                {"role": "user", "content": messages[0]["content"]},
                {"role": "assistant", "content": reply}
            ]
        }

        return {"session_id": session_id, "response": result}

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse interview response")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interview start error: {str(e)}")


@app.post("/api/interview/answer")
async def submit_interview_answer(request: InterviewAnswerRequest):
    """Submit an answer and get the next question or final report."""
    if not OPENROUTER_API_KEY and not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="No LLM API key configured.")

    session = interview_sessions.get(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    session["question_count"] += 1
    is_final = session["question_count"] > 6  # End after 6 questions

    user_msg = f"Candidate's answer: {request.answer}"
    if is_final:
        user_msg += "\n\nThis was the last question. Generate the final_report JSON now."
    else:
        user_msg += "\n\nEvaluate this answer and ask the next question. Return JSON only."

    session["conversation"].append({"role": "user", "content": user_msg})

    try:
        reply = await call_interview_llm(session["conversation"])
        session["conversation"].append({"role": "assistant", "content": reply})
        result = json.loads(reply)

        if result.get("type") == "final_report":
            # Clean up session after final report
            interview_sessions.pop(request.session_id, None)

        return {"response": result, "question_number": session.get("question_count", 0)}

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse interview response")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interview error: {str(e)}")


@app.post("/api/interview/stt")
async def speech_to_text(audio: UploadFile = File(...)):
    """Convert speech to text using NVIDIA NIM STT API."""
    if not NVIDIA_STT_API_KEY:
        raise HTTPException(status_code=503, detail="NVIDIA STT API key not configured.")

    try:
        audio_bytes = await audio.read()

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                NVIDIA_STT_URL,
                headers={
                    "Authorization": f"Bearer {NVIDIA_STT_API_KEY}",
                },
                files={
                    "file": (audio.filename or "audio.wav", audio_bytes, audio.content_type or "audio/wav"),
                },
                data={
                    "model": "nvidia/parakeet-ctc-1.1b-asr",
                    "language": "en",
                }
            )

            if response.status_code == 200:
                data = response.json()
                return {"text": data.get("text", "")}
            else:
                raise HTTPException(status_code=500, detail=f"NVIDIA STT error: {response.text}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"STT error: {str(e)}")


@app.post("/api/interview/tts")
async def text_to_speech(text: str = Form(...)):
    """Convert text to speech using NVIDIA NIM TTS API."""
    if not NVIDIA_TTS_API_KEY:
        raise HTTPException(status_code=503, detail="NVIDIA TTS API key not configured.")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                NVIDIA_TTS_URL,
                headers={
                    "Authorization": f"Bearer {NVIDIA_TTS_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "nvidia/fastpitch-hifigan-tts",
                    "input": text,
                    "voice": "English-US.Female-1",
                    "response_format": "mp3",
                }
            )

            if response.status_code == 200:
                return StreamingResponse(
                    io.BytesIO(response.content),
                    media_type="audio/mpeg",
                    headers={"Content-Disposition": "inline; filename=speech.mp3"}
                )
            else:
                raise HTTPException(status_code=500, detail=f"NVIDIA TTS error: {response.text}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")


@app.post("/api/compare-careers", response_model=CompareCareersResponse)
async def compare_careers(request: CompareCareersRequest):
    career_db = {
        'Data Analyst': {'salary': 75000, 'skills_needed': 8, 'demand': 9, 'difficulty': 7},
        'Data Scientist': {'salary': 105000, 'skills_needed': 9, 'demand': 9, 'difficulty': 9},
        'Software Engineer': {'salary': 95000, 'skills_needed': 8, 'demand': 8, 'difficulty': 8},
        'Frontend Developer': {'salary': 85000, 'skills_needed': 7, 'demand': 8, 'difficulty': 6},
        'Backend Developer': {'salary': 92000, 'skills_needed': 8, 'demand': 8, 'difficulty': 8},
        'ML Engineer': {'salary': 115000, 'skills_needed': 9, 'demand': 9, 'difficulty': 9},
        'Product Manager': {'salary': 100000, 'skills_needed': 6, 'demand': 7, 'difficulty': 7},
        'Business Analyst': {'salary': 78000, 'skills_needed': 6, 'demand': 8, 'difficulty': 6},
        'UX/UI Designer': {'salary': 82000, 'skills_needed': 7, 'demand': 7, 'difficulty': 6},
    }
    
    comparisons = []
    for career in request.careers:
        matched_career = None
        for key in career_db:
            if key.lower() in career.lower() or career.lower() in key.lower():
                matched_career = key
                break
        
        if matched_career:
            stats = career_db[matched_career]
            comparisons.append({
                "career": matched_career,
                "salary": stats['salary'],
                "skills_needed": stats['skills_needed'],
                "demand": stats['demand'],
                "difficulty": stats['difficulty']
            })
        else:
            comparisons.append({
                "career": career,
                "salary": 80000,
                "skills_needed": 7,
                "demand": 7,
                "difficulty": 7
            })
            
    return CompareCareersResponse(comparison_data=comparisons)  # type: ignore


@app.post("/api/linkedin-analyze", response_model=LinkedInAnalyzeResponse)
async def analyze_linkedin(request: LinkedInAnalyzeRequest):
    """Analyze LinkedIn profile text against a target role."""
    target_role_descriptions = {
        'Data Analyst': "Looking for a Data Analyst with skills in Python, SQL, Excel, Data Visualization, Tableau, Power BI, Statistics.",
        'Software Engineer': "Software Engineer needed with experience in Python, Java, JavaScript, React, System Design, Algorithms, Git, Database.",
        'Backend Developer': "Backend developer familiar with Python, FastAPI, Node.js, SQL, NoSQL, APIs, Docker.",
        'Frontend Developer': "Frontend developer proficient in HTML, CSS, JavaScript, React, UI/UX, responsive design.",
        'ML Engineer': "Machine Learning Engineer with strong Python, TensorFlow, PyTorch, scikit-learn, Statistics, model deployment."
    }
    
    job_desc = target_role_descriptions.get(request.target_role, f"Looking for {request.target_role} with relevant industry skills, communication, and technical expertise.")
    
    try:
        vectorizer, resume_vec, job_vec = build_tfidf_vectors(request.profile_text, job_desc)
        
        similarity = cosine_similarity(resume_vec, job_vec)[0][0]
        match_percentage = min(float(similarity * 150), 100.0)  # Boost scaling for typical texts
        
        resume_tfidf = resume_vec.toarray()[0]
        feature_names = vectorizer.get_feature_names_out()
        missing_keywords = get_missing_keywords(resume_vec, job_vec, vectorizer, limit=8)
        strengths = []
        for idx, term in enumerate(feature_names):
            if resume_tfidf[idx] > 0:
                strengths.append(term)
                    
        return LinkedInAnalyzeResponse(
            fit_score=round(match_percentage, 2),  # type: ignore
            gap_analysis=missing_keywords,  # type: ignore
            strengths=strengths[:5]  # type: ignore
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LinkedIn analysis error: {str(e)}")


if __name__ == "__main__":
    import uvicorn  # type: ignore
    uvicorn.run(app, host="0.0.0.0", port=8000)
