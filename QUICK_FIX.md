# Quick Fix Instructions

## ✅ API Key Configured

Your Gemini API key has been added to the code:
- **Key**: `AIzaSyBi8LFYSO2uncFZIJpE4hHcXES66FhTBvg`
- **Location**: `ml/api.py` (line 126)

## 🚀 How to Start Backend

**Option 1: Use the batch file** (easiest)
```cmd
cd ml
start_backend.bat
```

**Option 2: Manual start**
```powershell
cd ml
$env:GEMINI_API_KEY="AIzaSyBi8LFYSO2uncFZIJpE4hHcXES66FhTBvg"
python api.py
```

**Option 3: Using uvicorn** (recommended for development)
```powershell
cd ml
$env:GEMINI_API_KEY="AIzaSyBi8LFYSO2uncFZIJpE4hHcXES66FhTBvg"
python -m uvicorn api:app --host 127.0.0.1 --port 8000 --reload
```

## ⚠️ Important Notes

### 1. Quota Issue
Your API key hit the rate limit. This means:
- ✅ API key is valid
- ⚠️ You've reached free tier quota
- 💡 Wait 60 seconds between requests
- 💡 Or upgrade your plan for higher limits

### 2. Model Used
Currently using: `gemini-flash-lite-latest` (free tier, higher quota)

### 3. Endpoints
- `/api/chat` - AI chatbot
- `/api/roadmap-search` - Dynamic roadmap generation

Both endpoints are registered and ready to use!

## 🔍 Verify It's Working

1. **Check backend is running:**
   ```powershell
   curl http://localhost:8000/health
   ```

2. **Check endpoints:**
   - Visit: http://localhost:8000/docs
   - You should see `/api/chat` and `/api/roadmap-search` in the list

3. **Test chat (after quota resets):**
   ```powershell
   curl -X POST http://localhost:8000/api/chat `
     -H "Content-Type: application/json" `
     -d '{\"message\":\"Hello\",\"conversation_history\":[]}'
   ```

## 🐛 Troubleshooting

### If you see "404 Not Found":
1. Make sure backend is restarted after code changes
2. Kill all Python processes and restart
3. Check `http://localhost:8000/docs` to see registered endpoints

### If you see "429 Quota Exceeded":
1. Wait 60 seconds and try again
2. This is normal for free tier
3. Consider upgrading your plan

### If endpoints don't appear:
1. Check backend terminal for errors
2. Verify API key is set
3. Make sure `google-generativeai` is installed: `pip install google-generativeai`

---

**Everything is configured! Just restart the backend and wait for quota to reset!** 🎉
