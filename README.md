# AI-Powered Career & Skills Advisor

A comprehensive machine learning web application that predicts career paths, analyzes skill gaps, and matches resumes with job descriptions using real ML models.

## 🎯 Problem Statement

In today's dynamic job market, professionals face challenges in:
- Identifying suitable career paths based on their profile
- Understanding skill gaps for target roles
- Matching their resume with job descriptions effectively

This project provides AI-powered solutions using machine learning models to address these challenges.

## 🤖 ML Approach

This project uses **three distinct ML models** (not just rules) to solve different aspects of career guidance:

### Model 1: Career Path Prediction
- **Type**: Multi-class Classification
- **Algorithm**: Random Forest Classifier
- **Why Random Forest?**
  - Handles mixed feature types well
  - Captures non-linear decision boundaries
  - Provides feature importance insights
  - Robust to overfitting
  - Excellent for tabular data
- **Input**: Education, Skills, Interest, Experience Years
- **Output**: Predicted career role with confidence score

### Model 2: Skill Gap Analysis
- **Type**: Multi-label Classification (Multi-output)
- **Algorithm**: Logistic Regression (One-vs-Rest)
- **Why Logistic Regression?**
  - Provides probabilistic output for each skill
  - Fast training and inference
  - Interpretable coefficients
  - Good baseline for multi-label problems
- **Input**: Profile features
- **Output**: Probability score for each required skill

### Model 3: Resume-Job Matching
- **Type**: NLP Similarity Analysis
- **Algorithm**: TF-IDF Vectorizer + Cosine Similarity
- **Why TF-IDF + Cosine Similarity?**
  - Simple and effective for text matching
  - Handles keyword extraction well
  - Fast inference
  - Good baseline for document similarity
  - Interpretable (can extract important terms)
- **Input**: Resume text + Job description
- **Output**: Match percentage and missing keywords

## 📊 Dataset

### Synthetic Dataset Generation

**Note**: This dataset is **synthetic and generated for academic/portfolio purposes**.

The dataset includes:
- **Training Set**: 1000 samples (`career_train.csv`)
- **Test Set**: 1000 samples (`career_test.csv`)

### Features:
- **education**: BCA, BBA, BA, BSc, BCom, MBA
- **skills**: Comma-separated values from:
  - Python, SQL, Excel, Power BI, JavaScript, HTML, CSS, Communication, Statistics, ML
- **interest**: Data, Web, Business, AI, Teaching, Sales
- **experience_years**: Integer from 0 to 5
- **target_role**: 
  - Data Analyst, Business Analyst, Frontend Developer,
  - Backend Developer, ML Engineer, QA Tester, Product Manager

### Data Consistency Rules:
- Data + Python + SQL → Data Analyst
- Web + HTML + CSS + JavaScript → Frontend Developer
- AI + Python + ML → ML Engineer
- Business + Excel + Communication → Business Analyst

## 🏗️ Project Structure

```
ml/
├── data/
│   ├── generate_dataset.py      # Synthetic dataset generation
│   ├── career_train.csv         # Training dataset (1000 samples)
│   └── career_test.csv          # Test dataset (1000 samples)
├── preprocessing.py              # Feature engineering and preprocessing
├── train_models.py              # Model training pipeline
├── evaluate.py                  # Model evaluation with metrics
├── api.py                       # FastAPI service
└── models/                      # Saved models directory
    ├── career_model.pkl         # Trained career prediction model
    ├── skill_gap_model.pkl      # Trained skill gap model
    ├── tfidf_vectorizer.pkl     # TF-IDF vectorizer
    ├── education_encoder.pkl    # Education label encoder
    ├── interest_encoder.pkl     # Interest label encoder
    ├── target_encoder.pkl       # Target role encoder
    └── experience_scaler.pkl    # Experience years scaler
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Generate Datasets

```bash
cd ml/data
python generate_dataset.py
```

This will generate:
- `career_train.csv` (1000 rows)
- `career_test.csv` (1000 rows)

### Step 3: Train Models

```bash
cd ml
python train_models.py
```

This will:
- Load and preprocess data
- Train all three ML models
- Save models to `ml/models/` directory
- Display training metrics

### Step 4: Evaluate Models (Optional)

```bash
python evaluate.py
```

This will display comprehensive evaluation metrics including:
- Accuracy, Precision, Recall, F1-Score
- Confusion Matrix
- Per-class performance
- Similarity statistics

### Step 5: Start API Server

```bash
python api.py
```

Or using uvicorn directly:

```bash
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## 📡 API Usage

### Endpoint 1: Predict Career Path

