"""
Model Evaluation Script
Comprehensive evaluation of all trained models with detailed metrics and visualizations.
"""

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import os
from preprocessing import FeaturePreprocessor, SKILLS_LIST

MODELS_DIR = 'ml/models'


def evaluate_career_model(X_test, y_test, target_encoder):
    """
    Evaluate career prediction model with comprehensive metrics.
    
    Args:
        X_test: Test feature matrix
        y_test: True test labels
        target_encoder: Fitted label encoder for target roles
    """
    print("\n" + "="*70)
    print("EVALUATION: Career Path Prediction Model")
    print("="*70)
    
    # Load model
    model_path = os.path.join(MODELS_DIR, 'career_model.pkl')
    model = joblib.load(model_path)
    print(f"[OK] Loaded model from {model_path}")
    
    # Predictions
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)
    
    # Overall metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    
    print("\nOverall Performance Metrics:")
    print(f"  Accuracy:  {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"  Precision: {precision:.4f} ({precision*100:.2f}%)")
    print(f"  Recall:    {recall:.4f} ({recall*100:.2f}%)")
    print(f"  F1-Score:  {f1:.4f} ({f1*100:.2f}%)")
    
    # Per-class metrics
    print("\nPer-Class Performance:")
    class_report = classification_report(
        y_test, y_pred,
        target_names=target_encoder.classes_,
        zero_division=0
    )
    print(class_report)
    
    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    print("\nConfusion Matrix:")
    print("Rows = True labels, Columns = Predicted labels")
    print(f"\n{'':<20}", end='')
    for role in target_encoder.classes_:
        print(f"{role[:15]:<16}", end='')
    print()
    
    for i, true_role in enumerate(target_encoder.classes_):
        print(f"{true_role[:18]:<20}", end='')
        for j in range(len(target_encoder.classes_)):
            print(f"{cm[i, j]:<16}", end='')
        print()
    
    # Prediction confidence analysis
    max_proba = np.max(y_pred_proba, axis=1)
    avg_confidence = np.mean(max_proba)
    print(f"\nPrediction Confidence Analysis:")
    print(f"  Average confidence: {avg_confidence:.4f} ({avg_confidence*100:.2f}%)")
    print(f"  Min confidence: {np.min(max_proba):.4f} ({np.min(max_proba)*100:.2f}%)")
    print(f"  Max confidence: {np.max(max_proba):.4f} ({np.max(max_proba)*100:.2f}%)")
    print(f"  Low confidence predictions (<0.5): {(max_proba < 0.5).sum()} ({(max_proba < 0.5).mean()*100:.2f}%)")
    
    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1,
        'confusion_matrix': cm,
        'avg_confidence': avg_confidence
    }


def evaluate_skill_gap_model(X_test, y_test, target_encoder, preprocessor):
    """
    Evaluate skill gap model with comprehensive metrics.
    """
    print("\n" + "="*70)
    print("EVALUATION: Skill Gap / Skill Readiness Model")
    print("="*70)
    
    # Load model
    model_path = os.path.join(MODELS_DIR, 'skill_gap_model.pkl')
    model = joblib.load(model_path)
    print(f"[OK] Loaded model from {model_path}")
    
    # Create skill targets (same as in training)
    skill_role_mapping = {
        'Data Analyst': ['Python', 'SQL', 'Excel', 'Power BI', 'Statistics'],
        'Business Analyst': ['Excel', 'SQL', 'Power BI', 'Communication', 'Statistics'],
        'Frontend Developer': ['JavaScript', 'HTML', 'CSS', 'Communication'],
        'Backend Developer': ['Python', 'JavaScript', 'SQL'],
        'ML Engineer': ['Python', 'ML', 'Statistics', 'SQL'],
        'QA Tester': ['JavaScript', 'Python', 'Communication'],
        'Product Manager': ['Communication', 'Excel', 'Statistics']
    }
    
    y_test_skills = np.zeros((len(y_test), len(SKILLS_LIST)))
    for i, role_encoded in enumerate(y_test):
        role = target_encoder.inverse_transform([role_encoded])[0]
        if role in skill_role_mapping:
            required_skills = skill_role_mapping[role]
            for skill in required_skills:
                if skill in SKILLS_LIST:
                    skill_idx = SKILLS_LIST.index(skill)
                    y_test_skills[i, skill_idx] = 1
    
    # Predictions
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)
    
    # Overall metrics
    accuracy = accuracy_score(y_test_skills, y_pred)
    precision = precision_score(y_test_skills, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y_test_skills, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test_skills, y_pred, average='weighted', zero_division=0)
    
    print("\nOverall Performance Metrics (averaged across all skills):")
    print(f"  Accuracy:  {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"  Precision: {precision:.4f} ({precision*100:.2f}%)")
    print(f"  Recall:    {recall:.4f} ({recall*100:.2f}%)")
    print(f"  F1-Score:  {f1:.4f} ({f1*100:.2f}%)")
    
    # Per-skill metrics
    print("\nPer-Skill Performance:")
    print(f"{'Skill':<20} {'Precision':<12} {'Recall':<12} {'F1-Score':<12}")
    print("-" * 60)
    
    for skill_idx, skill in enumerate(SKILLS_LIST):
        skill_true = y_test_skills[:, skill_idx]
        skill_pred = y_pred[:, skill_idx]
        
        skill_precision = precision_score(skill_true, skill_pred, zero_division=0)
        skill_recall = recall_score(skill_true, skill_pred, zero_division=0)
        skill_f1 = f1_score(skill_true, skill_pred, zero_division=0)
        
        print(f"{skill:<20} {skill_precision:<12.4f} {skill_recall:<12.4f} {skill_f1:<12.4f}")
    
    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1
    }


