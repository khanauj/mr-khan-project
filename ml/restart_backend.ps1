# Restart Backend with Gemini API Key
Write-Host "=== RESTARTING BACKEND ===" -ForegroundColor Green
Write-Host ""

# Kill all Python processes
Write-Host "Stopping all Python processes..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "[OK] All Python processes stopped" -ForegroundColor Green
Write-Host ""

# Set API Key
$env:GEMINI_API_KEY = "AIzaSyBi8LFYSO2uncFZIJpE4hHcXES66FhTBvg"
Write-Host "[OK] Gemini API key set" -ForegroundColor Green
Write-Host ""

# Change to ml directory
Set-Location -Path (Join-Path $PSScriptRoot ".")
Write-Host "Current directory: $PWD" -ForegroundColor Cyan
Write-Host ""

# Start backend
Write-Host "Starting backend server..." -ForegroundColor Yellow
Write-Host "API will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API docs at: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start uvicorn
python -m uvicorn api:app --host 127.0.0.1 --port 8000 --reload
