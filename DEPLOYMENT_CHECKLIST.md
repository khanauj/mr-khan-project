# ✅ Deployment Checklist

## Pre-Deployment Setup

- [ ] Read `QUICK_START_DEPLOY.md`
- [ ] Create GitHub account (github.com)
- [ ] Create Vercel account (vercel.com)
- [ ] Create Railway account (railway.app)
- [ ] Have your Gemini API key ready

## Local Preparation

- [ ] Navigate to project folder
- [ ] Run `git init`
- [ ] Run `git add .`
- [ ] Run `git commit -m "Prepare for deployment"`

## GitHub Setup

- [ ] Create new repository on GitHub
- [ ] Copy repository URL
- [ ] Run `git remote add origin [URL]`
- [ ] Run `git push -u origin main`
- [ ] Verify files appear on GitHub

## Backend Deployment (Railway)

- [ ] Go to railway.app
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Authorize GitHub access
- [ ] Select your repository
- [ ] Set Root Directory to `ml`
- [ ] Add environment variable `GEMINI_API_KEY`
- [ ] Wait for deployment to complete
- [ ] Copy the Railway-provided domain URL
- [ ] Test backend is working:
  - [ ] Visit `https://your-railway-url/docs` (should show Swagger UI)

## Frontend Deployment (Vercel)

- [ ] Go to vercel.com
- [ ] Click "Add New..." → "Project"
- [ ] Select "Continue with GitHub"
- [ ] Authorize if needed
- [ ] Select your repository
- [ ] Verify settings:
  - [ ] Framework: Vite
  - [ ] Root Directory: `./frontend`
  - [ ] Build Command: `npm run build`
- [ ] Add Environment Variables:
  - [ ] Key: `VITE_API_URL`
  - [ ] Value: `https://your-railway-url` (from backend)
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Copy the Vercel domain URL

## Post-Deployment Verification

- [ ] Visit your Vercel URL in browser
- [ ] Check frontend loads without errors
- [ ] Open browser console (F12) - no major errors
- [ ] Test API calls work:
  - [ ] Try a career prediction
  - [ ] Try skill gap analysis
  - [ ] Check API responses in Network tab

## Production Monitoring

- [ ] Check Railway logs for errors
- [ ] Check Vercel analytics
- [ ] Monitor for crashes/errors
- [ ] Set up error notifications (optional)

## Optional Enhancements

- [ ] Add custom domain to Vercel
- [ ] Add custom domain to Railway
- [ ] Set up SSL/TLS (automatic on both platforms)
- [ ] Configure backups for data
- [ ] Set up monitoring alerts
- [ ] Enable GitHub integration for auto-deploy

## Documentation & Maintenance

- [ ] Document the deployment process
- [ ] Save environment variable values securely
- [ ] Create deployment runbook
- [ ] Plan backup strategy
- [ ] Set up monitoring dashboard

---

## 🎉 Success Indicators

✅ Frontend loads at `https://your-vercel-domain.vercel.app`
✅ Backend API accessible at `https://your-railway-domain`
✅ API Documentation visible at `https://your-railway-domain/docs`
✅ Frontend can make API calls to backend
✅ No CORS errors in console
✅ All ML models load correctly
✅ Gemini API key works

---

## 📋 Deployment Summary

```
Started: [Date & Time]
Completed: [Date & Time]
Frontend URL: https://___________________
Backend URL: https://___________________
Status: ☐ Active ☐ Testing ☐ Waiting
Notes:
```

---

## 🆘 Common Issues & Solutions

### Issue: CORS Error
**Solution**: Check CORS is enabled in api.py

### Issue: API 404 Not Found
**Solution**: Verify VITE_API_URL in Vercel environment variables

### Issue: "Module not found" on Railway
**Solution**: Ensure all dependencies are in ml/requirements.txt

### Issue: Frontend won't load
**Solution**: Check build logs in Vercel dashboard

### Issue: API calls timeout
**Solution**: Check Railway instance is running and has resources

---

## 📞 Support Contacts

- Vercel Support: https://vercel.com/support
- Railway Support: https://railway.app/support
- GitHub Help: https://docs.github.com

---

**Last Updated**: February 2026
**Deployment Status**: ☐ Not Started ☐ In Progress ☐ Complete