def evaluate_resume_matching_model(test_df):
    """
    Evaluate resume matching model with similarity metrics.
    """
    print("\n" + "="*70)
    print("EVALUATION: Resume–Job Matching Model")
    print("="*70)
    
    # Load vectorizer
    vectorizer_path = os.path.join(MODELS_DIR, 'tfidf_vectorizer.pkl')
    vectorizer = joblib.load(vectorizer_path)
    print(f"[OK] Loaded vectorizer from {vectorizer_path}")
    
    # Create synthetic test pairs
    def create_resume_text(row):
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
    
    test_resumes = test_df.apply(create_resume_text, axis=1).tolist()
    test_jobs = test_df['target_role'].apply(create_job_description).tolist()
    
    # Calculate similarities
    similarities = []
    for resume, job in zip(test_resumes, test_jobs):
        resume_vec = vectorizer.transform([resume])
        job_vec = vectorizer.transform([job])
        sim = cosine_similarity(resume_vec, job_vec)[0][0]
        similarities.append(sim)
    
    similarities = np.array(similarities)
    
    print("\nSimilarity Statistics:")
    print(f"  Mean similarity:    {np.mean(similarities):.4f} ({np.mean(similarities)*100:.2f}%)")
    print(f"  Median similarity:  {np.median(similarities):.4f} ({np.median(similarities)*100:.2f}%)")
    print(f"  Min similarity:     {np.min(similarities):.4f} ({np.min(similarities)*100:.2f}%)")
    print(f"  Max similarity:     {np.max(similarities):.4f} ({np.max(similarities)*100:.2f}%)")
    print(f"  Std deviation:      {np.std(similarities):.4f}")
    
    # Match quality distribution
    print("\nMatch Quality Distribution:")
    print(f"  Excellent matches (≥0.8): {(similarities >= 0.8).sum()} ({(similarities >= 0.8).mean()*100:.2f}%)")
    print(f"  Good matches (0.6-0.8):   {((similarities >= 0.6) & (similarities < 0.8)).sum()} ({((similarities >= 0.6) & (similarities < 0.8)).mean()*100:.2f}%)")
    print(f"  Fair matches (0.4-0.6):   {((similarities >= 0.4) & (similarities < 0.6)).sum()} ({((similarities >= 0.4) & (similarities < 0.6)).mean()*100:.2f}%)")
    print(f"  Poor matches (<0.4):      {(similarities < 0.4).sum()} ({(similarities < 0.4).mean()*100:.2f}%)")
    
    # Example match extraction
    print("\nExample: Top 5 Best Matches:")
    top_indices = np.argsort(similarities)[::-1][:5]
    for i, idx in enumerate(top_indices, 1):
        print(f"\n  Match {i} (Similarity: {similarities[idx]:.4f}):")
        print(f"    Resume: {test_resumes[idx][:100]}...")
        print(f"    Job: {test_jobs[idx][:100]}...")
    
    return {
        'mean_similarity': np.mean(similarities),
        'median_similarity': np.median(similarities),
        'similarities': similarities
    }


def main():
    """Main evaluation pipeline."""
    print("="*70)
    print("COMPREHENSIVE MODEL EVALUATION")
    print("="*70)
    
    # Load preprocessed data
    script_dir = os.path.dirname(os.path.abspath(__file__))
    train_path = os.path.join(script_dir, 'data', 'career_train.csv')
    test_path = os.path.join(script_dir, 'data', 'career_test.csv')
    
    from preprocessing import load_and_preprocess_data
    X_train, X_test, y_train, y_test, preprocessor = load_and_preprocess_data(
        train_path, test_path
    )
    
    # Load test dataframe
    test_df = pd.read_csv(test_path)
    
    # Evaluate all models
    career_results = evaluate_career_model(X_test, y_test, preprocessor.target_encoder)
    skill_results = evaluate_skill_gap_model(X_test, y_test, preprocessor.target_encoder, preprocessor)
    resume_results = evaluate_resume_matching_model(test_df)
    
    # Summary
    print("\n" + "="*70)
    print("EVALUATION SUMMARY")
    print("="*70)
    print("\nCareer Prediction Model:")
    print(f"  Accuracy: {career_results['accuracy']:.4f}")
    print(f"  F1-Score: {career_results['f1_score']:.4f}")
    
    print("\nSkill Gap Model:")
    print(f"  Accuracy: {skill_results['accuracy']:.4f}")
    print(f"  F1-Score: {skill_results['f1_score']:.4f}")
    
    print("\nResume Matching Model:")
    print(f"  Mean Similarity: {resume_results['mean_similarity']:.4f}")
    print(f"  Median Similarity: {resume_results['median_similarity']:.4f}")
    
    print("\n" + "="*70)
    print("Evaluation complete!")
    print("="*70)


if __name__ == '__main__':
    main()
