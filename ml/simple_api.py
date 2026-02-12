"""
Simple FastAPI Service for Testing
Basic endpoints to verify Railway deployment
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

app = FastAPI(
    title="AI-Powered Career & Skills Advisor API",
    description="Machine Learning API for career prediction, skill gap analysis, and resume matching",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://aujkhanbhaiyo.vercel.app",  # Your specific Vercel frontend
        "https://*.vercel.app",  # Allow all Vercel deployments
        "https://*.netlify.app",  # Allow all Netlify deployments
        "http://localhost:3000",  # Local development
        "http://localhost:5173",  # Vite default port
        "*"  # Fallback for development
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Pydantic models
class CareerPredictionRequest(BaseModel):
    education: str
    skills: List[str]
    interest: str
    experience_years: int

class CareerPredictionResponse(BaseModel):
    predicted_career: str
    confidence: float

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "AI-Powered Career & Skills Advisor API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "/predict-career": "POST - Predict career path based on profile",
            "/health": "GET - Check API health status"
        }
    }

@app.get("/api/data")
async def get_api_data():
    """Get API data endpoint."""
    return {
        "message": "API data endpoint working",
        "status": "success",
        "data": {
            "version": "1.0.0",
            "endpoints": [
                "/predict-career",
                "/health",
                "/api/data"
            ]
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "api": "running",
        "models": "simplified"
    }

@app.post("/predict-career", response_model=CareerPredictionResponse)
async def predict_career(request: CareerPredictionRequest):
    """
    Simple career prediction based on rules.
    """
    try:
        # Simple rule-based prediction
        education = request.education.lower()
        interest = request.interest.lower()
        skills = [skill.lower() for skill in request.skills]
        
        # Simple prediction logic
        if 'data' in interest or any('python' in skill or 'sql' in skill for skill in skills):
            predicted_career = "Data Analyst"
        elif 'web' in interest or any('javascript' in skill or 'html' in skill for skill in skills):
            predicted_career = "Frontend Developer"
        elif 'business' in interest or any('excel' in skill for skill in skills):
            predicted_career = "Business Analyst"
        else:
            predicted_career = "Software Developer"
        
        return CareerPredictionResponse(
            predicted_career=predicted_career,
            confidence=0.85
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
