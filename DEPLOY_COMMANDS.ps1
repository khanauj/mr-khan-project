#!/usr/bin/env pwsh
# AI Career Advisor - Deployment Commands
# Copy and paste these commands in order

# ============================================
# STEP 1: PREPARE & PUSH TO GITHUB (2 minutes)
# ============================================

# Navigate to project
cd "c:\Users\khana\OneDrive\Desktop\mr khan project"

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for production deployment: Vercel + Railway"

# Rename branch to main
git branch -M main

# Add remote (REPLACE YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/mr-khan-project.git

# Push to GitHub
git push -u origin main

# ============================================
# STEP 2: DEPLOY BACKEND TO RAILWAY (5 minutes)
# ============================================

<#
MANUAL STEPS (Cannot automate):
1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Select your repository: YOUR_USERNAME/mr-khan-project
6. In Railway dashboard:
   - Set Root Directory: ml
   - Click "Add Variable"
   - Key: GEMINI_API_KEY
   - Value: AIzaSyBi8LFYSO2uncFZIJpE4hHcXES66FhTBvg
   - Click Deploy
7. Wait for build to complete
8. Go to Settings > Domains
9. Copy the generated domain (e.g., mr-khan-api.railway.app)
10. Keep this URL for next step
#>

# ============================================
# STEP 3: DEPLOY FRONTEND TO VERCEL (5 minutes)
# ============================================

<#
MANUAL STEPS (Cannot automate):
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Select "Import Git Repository"
5. Select your repository: YOUR_USERNAME/mr-khan-project
6. Configure project:
   - Framework Preset: Vite
   - Root Directory: ./frontend
   - Build Command: npm run build
   - Output Directory: dist
7. Click "Environment Variables"
8. Add variable:
   - Name: VITE_API_URL
   - Value: https://YOUR_RAILWAY_DOMAIN (from step 2)
9. Click "Deploy"
10. Wait for deployment to complete
11. Copy the Vercel URL (e.g., mr-khan-project.vercel.app)
#>

# ============================================
# STEP 4: TEST YOUR DEPLOYMENT (3 minutes)
# ============================================

<#
TESTING STEPS:
1. Open your Vercel URL in a browser
2. Check if the app loads without errors
3. Open browser console (F12) - should have no major errors
4. Test a feature (e.g., career prediction)
5. In Network tab, verify API calls go to Railway domain
6. Check that response returns data
7. Verify UI displays results correctly

If all tests pass: 🎉 YOU'RE LIVE!
#>

# ============================================
# REFERENCE: ENVIRONMENT VARIABLES
# ============================================

# Frontend (Vercel)
# VITE_API_URL = https://your-railway-domain.railway.app

# Backend (Railway)  
# GEMINI_API_KEY = AIzaSyBi8LFYSO2uncFZIJpE4hHcXES66FhTBvg

# ============================================
# REFERENCE: GIT COMMANDS
# ============================================

# View git status
git status

# View git log
git log

# View git branches
git branch -a

# View git remote
git remote -v

# Make updates and push
# 1. Make changes to files
# 2. git add .
# 3. git commit -m "Your message"
# 4. git push origin main

# ============================================
# REFERENCE: LOCAL DEVELOPMENT
# ============================================

# Start frontend locally
cd frontend
npm install
npm run dev

# Start backend locally  
cd ml
pip install -r requirements.txt
python -m uvicorn api:app --reload

# ============================================
# REFERENCE: TROUBLESHOOTING
# ============================================

# Check if port is in use (Windows)
netstat -ano | findstr ":8000"

# Check if port is in use (Mac/Linux)
lsof -i :8000

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -r node_modules
npm install

# ============================================
# QUICK LINKS
# ============================================

# GitHub: https://github.com/YOUR_USERNAME/mr-khan-project
# Vercel Dashboard: https://vercel.com/dashboard
# Railway Dashboard: https://railway.app/dashboard
# Frontend URL: https://your-project.vercel.app
# Backend URL: https://your-project.railway.app
# API Docs: https://your-project.railway.app/docs

# ============================================
# SUCCESS CRITERIA
# ============================================

<#
✅ Frontend loads at Vercel URL
✅ Backend API responds at Railway URL
✅ Swagger UI visible at Railway URL/docs
✅ API calls from frontend to backend work
✅ No CORS errors in browser console
✅ Features (predictions, analysis) work end-to-end
✅ Pages load without JavaScript errors
#>
