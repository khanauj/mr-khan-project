"""
Dataset Generation Script
Generates synthetic career prediction datasets for academic/portfolio purposes.
"""

import pandas as pd
import numpy as np
import random
import os
from typing import List, Tuple

# Set seed for reproducibility
np.random.seed(42)
random.seed(42)

# Constants
EDUCATIONS = ['BCA', 'BBA', 'BA', 'BSc', 'BCom', 'MBA']
SKILLS_LIST = ['Python', 'SQL', 'Excel', 'Power BI', 'JavaScript', 'HTML', 'CSS', 
               'Communication', 'Statistics', 'ML']
INTERESTS = ['Data', 'Web', 'Business', 'AI', 'Teaching', 'Sales']
TARGET_ROLES = ['Data Analyst', 'Business Analyst', 'Frontend Developer',
                'Backend Developer', 'ML Engineer', 'QA Tester', 'Product Manager']


def determine_target_role(education: str, skills: List[str], interest: str, 
                          experience_years: int) -> str:
    """
    Determine target role based on logical rules for synthetic data generation.
    This ensures data consistency while maintaining realistic patterns.
    """
    skill_set = set(skill.strip() for skill in skills)
    
    # Data Analyst: Data interest + Data skills
    if interest == 'Data':
        if 'Python' in skill_set and 'SQL' in skill_set:
            if 'Statistics' in skill_set or 'ML' in skill_set:
                if experience_years >= 2:
                    return 'Data Analyst'
            return 'Data Analyst'
        if 'Excel' in skill_set and 'SQL' in skill_set:
            return 'Data Analyst'
    
    # ML Engineer: AI interest + ML skills
    if interest == 'AI':
        if 'Python' in skill_set and 'ML' in skill_set:
            if 'Statistics' in skill_set or experience_years >= 2:
                return 'ML Engineer'
        if 'Python' in skill_set and 'Statistics' in skill_set:
            return 'ML Engineer'
    
    # Frontend Developer: Web interest + Frontend skills
    if interest == 'Web':
        if 'HTML' in skill_set and 'CSS' in skill_set:
            if 'JavaScript' in skill_set:
                return 'Frontend Developer'
            return 'Frontend Developer'
    
    # Backend Developer: Web interest + Backend skills
    if interest == 'Web':
        if 'Python' in skill_set or 'JavaScript' in skill_set:
            if 'SQL' in skill_set and experience_years >= 1:
                return 'Backend Developer'
    
    # Business Analyst: Business interest + Business skills
    if interest == 'Business':
        if education in ['BBA', 'MBA', 'BCom']:
            if 'Excel' in skill_set and 'Communication' in skill_set:
                if 'Power BI' in skill_set or 'Statistics' in skill_set:
                    return 'Business Analyst'
            if 'SQL' in skill_set and 'Excel' in skill_set:
                return 'Business Analyst'
    
    # Product Manager: Business interest + Mixed skills + Experience
    if interest == 'Business':
        if education == 'MBA' and experience_years >= 2:
            if 'Communication' in skill_set and len(skill_set) >= 3:
                return 'Product Manager'
    
    # QA Tester: Any background with technical skills but less experience
    if experience_years <= 2:
        if 'JavaScript' in skill_set or 'Python' in skill_set:
            if random.random() < 0.3:  # 30% chance
                return 'QA Tester'
    
    # Default assignments based on primary indicators
    if interest == 'Data':
        return 'Data Analyst' if 'SQL' in skill_set else 'Business Analyst'
    elif interest == 'Web':
        return 'Frontend Developer' if 'HTML' in skill_set else 'Backend Developer'
    elif interest == 'AI':
        return 'ML Engineer' if 'Python' in skill_set else 'Data Analyst'
    elif interest == 'Business':
        return 'Business Analyst' if education in ['BBA', 'MBA'] else 'Product Manager'
    elif interest == 'Teaching':
        return 'Product Manager' if experience_years >= 3 else 'Business Analyst'
    else:  # Sales
        return 'Product Manager' if experience_years >= 2 else 'Business Analyst'


