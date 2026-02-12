# Gemini API Setup Guide

## 🔑 Getting Your Gemini API Key

1. **Visit Google AI Studio:**
   - Go to: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign in with your Google Account**

3. **Create API Key:**
   - Click "Create API Key"
   - Copy your API key

4. **Set Environment Variable:**

   **Windows (PowerShell):**
   ```powershell
   $env:GEMINI_API_KEY="your_api_key_here"
   ```

   **Windows (Command Prompt):**
   ```cmd
   set GEMINI_API_KEY=your_api_key_here
   ```

   **Linux/Mac:**
   ```bash
   export GEMINI_API_KEY="your_api_key_here"
   ```

   **Or create a .env file in the `ml/` directory:**
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

## 🚀 Using with Backend

### Option 1: Environment Variable (Recommended)

Before starting the backend, set the environment variable:

**Windows:**
```powershell
cd ml
$env:GEMINI_API_KEY="your_api_key_here"
python api.py
```

**Linux/Mac:**
```bash
cd ml
export GEMINI_API_KEY="your_api_key_here"
python api.py
```

### Option 2: Modify start_backend.bat (Windows)

Edit `ml/start_backend.bat` and add:
```batch
set GEMINI_API_KEY=your_api_key_here
python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000
```

### Option 3: System Environment Variable (Persistent)

1. Open System Properties → Environment Variables
2. Add new User Variable:
   - Name: `GEMINI_API_KEY`
   - Value: `your_api_key_here`
3. Restart terminal/IDE

## 📦 Install Required Package

```bash
pip install google-generativeai
```

Or update requirements:
```bash
pip install -r requirements.txt
```

## ✅ Verify Setup

After starting the backend, you should see:
```
[OK] Gemini API configured successfully
```

If you see:
```
[INFO] GEMINI_API_KEY not set. Gemini features will be disabled.
```

Then the API key is not configured. Check your environment variable.

## 🎯 Features Enabled with Gemini

1. **AI Chatbot** (`/chatbot` page)
   - Real-time AI-powered conversations
   - Context-aware responses
   - Career advice and guidance

2. **Roadmap Search** (`/career-switch` page)
   - Generate personalized career roadmaps
   - Search for specific career transitions
   - Get detailed step-by-step plans

## 🔒 Security Note

- **Never commit your API key to git**
- Add `.env` to `.gitignore`
- Use environment variables in production
- Rotate keys if accidentally exposed

## 💰 API Limits

- Free tier available for testing
- Check Google AI Studio for current limits
- Monitor usage in Google Cloud Console
