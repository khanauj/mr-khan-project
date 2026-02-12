# 🔄 RESTART BACKEND SERVER - CRITICAL!

## ❌ Problem
The backend server is running **OLD CODE** without the Gemini endpoints (`/api/chat` and `/api/roadmap-search`). That's why you're getting 404 errors.

## ✅ Solution: Complete Restart

### Step 1: Close ALL Python Terminals
1. Find ALL PowerShell/CMD windows running Python
2. Close them ALL (or kill processes)

### Step 2: Kill All Python Processes
**Option A: Using PowerShell** (Run in NEW terminal)
```powershell
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Option B: Using Command Prompt**
```cmd
taskkill /F /IM python.exe
```

### Step 3: Wait 3 Seconds
```powershell
Start-Sleep -Seconds 3
```

### Step 4: Start Backend with API Key
**Open a NEW PowerShell terminal and run:**

```powershell
cd "C:\Users\khana\OneDrive\Desktop\mr khan project\ml"
$env:GEMINI_API_KEY="AIzaSyBi8LFYSO2uncFZIJpE4hHcXES66FhTBvg"
python -m uvicorn api:app --host 127.0.0.1 --port 8000 --reload
```

**You should see:**
```
[OK] Gemini API configured with gemini-flash-lite-latest (free tier)
[OK] API Key configured: AIzaSyBi8LFYSO2...ES66FhTBvg
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 5: Verify Endpoints are Registered
**Wait 10 seconds, then visit:**
http://localhost:8000/docs

**You should see these endpoints in the list:**
- ✅ `/api/chat` 
- ✅ `/api/roadmap-search`
- ✅ `/predict-career`
- ✅ `/skill-gap`
- ✅ `/resume-match`

### Step 6: Test in Frontend
1. Refresh your browser (Ctrl+Shift+R)
2. Try the chatbot or roadmap search again
3. Should work now!

---

## 🐛 If Still Not Working

### Check What's Actually Running:
```powershell
curl http://localhost:8000/openapi.json | ConvertFrom-Json | Select-Object -ExpandProperty paths | Select-Object -ExpandProperty PSObject | Select-Object -ExpandProperty Properties | Select-Object Name | Where-Object { $_.Name -like '/api/*' }
```

**If you see `/api/chat` and `/api/roadmap-search` in the output, they're registered!**

**If you DON'T see them:**
1. The server is still running old code
2. Kill ALL Python processes again
3. Check `ml/api.py` file - make sure it has the endpoints
4. Restart completely

---

## 📋 Quick Checklist

- [ ] Closed all Python terminal windows
- [ ] Killed all Python processes
- [ ] Opened NEW terminal
- [ ] Set API key: `$env:GEMINI_API_KEY="AIzaSyBi8LFYSO2uncFZIJpE4hHcXES66FhTBvg"`
- [ ] Started backend: `python -m uvicorn api:app --host 127.0.0.1 --port 8000 --reload`
- [ ] Saw "[OK] Gemini API configured" message
- [ ] Checked http://localhost:8000/docs - endpoints listed
- [ ] Refreshed frontend browser
- [ ] Tested chatbot/roadmap search

---

**The endpoints ARE in your code - you just need to restart the server!** 🚀
