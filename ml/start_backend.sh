#!/bin/bash
echo "========================================"
echo "Starting AI Career Advisor Backend"
echo "========================================"
echo ""
cd "$(dirname "$0")"
echo "Current directory: $(pwd)"
echo ""
echo "Starting backend server on http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""
python -m uvicorn api:app --reload --host 0.0.0.0 --port 8000
