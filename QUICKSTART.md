# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Generate Datasets & Train Models

**Option A: Run Complete Pipeline (Recommended)**
```bash
python run_pipeline.py
```

**Option B: Run Steps Manually**
```bash
# Generate datasets
cd ml/data
python generate_dataset.py

# Train models (includes preprocessing)
cd ..
python train_models.py

# Evaluate models (optional)
python evaluate.py
```

### Step 3: Start API Server

```bash
cd ml
python api.py
```

Or using uvicorn:
```bash
uvicorn ml.api:app --reload --host 0.0.0.0 --port 8000
```

Access API documentation at: **http://localhost:8000/docs**

## 📡 Test the API

### 1. Predict Career Path

```bash
curl -X POST "http://localhost:8000/predict-career" \
  -H "Content-Type: application/json" \
  -d '{
    "education": "BCA",
    "skills": ["Python", "SQL", "Excel"],
    "interest": "Data",
    "experience_years": 1
  }'
```

### 2. Analyze Skill Gap

```bash
curl -X POST "http://localhost:8000/skill-gap" \
  -H "Content-Type: application/json" \
  -d '{
    "current_skills": ["Excel", "SQL"],
    "target_role": "Data Analyst"
  }'
```

### 3. Match Resume with Job

```bash
curl -X POST "http://localhost:8000/resume-match" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "Education: BCA. Skills: Python, SQL, Excel. Experience: 2 years as Data Analyst.",
    "job_description": "Looking for Data Analyst with Python, SQL, Statistics skills."
  }'
```

## 📊 Project Structure

```
ml/
├── data/
│   ├── generate_dataset.py      # Generate synthetic datasets
│   ├── career_train.csv         # Training data (1000 samples)
│   └── career_test.csv          # Test data (1000 samples)
├── preprocessing.py              # Feature engineering
├── train_models.py              # Train all 3 ML models
├── evaluate.py                  # Model evaluation
├── api.py                       # FastAPI service
└── models/                      # Saved models (created after training)
    ├── career_model.pkl
    ├── skill_gap_model.pkl
    ├── tfidf_vectorizer.pkl
    └── [encoders and scalers]
```

## ✅ Verification

After training, verify models are saved:
```bash
ls ml/models/
```

You should see:
- `career_model.pkl`
- `skill_gap_model.pkl`
- `tfidf_vectorizer.pkl`
- `education_encoder.pkl`
- `interest_encoder.pkl`
- `target_encoder.pkl`
- `experience_scaler.pkl`

## 🐛 Troubleshooting

### Models not found error
- Make sure you've run `train_models.py` first
- Check that `ml/models/` directory exists with all `.pkl` files

### Import errors
- Ensure you're running scripts from the correct directory
- All scripts should be run from `ml/` directory (except generate_dataset.py from `ml/data/`)

### Path errors
- Use the `run_pipeline.py` script which handles paths automatically
- Or ensure you're in the correct working directory when running scripts manually

## 📚 Next Steps

1. Review the comprehensive `README.md` for detailed documentation
2. Check `ml/evaluate.py` output for model performance metrics
3. Explore the API documentation at http://localhost:8000/docs
4. Customize the models by adjusting hyperparameters in `train_models.py`
