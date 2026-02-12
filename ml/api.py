"""
FastAPI ML Service
REST API endpoints for career prediction, skill gap analysis, and resume matching.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import pandas as pd
import joblib
import os
from sklearn.metrics.pairwise import cosine_similarity
import warnings
warnings.filterwarnings('ignore')

# OpenRouter API
import httpx
import json

# Import preprocessing utilities
from preprocessing import FeaturePreprocessor

app = FastAPI(
    title="AI-Powered Career & Skills Advisor API",
    description="Machine Learning API for career prediction, skill gap analysis, and resume matching",
    version="1.0.0"
)

# Add CORS middleware - MUST be added before routes
# Using wildcard for development - allows all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
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


# OpenRouter API Configuration
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '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')
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "openai/gpt-4o-mini"  # Using GPT-4o-mini via OpenRouter

if OPENROUTER_API_KEY:
    print(f"[OK] OpenRouter API configured")
    print(f"[OK] API Key configured: {OPENROUTER_API_KEY[:20]}...{OPENROUTER_API_KEY[-10:]}")
    print(f"[OK] Using model: {OPENROUTER_MODEL}")
else:
    print("[WARNING] OpenRouter API key not available.")


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
    if career_model is None or preprocessor is None:
        raise HTTPException(
            status_code=503,
            detail="Career prediction model not loaded. Please train models first."
        )
    
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
        
        return CareerPredictionResponse(
            predicted_career=predicted_role,
            confidence=confidence
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
    if skill_gap_model is None:
        raise HTTPException(
            status_code=503,
            detail="OpenRouter API is not configured. Please set OPENROUTER_API_KEY environment variable."
        )
    
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
            missing_skills=missing_skills,
            readiness_level=readiness_level
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
    if tfidf_vectorizer is None:
        raise HTTPException(
            status_code=503,
            detail="TF-IDF vectorizer not loaded. Please train models first."
        )
    
    try:
        # Vectorize resume and job description
        resume_vec = tfidf_vectorizer.transform([request.resume_text])
        job_vec = tfidf_vectorizer.transform([request.job_description])
        
        # Calculate cosine similarity
        similarity = cosine_similarity(resume_vec, job_vec)[0][0]
        match_percentage = float(similarity * 100)
        
        # Extract missing keywords
        # Get important terms from job description
        job_tfidf = job_vec.toarray()[0]
        feature_names = tfidf_vectorizer.get_feature_names_out()
        
        # Get top terms from job description
        top_indices = np.argsort(job_tfidf)[::-1][:20]  # Top 20 terms
        top_job_terms = [feature_names[idx] for idx in top_indices if job_tfidf[idx] > 0]
        
        # Check which terms are in resume
        resume_tfidf = resume_vec.toarray()[0]
        missing_keywords = []
        for term in top_job_terms:
            if term in feature_names:
                term_idx = list(feature_names).index(term)
                if resume_tfidf[term_idx] == 0:  # Term not in resume
                    missing_keywords.append(term)
        
        # Limit missing keywords to top 10
        missing_keywords = missing_keywords[:10]
        
        return ResumeMatchResponse(
            match_percentage=round(match_percentage, 2),
            missing_keywords=missing_keywords
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
        if request.conversation_history:
            for msg in request.conversation_history[-10:]:
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
                return ChatResponse(reply=reply)
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
        if request.current_skills:
            user_query += f"Current Skills: {', '.join(request.current_skills)}\n"
        
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
                    roadmap={
                        "title": roadmap_data.get('title', 'Career Roadmap'),
                        "description": roadmap_data.get('description', ''),
                        "timeline": roadmap_data.get('timeline', '')
                    },
                    steps=steps,
                    timeline=roadmap_data.get('timeline', '3-6 months')
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
