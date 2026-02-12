# Netlify Deployment Guide

## Deploy Frontend to Netlify

### Method 1: Drag & Drop (Easiest)
1. Run `npm run build` in the `frontend` folder
2. Drag the `frontend/dist` folder to [netlify.com](https://netlify.com)
3. Add environment variable in Netlify dashboard:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://1e4b4c48-3261-4462-ab28-b7768863179c.railway.app`

### Method 2: Git Integration (Recommended)
1. Push your code to GitHub (already done)
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub
5. Select repository: `khanauj/mr-khan-project`
6. Build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
7. Add environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://1e4b4c48-3261-4462-ab28-b7768863179c.railway.app`
8. Click "Deploy site"

### Your URLs
- **Backend**: https://1e4b4c48-3261-4462-ab28-b7768863179c.railway.app
- **Frontend**: Will be `https://your-site-name.netlify.app`