**POST** `/predict-career`

**Request:**
```json
{
  "education": "BCA",
  "skills": ["Python", "SQL", "Excel"],
  "interest": "Data",
  "experience_years": 1
}
```

**Response:**
```json
{
  "predicted_career": "Data Analyst",
  "confidence": 0.82
}
```

### Endpoint 2: Analyze Skill Gap

**POST** `/skill-gap`

**Request:**
```json
{
  "current_skills": ["Excel", "SQL"],
  "target_role": "Data Analyst"
}
```

**Response:**
```json
{
  "missing_skills": ["Python", "Statistics"],
  "readiness_level": "Beginner"
}
```

### Endpoint 3: Match Resume with Job

**POST** `/resume-match`

**Request:**
```json
{
  "resume_text": "Education: BCA. Skills: Python, SQL, Excel. Experience: 2 years as Data Analyst.",
  "job_description": "Looking for Data Analyst with Python, SQL, Statistics skills. Experience in data analysis."
}
```

**Response:**
```json
{
  "match_percentage": 74.52,
  "missing_keywords": ["statistics", "analysis"]
}
```

### Health Check

**GET** `/health`

Returns API health status and model loading status.

## 📈 Model Performance

### Career Prediction Model
- **Accuracy**: ~85-90% (varies based on data)
- **Algorithm**: Random Forest (200 trees)
- **Strengths**: Handles complex feature interactions well
- **Limitations**: Less interpretable than linear models

### Skill Gap Model
- **Accuracy**: ~75-85% (averaged across skills)
- **Algorithm**: Logistic Regression (Multi-output)
- **Strengths**: Fast inference, probabilistic outputs
- **Limitations**: Assumes linear relationships

### Resume Matching Model
- **Mean Similarity**: ~60-75% for matched pairs
- **Algorithm**: TF-IDF + Cosine Similarity
- **Strengths**: Simple, fast, interpretable
- **Limitations**: Doesn't capture semantic meaning (consider word embeddings for production)

## 🔧 Feature Engineering

### Preprocessing Steps:
1. **Education**: Label Encoding (BCA=0, BBA=1, ...)
2. **Interest**: Label Encoding (Data=0, Web=1, ...)
3. **Skills**: Multi-hot encoding (binary column per skill)
4. **Experience Years**: StandardScaler normalization

### Final Feature Matrix:
- 1 feature: Education (encoded)
- 1 feature: Interest (encoded)
- 1 feature: Experience Years (normalized)
- 10 features: Skills (binary, multi-hot encoded)
- **Total**: 13 features

## 💡 Future Improvements

### Model Enhancements:
1. **Career Prediction**:
   - Experiment with XGBoost or LightGBM for better performance
   - Add feature engineering (skill combinations, education-interest interactions)
   - Implement ensemble methods

2. **Skill Gap Analysis**:
   - Use actual skill labels from training data
   - Implement multi-label classification with better algorithms (e.g., MLkNN)
   - Add skill importance ranking

3. **Resume Matching**:
   - Replace TF-IDF with word embeddings (Word2Vec, FastText)
   - Use transformer models (BERT, Sentence-BERT) for semantic matching
   - Add named entity recognition (NER) for skill extraction
   - Implement semantic similarity using pre-trained models

### Data Improvements:
- Use real-world datasets instead of synthetic data
- Add more features (location, industry, certifications)
- Include temporal data (career progression over time)
- Add more career roles and skills

### API Enhancements:
- Add authentication and rate limiting
- Implement batch prediction endpoints
- Add model versioning
- Include explainability endpoints (SHAP values, feature importance)
- Add caching for faster inference

### Deployment:
- Containerize with Docker
- Deploy on cloud platforms (AWS, GCP, Azure)
- Add CI/CD pipeline
- Implement monitoring and logging
- Add automated retraining pipeline

## 📝 Code Quality

- **Modular Design**: Each component in separate file
- **Clear Comments**: Explanations for complex logic
- **Type Hints**: Where applicable
- **Error Handling**: Comprehensive exception handling
- **Documentation**: Inline comments and docstrings
- **Industry Standards**: Following best practices

## 🎓 Academic/Portfolio Use

This project is designed for:
- Academic research and learning
- Portfolio demonstration
- Interview preparation
- Understanding ML pipeline end-to-end

**Note**: The dataset is synthetic. For production use, real-world datasets should be used with appropriate data privacy considerations.

## 📄 License

This project is for educational and portfolio purposes.

## 👤 Author

Senior Machine Learning Engineer & Full-Stack Developer

---

**Built with ❤️ using Python, scikit-learn, and FastAPI**
