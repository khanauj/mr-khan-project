# Gemini API Integration - Setup Complete ✅

## 🎯 What's Been Added

### Backend (FastAPI)
1. **Gemini API Integration**
   - Added `google-generativeai` package to requirements
   - Configured Gemini API key environment variable support
   - Created two new endpoints:
     - `POST /api/chat` - AI-powered chatbot
     - `POST /api/roadmap-search` - Dynamic career roadmap generation

2. **Endpoints Added:**
   - `/api/chat` - Chat with AI career advisor using Gemini
   - `/api/roadmap-search` - Generate personalized roadmaps based on search query

### Frontend (React)
1. **Chatbot Integration**
   - Updated chatbot to use Gemini API (`/api/chat`)
   - Added conversation history support for context-aware responses
   - Both floating chatbot and full-page chatbot now use Gemini

2. **Roadmap Search Bar**
   - Added search bar to Career Switch page
   - Users can search for any career transition
   - Generates dynamic roadmap using Gemini API
   - Displays generated roadmap with steps, tasks, and skills

## 🔧 Setup Instructions

### Step 1: Get Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey
2. Sign in with Google Account
3. Click "Create API Key"
4. Copy your API key

### Step 2: Install Dependencies

```bash
cd ml
pip install google-generativeai
```

Or update all dependencies:
```bash
pip install -r requirements.txt
```

### Step 3: Configure API Key

**Option A: Environment Variable (Recommended)**

**Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY="your_api_key_here"
cd ml
python api.py
```

**Windows (Command Prompt):**
```cmd
set GEMINI_API_KEY=your_api_key_here
cd ml
python api.py
```

**Linux/Mac:**
```bash
export GEMINI_API_KEY="your_api_key_here"
cd ml
python api.py
```

**Option B: Edit start_backend.bat**

Edit `ml/start_backend.bat` and add:
```batch
set GEMINI_API_KEY=your_api_key_here
python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000
```

**Option C: System Environment Variable (Persistent)**

1. Open System Properties → Environment Variables
2. Add new User Variable:
   - Name: `GEMINI_API_KEY`
   - Value: `your_api_key_here`
3. Restart terminal/IDE

### Step 4: Start Backend

```bash
cd ml
python api.py
```

Or use uvicorn:
```bash
cd ml
python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000
```

You should see:
```
[OK] Gemini API configured successfully
```

If you see:
```
[INFO] GEMINI_API_KEY not set. Gemini features will be disabled.
```

Then the API key is not configured correctly.

## 🎨 Features Added

### 1. AI Chatbot (Gemini-Powered)

**Location:** `/chatbot` page and floating chatbot button

**Features:**
- Context-aware conversations
- Remembers conversation history (last 5 messages)
- Professional career advice
- Answers questions about:
  - Career predictions
  - Skill gap analysis
  - Resume matching
  - Career transitions
  - Job market trends

**How to Use:**
1. Go to Chatbot page or click floating chat button
2. Type your question
3. Press Enter or click Send
4. Get AI-powered response

### 2. Roadmap Search (Gemini-Powered)

**Location:** `/career-switch` page

**Features:**
- Search bar at the top of Career Switch page
- Generate personalized roadmaps based on:
  - Search query (e.g., "How to become a Data Scientist?")
  - Current role (from profile, if available)
  - Target role (from prediction, if available)
  - Current skills (from profile)
- Dynamic roadmap with:
  - Step-by-step plan
  - Duration estimates
  - Actionable tasks
  - Required skills
  - Timeline estimates

**How to Use:**
1. Go to Career Switch page
2. Enter a search query in the search bar:
   - Examples:
     - "How to become a Machine Learning Engineer?"
     - "Transition from Business Analyst to Product Manager"
     - "Career path to become a Data Scientist"
3. Click "Generate Roadmap" or press Enter
4. View your personalized roadmap below

## 📡 API Endpoints

### POST /api/chat

**Request:**
```json
{
  "message": "What skills do I need for Data Science?",
  "conversation_history": [
    {"role": "user", "content": "Hello"},
    {"role": "bot", "content": "Hi! How can I help?"}
  ]
}
```

**Response:**
```json
{
  "reply": "For Data Science, you typically need skills like Python, Statistics, Machine Learning, SQL, and Data Visualization..."
}
```

### POST /api/roadmap-search

**Request:**
```json
{
  "query": "How to become a Data Scientist?",
  "current_role": "Business Analyst",
  "target_role": "Data Scientist",
  "current_skills": ["Excel", "SQL", "Python"]
}
```

**Response:**
```json
{
  "roadmap": {
    "title": "Transition to Data Scientist",
    "description": "A comprehensive roadmap...",
    "timeline": "6-12 months"
  },
  "steps": [
    {
      "title": "Learn Core Skills",
      "duration": "Months 1-3",
      "description": "Focus on Python, Statistics, and ML",
      "tasks": ["Take Python course", "Learn Statistics", "Practice with datasets"],
      "skills": ["Python", "Statistics", "Pandas"],
      "icon": "book"
    }
  ],
  "timeline": "6-12 months"
}
```

## ✅ Verification

After setting up, verify:

1. **Backend Health:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should show models_loaded: true

2. **Gemini Configuration:**
   - Check backend terminal for: `[OK] Gemini API configured successfully`
   - If not, check API key is set correctly

3. **Test Chatbot:**
   - Go to `/chatbot` page
   - Send a message
   - Should get AI response (not fallback message)

4. **Test Roadmap Search:**
   - Go to `/career-switch` page
   - Enter search query
   - Click "Generate Roadmap"
   - Should see generated roadmap

## 🐛 Troubleshooting

### "Gemini API is not configured" Error

- Check API key is set: `echo $GEMINI_API_KEY` (Linux/Mac) or `echo %GEMINI_API_KEY%` (Windows)
- Restart backend after setting environment variable
- Verify package installed: `pip show google-generativeai`

### "Failed to parse roadmap response" Error

- This means Gemini returned non-JSON response
- Try a different search query
- Check backend logs for Gemini API errors

### Chatbot Returns Fallback Message

- API key not configured
- Check backend terminal for Gemini configuration status
- Verify endpoint: `curl -X POST http://localhost:8000/api/chat -H "Content-Type: application/json" -d '{"message":"test"}'`

## 🔐 Security Notes

- Never commit API key to git
- Add `.env` to `.gitignore` if using .env file
- Use environment variables in production
- Rotate API key if accidentally exposed

## 📝 Example Queries

**For Chatbot:**
- "What career path should I take?"
- "How do I become a Data Analyst?"
- "What skills are in demand for AI roles?"
- "Help me transition from Business to Tech"

**For Roadmap Search:**
- "How to become a Machine Learning Engineer?"
- "Transition from Software Engineer to Product Manager"
- "Career path to become a Data Scientist with 2 years experience"
- "How to switch from Marketing to Data Analytics?"

---

**Everything is ready! Just add your Gemini API key and start using the AI features!** 🚀
