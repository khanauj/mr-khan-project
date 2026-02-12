@echo off
echo ========================================
echo Starting AI Career Advisor Backend
echo ========================================
echo.

REM Change to script directory (handles paths with spaces)
cd /d "%~dp0"
echo Current directory: %CD%
echo.

REM Check if port 8000 is in use
netstat -ano | findstr ":8000" >nul 2>&1
if %errorlevel% == 0 (
    echo WARNING: Port 8000 appears to be in use!
    echo Trying to kill processes using port 8000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo.
)

echo Starting backend server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

REM Set Gemini API Key
set GEMINI_API_KEY=AIzaSyBi8LFYSO2uncFZIJpE4hHcXES66FhTBvg
echo [OK] Gemini API key configured

python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000
pause
