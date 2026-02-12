"""
Model Training Script
Trains three ML models for career prediction, skill gap analysis, and resume matching.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.multioutput import MultiOutputClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import os
from preprocessing import load_and_preprocess_data, SKILLS_LIST
import warnings
warnings.filterwarnings('ignore')

MODELS_DIR = 'ml/models'
os.makedirs(MODELS_DIR, exist_ok=True)


def train_career_prediction_model(X_train, y_train, X_test, y_test, target_encoder):
    """
    Model 1: Career Path Prediction
    Type: Multi-class Classification
    Algorithm: RandomForestClassifier
    
    Why RandomForest?
    - Handles mixed feature types well
    - Non-linear decision boundaries
    - Feature importance insights
    - Robust to overfitting
    - Good for tabular data
    
    Limitations:
    - Less interpretable than linear models
    - Can be memory intensive with many trees
    """
    print("\n" + "="*60)
    print("MODEL 1: Career Path Prediction")
    print("="*60)
    
    # Initialize Random Forest Classifier
    # Using multiple estimators for better performance
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
        class_weight='balanced'  # Handle class imbalance
    )
    
    print("Training Random Forest Classifier...")
    model.fit(X_train, y_train)
    
    # Predictions
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    
    # Calculate metrics
    train_accuracy = accuracy_score(y_train, y_train_pred)
    test_accuracy = accuracy_score(y_test, y_test_pred)
    
    train_precision = precision_score(y_train, y_train_pred, average='weighted', zero_division=0)
    test_precision = precision_score(y_test, y_test_pred, average='weighted', zero_division=0)
    
    train_recall = recall_score(y_train, y_train_pred, average='weighted', zero_division=0)
    test_recall = recall_score(y_test, y_test_pred, average='weighted', zero_division=0)
    
    train_f1 = f1_score(y_train, y_train_pred, average='weighted', zero_division=0)
    test_f1 = f1_score(y_test, y_test_pred, average='weighted', zero_division=0)
    
    print("\nTraining Metrics:")
    print(f"  Accuracy:  {train_accuracy:.4f}")
    print(f"  Precision: {train_precision:.4f}")
    print(f"  Recall:    {train_recall:.4f}")
    print(f"  F1-Score:  {train_f1:.4f}")
    
    print("\nTest Metrics:")
    print(f"  Accuracy:  {test_accuracy:.4f}")
    print(f"  Precision: {test_precision:.4f}")
    print(f"  Recall:    {test_recall:.4f}")
    print(f"  F1-Score:  {test_f1:.4f}")
    
    # Feature importance
    feature_importances = model.feature_importances_
    print("\nTop 5 Most Important Features:")
    indices = np.argsort(feature_importances)[::-1][:5]
    for i, idx in enumerate(indices, 1):
        print(f"  {i}. Feature {idx}: {feature_importances[idx]:.4f}")
    
    # Save model
    model_path = os.path.join(MODELS_DIR, 'career_model.pkl')
    joblib.dump(model, model_path)
    print(f"\n[OK] Model saved to {model_path}")
    
    return model, y_test_pred


def train_skill_gap_model(X_train, y_train, X_test, y_test, target_encoder, preprocessor):
    """
    Model 2: Skill Gap / Skill Readiness
    Type: Multi-label Classification (treating as multi-output)
    Algorithm: Logistic Regression (one-vs-rest)
    
    Why Logistic Regression?
    - Probabilistic output for each skill
    - Fast training and inference
    - Interpretable coefficients
    - Good baseline for multi-label problems
    - Well-suited for binary classification per skill
    
    Limitations:
    - Assumes linear relationships
    - May need feature engineering for complex patterns
    """
    print("\n" + "="*60)
    print("MODEL 2: Skill Gap / Skill Readiness")
    print("="*60)
    
    # Create multi-label target: predict presence of each skill based on role and features
    # This is a simplified approach - in production, you'd have skill labels per sample
    print("Creating skill-based targets from role patterns...")
    
    # Get unique roles
    unique_roles = target_encoder.classes_
    
    # Create skill-role mapping (skills typically needed for each role)
    skill_role_mapping = {
        'Data Analyst': ['Python', 'SQL', 'Excel', 'Power BI', 'Statistics'],
        'Business Analyst': ['Excel', 'SQL', 'Power BI', 'Communication', 'Statistics'],
        'Frontend Developer': ['JavaScript', 'HTML', 'CSS', 'Communication'],
        'Backend Developer': ['Python', 'JavaScript', 'SQL'],
        'ML Engineer': ['Python', 'ML', 'Statistics', 'SQL'],
        'QA Tester': ['JavaScript', 'Python', 'Communication'],
        'Product Manager': ['Communication', 'Excel', 'Statistics']
    }
    
    # Create binary targets for each skill (1 if skill is needed for the role, 0 otherwise)
    y_train_skills = np.zeros((len(y_train), len(SKILLS_LIST)))
    y_test_skills = np.zeros((len(y_test), len(SKILLS_LIST)))
    
    for i, role_encoded in enumerate(y_train):
        role = target_encoder.inverse_transform([role_encoded])[0]
        if role in skill_role_mapping:
            required_skills = skill_role_mapping[role]
            for skill in required_skills:
                if skill in SKILLS_LIST:
                    skill_idx = SKILLS_LIST.index(skill)
                    y_train_skills[i, skill_idx] = 1
    
    for i, role_encoded in enumerate(y_test):
        role = target_encoder.inverse_transform([role_encoded])[0]
        if role in skill_role_mapping:
            required_skills = skill_role_mapping[role]
            for skill in required_skills:
                if skill in SKILLS_LIST:
                    skill_idx = SKILLS_LIST.index(skill)
                    y_test_skills[i, skill_idx] = 1
    
    # Train Logistic Regression for multi-output using MultiOutputClassifier
    base_estimator = LogisticRegression(
        max_iter=1000,
        random_state=42,
        multi_class='ovr',
        class_weight='balanced'
    )
    model = MultiOutputClassifier(base_estimator, n_jobs=-1)
    
    print("Training Logistic Regression (Multi-output)...")
    model.fit(X_train, y_train_skills)
    
    # Predictions
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    
    # Predict probabilities (for MultiOutputClassifier, predict_proba returns list)
    # Note: MultiOutputClassifier returns probabilities for each output separately
    try:
        y_train_proba = model.predict_proba(X_train)
        y_test_proba = model.predict_proba(X_test)
    except:
        y_train_proba = None
        y_test_proba = None
    
    # Calculate metrics (averaged across all skills)
    train_accuracy = accuracy_score(y_train_skills, y_train_pred)
    test_accuracy = accuracy_score(y_test_skills, y_test_pred)
    
    train_precision = precision_score(y_train_skills, y_train_pred, average='weighted', zero_division=0)
    test_precision = precision_score(y_test_skills, y_test_pred, average='weighted', zero_division=0)
    
    train_recall = recall_score(y_train_skills, y_train_pred, average='weighted', zero_division=0)
    test_recall = recall_score(y_test_skills, y_test_pred, average='weighted', zero_division=0)
    
    train_f1 = f1_score(y_train_skills, y_train_pred, average='weighted', zero_division=0)
    test_f1 = f1_score(y_test_skills, y_test_pred, average='weighted', zero_division=0)
    
    print("\nTraining Metrics (averaged across all skills):")
    print(f"  Accuracy:  {train_accuracy:.4f}")
    print(f"  Precision: {train_precision:.4f}")
    print(f"  Recall:    {train_recall:.4f}")
    print(f"  F1-Score:  {train_f1:.4f}")
    
    print("\nTest Metrics (averaged across all skills):")
    print(f"  Accuracy:  {test_accuracy:.4f}")
    print(f"  Precision: {test_precision:.4f}")
    print(f"  Recall:    {test_recall:.4f}")
    print(f"  F1-Score:  {test_f1:.4f}")
    
    # Save model
    model_path = os.path.join(MODELS_DIR, 'skill_gap_model.pkl')
    joblib.dump(model, model_path)
    print(f"\n[OK] Model saved to {model_path}")
    
    return model


def train_resume_matching_model(train_df, test_df):
    """
    Model 3: Resume–Job Matching
    Type: NLP Similarity
    Algorithm: TF-IDF Vectorizer + Cosine Similarity
    
    Why TF-IDF + Cosine Similarity?
    - Simple and effective for text matching
    - Handles keyword extraction well
    - Fast inference
    - Good baseline for document similarity
    - Interpretable (can extract important terms)
    
    Limitations:
    - Doesn't capture semantic meaning (would need word embeddings/transformers)
    - Sensitive to exact keyword matches
    - May not handle synonyms well
    """
    print("\n" + "="*60)
    print("MODEL 3: Resume–Job Matching")
    print("="*60)
    
    # Generate synthetic resume and job description pairs for training
    print("Creating synthetic resume-job description pairs...")
    
    def create_resume_text(row):
        """Create synthetic resume text from profile features."""
        skills = row['skills']
        education = row['education']
        interest = row['interest']
        exp = row['experience_years']
        role = row['target_role']
        
        resume = f"Education: {education}. Interest: {interest}. "
        resume += f"Skills: {skills}. "
        resume += f"Experience: {exp} years in {role}."
        return resume
    
    def create_job_description(role):
        """Create synthetic job description for a role."""
        job_descriptions = {
            'Data Analyst': 'Looking for a Data Analyst with Python, SQL, Excel, and Statistics skills. Experience in data analysis and visualization with Power BI.',
            'Business Analyst': 'Seeking Business Analyst with Excel, SQL, Communication skills. Experience in business intelligence and reporting.',
            'Frontend Developer': 'Frontend Developer position requiring HTML, CSS, JavaScript skills. Experience in web development and UI/UX.',
            'Backend Developer': 'Backend Developer needed with Python or JavaScript, SQL skills. Experience in server-side development and APIs.',
            'ML Engineer': 'Machine Learning Engineer position requiring Python, ML, Statistics skills. Experience in machine learning models and algorithms.',
            'QA Tester': 'QA Tester position requiring JavaScript or Python skills. Experience in testing and quality assurance.',
            'Product Manager': 'Product Manager role requiring Communication, Excel, Statistics skills. Experience in product management and analytics.'
        }
        return job_descriptions.get(role, f'{role} position requiring relevant skills.')
    
    # Create synthetic pairs
    train_resumes = train_df.apply(create_resume_text, axis=1).tolist()
    train_jobs = train_df['target_role'].apply(create_job_description).tolist()
    
    test_resumes = test_df.apply(create_resume_text, axis=1).tolist()
    test_jobs = test_df['target_role'].apply(create_job_description).tolist()
    
    # Combine resume and job description for TF-IDF
    train_texts = [f"{resume} {job}" for resume, job in zip(train_resumes, train_jobs)]
    test_texts = [f"{resume} {job}" for resume, job in zip(test_resumes, test_jobs)]
    
    # Initialize and fit TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(
        max_features=500,
        ngram_range=(1, 2),  # Unigrams and bigrams
        min_df=2,
        max_df=0.95,
        stop_words='english'
    )
    
    print("Training TF-IDF Vectorizer...")
    X_train_tfidf = vectorizer.fit_transform(train_texts)
    X_test_tfidf = vectorizer.transform(test_texts)
    
    print(f"  Vocabulary size: {len(vectorizer.vocabulary_)}")
    print(f"  Training vectors shape: {X_train_tfidf.shape}")
    print(f"  Test vectors shape: {X_test_tfidf.shape}")
    
    # Calculate cosine similarity (for demonstration, we'll compute similarities)
    from sklearn.metrics.pairwise import cosine_similarity
    
    # For training: calculate similarity between resume and job pairs
    train_similarities = []
    for i in range(len(train_resumes)):
        resume_vec = vectorizer.transform([train_resumes[i]])
        job_vec = vectorizer.transform([train_jobs[i]])
        sim = cosine_similarity(resume_vec, job_vec)[0][0]
        train_similarities.append(sim)
    
    test_similarities = []
    for i in range(len(test_resumes)):
        resume_vec = vectorizer.transform([test_resumes[i]])
        job_vec = vectorizer.transform([test_jobs[i]])
        sim = cosine_similarity(resume_vec, job_vec)[0][0]
        test_similarities.append(sim)
    
    avg_train_sim = np.mean(train_similarities)
    avg_test_sim = np.mean(test_similarities)
    
    print("\nSimilarity Statistics:")
    print(f"  Average training similarity: {avg_train_sim:.4f}")
    print(f"  Average test similarity: {avg_test_sim:.4f}")
    print(f"  Min similarity: {np.min(test_similarities):.4f}")
    print(f"  Max similarity: {np.max(test_similarities):.4f}")
    
    # Save vectorizer
    vectorizer_path = os.path.join(MODELS_DIR, 'tfidf_vectorizer.pkl')
    joblib.dump(vectorizer, vectorizer_path)
    print(f"\n[OK] TF-IDF Vectorizer saved to {vectorizer_path}")
    
    return vectorizer


def main():
    """Main training pipeline."""
    print("="*60)
    print("MACHINE LEARNING MODEL TRAINING")
    print("="*60)
    
    # Load and preprocess data
    script_dir = os.path.dirname(os.path.abspath(__file__))
    train_path = os.path.join(script_dir, 'data', 'career_train.csv')
    test_path = os.path.join(script_dir, 'data', 'career_test.csv')
    
    X_train, X_test, y_train, y_test, preprocessor = load_and_preprocess_data(
        train_path, test_path
    )
    
    # Load raw dataframes for resume matching
    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)
    
    # Train Model 1: Career Prediction
    career_model, y_test_pred = train_career_prediction_model(
        X_train, y_train, X_test, y_test, preprocessor.target_encoder
    )
    
    # Train Model 2: Skill Gap
    skill_model = train_skill_gap_model(
        X_train, y_train, X_test, y_test, preprocessor.target_encoder, preprocessor
    )
    
    # Train Model 3: Resume Matching
    tfidf_vectorizer = train_resume_matching_model(train_df, test_df)
    
    print("\n" + "="*60)
    print("TRAINING COMPLETE!")
    print("="*60)
    print("\nAll models saved to ml/models/")
    print("  - career_model.pkl")
    print("  - skill_gap_model.pkl")
    print("  - tfidf_vectorizer.pkl")
    print("\nReady for inference!")


if __name__ == '__main__':
    main()