def generate_skills(interest: str, education: str, target_role: str = None) -> List[str]:
    """Generate realistic skill combinations based on interest and education."""
    skills = []
    
    # Base skills based on interest
    if interest == 'Data':
        skills.extend(['SQL', 'Excel'])
        if random.random() < 0.7:
            skills.append('Python')
        if random.random() < 0.5:
            skills.append('Statistics')
        if random.random() < 0.4:
            skills.append('Power BI')
    elif interest == 'Web':
        if random.random() < 0.8:
            skills.extend(['HTML', 'CSS'])
        if random.random() < 0.7:
            skills.append('JavaScript')
        if random.random() < 0.4:
            skills.append('Python')
    elif interest == 'AI':
        skills.append('Python')
        if random.random() < 0.8:
            skills.append('ML')
        if random.random() < 0.6:
            skills.append('Statistics')
        if random.random() < 0.5:
            skills.append('SQL')
    elif interest == 'Business':
        skills.extend(['Excel', 'Communication'])
        if random.random() < 0.6:
            skills.append('SQL')
        if random.random() < 0.5:
            skills.append('Power BI')
        if random.random() < 0.4:
            skills.append('Statistics')
    elif interest == 'Teaching':
        skills.append('Communication')
        if random.random() < 0.6:
            skills.extend(['Excel', 'Statistics'])
    else:  # Sales
        skills.append('Communication')
        if random.random() < 0.7:
            skills.append('Excel')
    
    # Add communication skill with probability for most roles
    if interest != 'Teaching' and interest != 'Sales':
        if random.random() < 0.6:
            skills.append('Communication')
    else:
        skills.append('Communication')
    
    # Ensure at least 2 skills
    while len(skills) < 2:
        skills.append(random.choice(SKILLS_LIST))
    
    # Remove duplicates while preserving order
    seen = set()
    unique_skills = [x for x in skills if not (x in seen or seen.add(x))]
    
    return unique_skills[:6]  # Limit to 6 skills max


def generate_row() -> Tuple[str, str, str, int, str]:
    """Generate a single row of synthetic data."""
    education = random.choice(EDUCATIONS)
    interest = random.choice(INTERESTS)
    experience_years = np.random.randint(0, 6)
    
    # First generate skills based on interest
    skills = generate_skills(interest, education)
    skills_str = ', '.join(skills)
    
    # Then determine target role based on all features
    target_role = determine_target_role(education, skills, interest, experience_years)
    
    return education, skills_str, interest, experience_years, target_role


def generate_dataset(n_samples: int = 1000) -> pd.DataFrame:
    """Generate a complete synthetic dataset."""
    data = []
    
    for _ in range(n_samples):
        row = generate_row()
        data.append(row)
    
    df = pd.DataFrame(data, columns=['education', 'skills', 'interest', 
                                     'experience_years', 'target_role'])
    return df


def main():
    """Generate train and test datasets."""
    print("Generating synthetic career prediction dataset...")
    print("Note: This data is synthetic and generated for academic/portfolio purposes.\n")
    
    # Get the script directory and create output paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    train_path = os.path.join(script_dir, 'career_train.csv')
    test_path = os.path.join(script_dir, 'career_test.csv')
    
    # Generate training set
    print("Generating training set (1000 samples)...")
    train_df = generate_dataset(1000)
    train_df.to_csv(train_path, index=False)
    print(f"[OK] Training set saved: {len(train_df)} samples")
    print(f"  Role distribution:\n{train_df['target_role'].value_counts()}\n")
    
    # Generate test set
    print("Generating test set (1000 samples)...")
    test_df = generate_dataset(1000)
    test_df.to_csv(test_path, index=False)
    print(f"[OK] Test set saved: {len(test_df)} samples")
    print(f"  Role distribution:\n{test_df['target_role'].value_counts()}\n")
    
    print("Dataset generation complete!")
    print("\nData preview (first 5 rows):")
    print(train_df.head())


if __name__ == '__main__':
    main()
