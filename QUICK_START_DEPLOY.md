# 🚀 DEPLOYMENT QUICK REFERENCE

## Commands to Run

### 1️⃣ Prepare Project (Local)
```powershell
# Navigate to project
cd "c:\Users\khana\OneDrive\Desktop\mr khan project"

# Initialize Git (if not done)
git init

# Add and commit
git add .
git commit -m "Initial deployment setup"

# Create remote and push
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mr-khan-project.git
git push -u origin main
```

### 2️⃣ Deploy Backend (Railway)

**3 minutes to deploy:**

1. Visit: https://railway.app
2. Sign in with GitHub
3. New Project → Deploy from GitHub repo
4. Select your repository
5. In Railway dashboard:
   - Root Directory: `ml`
   - Environment: Production
   - Add variables:
     - `GEMINI_API_KEY` = `AIzaSyBi8LFYSO2uncFZIJpE4hHcXES66FhTBvg`
6. Copy the deployed URL (Example: `mr-khan-api-prod.railway.app`)

### 3️⃣ Deploy Frontend (Vercel)

**3 minutes to deploy:**

1. Visit: https://vercel.com
2. Sign in with GitHub
3. Add New Project
4. Import your GitHub repository
5. Configure:
   - Framework: `Vite`
   - Root Directory: `./frontend`
   - Build Command: `npm run build`
   - Environment Variables:
     - `VITE_API_URL` = `https://mr-khan-api-prod.railway.app`
6. Click Deploy!

---

## ✅ Deployment Checklist

- [ ] GitHub account set up
- [ ] Project pushed to GitHub
- [ ] Vercel account created
- [ ] Railway account created
- [ ] Backend deployed on Railway
- [ ] Backend URL copied
- [ ] Frontend deployed on Vercel
- [ ] Frontend environment variables updated with backend URL
- [ ] Frontend redeployed after env var update
- [ ] Test: Frontend loads at your Vercel domain
- [ ] Test: API calls work from frontend

---

## 🔗 Live URLs After Deployment

```
Frontend: https://your-project-name.vercel.app
Backend:  https://your-project-name.railway.app
```

---

## 📊 Project Architecture

```
┌─────────────────────────────────────────┐
│         Users & Browsers                │
│      (Visit Vercel Domain)              │
└────────────────┬────────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │   Frontend     │
        │  (React/Vite)  │
        │    Vercel      │
        └────────┬───────┘
                 │
    ┌────────────┴──────────────┐
    │                           │
    │ API Requests              │
    │ VITE_API_URL              │
    │                           │
    ▼                           │
┌────────────────────┐          │
│   Backend          │◄─────────┘
│   (FastAPI)        │
│   Railway          │
│   Port 8000        │
└────────┬───────────┘
         │
         ▼
    ┌─────────────┐
    │  ML Models  │
    │   Gemini    │
    │   API       │
    └─────────────┘
```

---

## 🆘 Troubleshooting

### "Connection Refused" Error
- Check backend URL in Vercel env var
- Ensure Railway deployment is complete
- Check CORS is enabled in api.py

### "Cannot find module" Error
- Run `npm install` in frontend folder
- Check requirements.txt is in ml folder
- Verify Python version compatibility

### Build Fails on Vercel
- Check Node.js version (need 18+)
- Verify dist folder is in output directory
- Check vite.config.js syntax

### Build Fails on Railway
- Ensure requirements.txt exists in ml folder
- Check Python version (3.8+)
- Verify GEMINI_API_KEY is set

---

## 📞 Support Resources

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- FastAPI Docs: https://fastapi.tiangolo.com
- Vite Docs: https://vitejs.dev

---

## 🎯 Next Steps After Deployment

1. ✅ Share your live URL with users
2. ✅ Monitor logs in Railway dashboard
3. ✅ Monitor errors in Vercel dashboard
4. ✅ Set up continuous deployment
5. ✅ Add custom domain (optional)
6. ✅ Set up analytics

---

**Your project is ready to go live! 🎉**
