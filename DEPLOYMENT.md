# Deployment Guide

This guide will help you deploy your AI Career Advisor project to Vercel (frontend) and Railway (backend).

## Prerequisites

- GitHub account
- Vercel account (free at vercel.com)
- Railway account (free at railway.app)
- Gemini API key

## Part 1: Deploy Frontend to Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mr-khan-project.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Select your repository
5. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variables
In Vercel dashboard, go to Settings → Environment Variables:
- **Key**: `VITE_API_URL`
- **Value**: `https://your-railway-backend-url.com` (add this after deploying backend)

### Step 4: Deploy
Click "Deploy" - Vercel will automatically deploy every push to main

---

## Part 2: Deploy Backend to Railway

### Step 1: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account
5. Select your repository

### Step 2: Configure Railway Service
1. Click "Add Service" → "GitHub repo"
2. Configure:
   - **Root Directory**: `ml`
   - **Environment**: Production
   - **Build Command**: Leave empty (Railway auto-detects Python)
   - **Start Command**: `uvicorn api:app --host 0.0.0.0 --port $PORT`

### Step 3: Add Environment Variables
In Railway dashboard, go to Variables tab:
- **GEMINI_API_KEY**: `AIzaSyBi8LFYSO2uncFZIJpE4hHcXES66FhTBvg`
- **PORT**: `8000`

### Step 4: Get Backend URL
After deployment:
1. Go to Settings → Domains
2. Copy the Railway-provided domain (e.g., `mr-khan-api.railway.app`)
3. Update the `VITE_API_URL` environment variable in Vercel

---

## Part 3: Connect Frontend to Backend

### Update Environment Variables
After getting your Railway backend URL, update in Vercel:

**Vercel Dashboard → Settings → Environment Variables**
```
VITE_API_URL = https://mr-khan-api.railway.app
```

Your frontend will automatically redeploy and connect to the backend.

---

## Manual Local Deployment (Alternative)

### Deploy Backend to Heroku/Render
If you prefer an alternative to Railway:

**Option A: Heroku**
```bash
heroku login
heroku create your-app-name
heroku config:set GEMINI_API_KEY="your-key"
git push heroku main
```

**Option B: Render**
1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Configure:
   - Root Directory: `ml`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn api:app --host 0.0.0.0 --port 8000`

---

## Troubleshooting

### Backend not connecting
- Check CORS is enabled in `api.py`
- Verify `VITE_API_URL` matches your backend domain
- Check Railway/Render logs for startup errors

### API errors
- Ensure GEMINI_API_KEY is set correctly
- Check that required Python packages are in `requirements.txt`
- Review Railway/Render build logs

### Frontend build fails
- Ensure Node version is 18+
- Check `npm install` completes without errors
- Verify `dist/` directory is created

---

## Files Created for Deployment

- `ml/requirements.txt` - Python dependencies
- `frontend/vercel.json` - Vercel configuration
- `frontend/.env` - Environment variables (local)
- `frontend/.env.example` - Example env file
- `.github/workflows/deploy.yml` - CI/CD automation (optional)

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Deploy backend to Railway
3. ✅ Deploy frontend to Vercel
4. ✅ Update environment variables
5. ✅ Test the connection

Your project will be live at `https://your-vercel-domain.vercel.app`
