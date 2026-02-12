"""
Feature Engineering and Preprocessing Module
Handles encoding, normalization, and feature transformation for ML models.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os

# Constants
SKILLS_LIST = ['Python', 'SQL', 'Excel', 'Power BI', 'JavaScript', 'HTML', 'CSS', 
               'Communication', 'Statistics', 'ML']
FEATURE_DIR = 'ml/models'
os.makedirs(FEATURE_DIR, exist_ok=True)


class FeaturePreprocessor:
    """Handles all feature engineering and preprocessing operations."""
    
    def __init__(self):
        self.education_encoder = LabelEncoder()
        self.interest_encoder = LabelEncoder()
        self.experience_scaler = StandardScaler()
        self.is_fitted = False
        
    def encode_education(self, education_series: pd.Series, fit: bool = False) -> np.ndarray:
        """
        Encode education using Label Encoding.
        
        Args:
            education_series: Series of education values
            fit: Whether to fit the encoder (use True for training data)
            
        Returns:
            Encoded education values as numpy array
        """
        if fit:
            return self.education_encoder.fit_transform(education_series)
        else:
            return self.education_encoder.transform(education_series)
    
    def encode_interest(self, interest_series: pd.Series, fit: bool = False) -> np.ndarray:
        """
        Encode interest using Label Encoding.
        
        Args:
            interest_series: Series of interest values
            fit: Whether to fit the encoder (use True for training data)
            
        Returns:
            Encoded interest values as numpy array
        """
        if fit:
            return self.interest_encoder.fit_transform(interest_series)
        else:
            return self.interest_encoder.transform(interest_series)
    
    def multi_hot_encode_skills(self, skills_series: pd.Series) -> pd.DataFrame:
        """
        Convert skills column into multi-hot encoded vector (binary column per skill).
        
        Args:
            skills_series: Series containing comma-separated skill strings
            
        Returns:
            DataFrame with binary columns for each skill
        """
        skills_matrix = []
        
        for skills_str in skills_series:
            # Parse comma-separated skills
            skills = [skill.strip() for skill in str(skills_str).split(',')]
            # Create binary vector
            skill_vector = [1 if skill in skills else 0 for skill in SKILLS_LIST]
            skills_matrix.append(skill_vector)
        
        skill_df = pd.DataFrame(skills_matrix, columns=[f'skill_{skill}' for skill in SKILLS_LIST])
        return skill_df
    
    def normalize_experience(self, experience_series: pd.Series, fit: bool = False) -> np.ndarray:
        """
        Normalize experience_years using StandardScaler.
        
        Args:
            experience_series: Series of experience years
            fit: Whether to fit the scaler (use True for training data)
            
        Returns:
            Normalized experience values as numpy array
        """
        experience_reshaped = experience_series.values.reshape(-1, 1)
        
        if fit:
            return self.experience_scaler.fit_transform(experience_reshaped).ravel()
        else:
            return self.experience_scaler.transform(experience_reshaped).ravel()
    
    def create_feature_matrix(self, df: pd.DataFrame, fit: bool = False) -> np.ndarray:
        """
        Create complete feature matrix from raw dataframe.
        
        Args:
            df: DataFrame with columns: education, skills, interest, experience_years
            fit: Whether to fit encoders/scalers (use True for training data)
            
        Returns:
            Complete feature matrix as numpy array
        """
        # Encode education
        education_encoded = self.encode_education(df['education'], fit=fit)
        
        # Encode interest
        interest_encoded = self.encode_interest(df['interest'], fit=fit)
        
        # Multi-hot encode skills
        skills_encoded = self.multi_hot_encode_skills(df['skills'])
        
        # Normalize experience
        experience_normalized = self.normalize_experience(df['experience_years'], fit=fit)
        
        # Combine all features
        feature_matrix = np.column_stack([
            education_encoded,
            interest_encoded,
            experience_normalized,
            skills_encoded.values
        ])
        
        if fit:
            self.is_fitted = True
        
        return feature_matrix
    
    def encode_target_labels(self, target_series: pd.Series, fit: bool = False) -> np.ndarray:
        """
        Encode target role labels using Label Encoding.
        
        Args:
            target_series: Series of target role values
            fit: Whether to fit the encoder (use True for training data)
            
        Returns:
            Encoded target labels as numpy array
        """
        if not hasattr(self, 'target_encoder'):
            self.target_encoder = LabelEncoder()
        
        if fit:
            return self.target_encoder.fit_transform(target_series)
        else:
            return self.target_encoder.transform(target_series)
    
    def save_encoders(self, save_dir: str = FEATURE_DIR):
        """Save all fitted encoders and scalers for later use."""
        if not self.is_fitted:
            raise ValueError("Preprocessor must be fitted before saving.")
        
        os.makedirs(save_dir, exist_ok=True)
        
        joblib.dump(self.education_encoder, os.path.join(save_dir, 'education_encoder.pkl'))
        joblib.dump(self.interest_encoder, os.path.join(save_dir, 'interest_encoder.pkl'))
        joblib.dump(self.experience_scaler, os.path.join(save_dir, 'experience_scaler.pkl'))
        if hasattr(self, 'target_encoder'):
            joblib.dump(self.target_encoder, os.path.join(save_dir, 'target_encoder.pkl'))
        
        print(f"[OK] Encoders and scalers saved to {save_dir}")
    
    @classmethod
    def load_encoders(cls, load_dir: str = FEATURE_DIR):
        """Load fitted encoders and scalers."""
        preprocessor = cls()
        
        preprocessor.education_encoder = joblib.load(os.path.join(load_dir, 'education_encoder.pkl'))
        preprocessor.interest_encoder = joblib.load(os.path.join(load_dir, 'interest_encoder.pkl'))
        preprocessor.experience_scaler = joblib.load(os.path.join(load_dir, 'experience_scaler.pkl'))
        preprocessor.target_encoder = joblib.load(os.path.join(load_dir, 'target_encoder.pkl'))
        preprocessor.is_fitted = True
        
        return preprocessor


def load_and_preprocess_data(train_path: str, test_path: str):
    """
    Load and preprocess training and test data.
    
    Args:
        train_path: Path to training CSV file
        test_path: Path to test CSV file
        
    Returns:
        Tuple of (X_train, X_test, y_train, y_test, preprocessor)
    """
    print("Loading datasets...")
    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)
    
    print(f"Training set: {len(train_df)} samples")
    print(f"Test set: {len(test_df)} samples")
    
    # Initialize preprocessor
    preprocessor = FeaturePreprocessor()
    
    # Create feature matrices
    print("\nCreating feature matrices...")
    X_train = preprocessor.create_feature_matrix(train_df, fit=True)
    X_test = preprocessor.create_feature_matrix(test_df, fit=False)
    
    # Encode target labels
    y_train = preprocessor.encode_target_labels(train_df['target_role'], fit=True)
    y_test = preprocessor.encode_target_labels(test_df['target_role'], fit=False)
    
    # Save encoders for later use
    preprocessor.save_encoders()
    
    print(f"[OK] Feature engineering complete!")
    print(f"  Training features shape: {X_train.shape}")
    print(f"  Test features shape: {X_test.shape}")
    print(f"  Number of features: {X_train.shape[1]}")
    
    return X_train, X_test, y_train, y_test, preprocessor


if __name__ == '__main__':
    # Test preprocessing pipeline
    script_dir = os.path.dirname(os.path.abspath(__file__))
    train_path = os.path.join(script_dir, 'data', 'career_train.csv')
    test_path = os.path.join(script_dir, 'data', 'career_test.csv')
    
    X_train, X_test, y_train, y_test, preprocessor = load_and_preprocess_data(
        train_path, test_path
    )
    
    print("\nSample feature vector:")
    print(X_train[0])
    print(f"\nCorresponding label: {preprocessor.target_encoder.inverse_transform([y_train[0]])[0]}")
