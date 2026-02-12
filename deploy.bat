@echo off
REM Quick Deploy Script for AI Career Advisor (Windows)
REM This script prepares your project for deployment

echo ========================================
echo AI Career Advisor - Quick Deploy Setup
echo ========================================
echo.

REM Check if node_modules exists
if exist "frontend\node_modules" (
    echo [OK] Node modules already installed
) else (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed
        pause
        exit /b 1
    )
    cd ..
)

REM Build frontend
echo.
echo Building frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: npm run build failed
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo Pre-deployment Checklist
echo ========================================
echo.
echo Before deploying, ensure:
echo.
echo Frontend (Vercel):
echo   [ ] GitHub repository created and pushed
echo   [ ] Vercel project linked
echo   [ ] Root Directory set to './frontend'
echo   [ ] Build command: 'npm run build'
echo.
echo Backend (Railway):
echo   [ ] Railway project created
echo   [ ] Root Directory set to 'ml'
echo   [ ] Start command: 'uvicorn api:app --host 0.0.0.0 --port $PORT'
echo   [ ] GEMINI_API_KEY environment variable added
echo.
echo Environment Variables:
echo   [ ] VITE_API_URL set in Vercel (after Railway URL is available)
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Commit your code:
echo    git add .
echo    git commit -m "Prepare for deployment"
echo.
echo 2. Deploy Backend to Railway:
echo    Visit: https://railway.app
echo    Select your GitHub repo and configure the 'ml' folder
echo.
echo 3. Deploy Frontend to Vercel:
echo    Visit: https://vercel.com
echo    Select your GitHub repo and configure the 'frontend' folder
echo.
echo 4. Update Vercel environment variables with Railway URL
echo.
echo For detailed instructions, see DEPLOYMENT.md
echo.
pause
