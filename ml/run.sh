#!/bin/bash
# Production startup script for Railway/Cloud deployment
# This ensures proper initialization and startup

echo "Starting AI Career Advisor API (Production)"
echo "============================================"

# Check if required files exist
if [ ! -f "api.py" ]; then
    echo "ERROR: api.py not found in current directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "venv" ] && [ ! -d ".venv" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Start the application
echo "Launching Uvicorn server..."
echo "API will be available at http://0.0.0.0:${PORT:-8000}"

exec uvicorn api:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2
