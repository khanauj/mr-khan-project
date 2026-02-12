"""
Complete Pipeline Runner
Runs the entire ML pipeline: dataset generation -> preprocessing -> training -> evaluation
"""

import os
import sys
import subprocess

def run_command(command, description, cwd=None):
    """Run a command and handle errors."""
    print(f"\n{'='*70}")
    print(f"STEP: {description}")
    print('='*70)
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=False, text=True, cwd=cwd)
        print(f"\n[OK] {description} completed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n[ERROR] {description} failed with exit code {e.returncode}")
        return False
    except Exception as e:
        print(f"\n[ERROR] {description} failed: {str(e)}")
        return False

def main():
    """Run the complete ML pipeline."""
    print("="*70)
    print("AI-POWERED CAREER & SKILLS ADVISOR - COMPLETE PIPELINE")
    print("="*70)
    
    # Ensure we're in the project root
    project_root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_root)
    
    # Paths
    ml_dir = os.path.join(project_root, 'ml')
    data_dir = os.path.join(ml_dir, 'data')
    
    steps = [
        # Step 1: Generate datasets
        (
            f'python "{os.path.join(data_dir, "generate_dataset.py")}"',
            'Dataset Generation',
            data_dir
        ),
        # Step 2: Train models (this includes preprocessing)
        (
            f'python "{os.path.join(ml_dir, "train_models.py")}"',
            'Model Training',
            ml_dir
        ),
        # Step 3: Evaluate models (optional)
        (
            f'python "{os.path.join(ml_dir, "evaluate.py")}"',
            'Model Evaluation',
            ml_dir
        ),
    ]
    
    print("\nThis pipeline will:")
    print("1. Generate synthetic datasets (train & test)")
    print("2. Train all 3 ML models")
    print("3. Evaluate model performance")
    print("\nStarting pipeline...\n")
    
    success = True
    for command, description, cwd in steps:
        if not run_command(command, description, cwd):
            success = False
            print(f"\n[WARNING] Pipeline stopped at: {description}")
            print("You can continue manually or fix the issue and rerun.")
            break
    
    if success:
        print("\n" + "="*70)
        print("PIPELINE COMPLETED SUCCESSFULLY!")
        print("="*70)
        print("\nNext steps:")
        print("1. Start the API server: cd ml && python api.py")
        print("2. Or use uvicorn: uvicorn ml.api:app --reload")
        print("3. Access API docs at: http://localhost:8000/docs")
    else:
        print("\n" + "="*70)
        print("PIPELINE COMPLETED WITH ERRORS")
        print("="*70)
        print("\nPlease check the error messages above and fix any issues.")
        sys.exit(1)

if __name__ == '__main__':
    main()
