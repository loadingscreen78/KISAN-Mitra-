# 🚀 Kisan Mitra - Complete Setup Guide

This guide will walk you through setting up Kisan Mitra on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/downloads/)
- **Git** - [Download](https://git-scm.com/downloads/)
- **npm** (comes with Node.js)

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Dasarigalla-Raviteja/kisanmitra.git
cd kisanmitra
```

### 2. Install Frontend Dependencies

```bash
npm install
```

This will install all React, TypeScript, and UI dependencies listed in `package.json`.

### 3. Install Backend Dependencies

#### Option A: Using pip (Recommended)
```bash
pip install -r requirements.txt
```

#### Option B: Using a Virtual Environment (Recommended for Development)
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Set Up Environment Variables

1. Copy the example environment file:
```bash
copy .env.example .env
```

2. Open `.env` file and fill in your API keys:

```env
# Get from https://supabase.com/dashboard
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_postgres_connection_string

# Get from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_key

# Get from https://huggingface.co/settings/tokens
HF_TOKEN=your_huggingface_token

# Get from https://openweathermap.org/api
OPENWEATHERMAP_API_KEY=your_weather_key
VITE_OPENWEATHERMAP_API_KEY=your_weather_key

# Optional: Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_key
```

### 5. Verify Installation

#### Check Node.js and npm:
```bash
node --version
npm --version
```

#### Check Python and pip:
```bash
python --version
pip --version
```

### 6. Run the Application

You need to run both backend and frontend simultaneously in separate terminals.

#### Terminal 1 - Backend Server (Port 8000)
```bash
python backend/plant_diagnosis_api.py
```

Wait for these messages:
- `[OK] HuggingFace model loaded successfully!`
- `* Running on http://0.0.0.0:8000`

#### Terminal 2 - Frontend Development Server (Port 5000)
```bash
npm run dev
```

Wait for:
- `VITE v5.4.20 ready`
- `➜ Local: http://localhost:5000/`

### 7. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:8000/api/health

## Common Issues and Solutions

### Issue: "ModuleNotFoundError: No module named 'xyz'"
**Solution**: Install Python dependencies
```bash
pip install -r requirements.txt
```

### Issue: "npm ERR! code ENOENT"
**Solution**: Install Node dependencies
```bash
npm install
```

### Issue: Backend model loading takes too long
**Solution**: First-time model download can take 1-2 minutes. The HuggingFace model (~100MB) downloads automatically. Be patient and check the terminal for progress.

### Issue: Database connection errors
**Solution**: 
1. Verify your DATABASE_URL in `.env`
2. Ensure your Supabase project is active
3. Check internet connection

### Issue: API keys not working
**Solution**:
1. Regenerate keys from respective platforms
2. Ensure no extra spaces in `.env` file
3. Restart both servers after updating `.env`

### Issue: Port already in use
**Solution**: 
```bash
# Windows - Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Issue: CORS errors in browser
**Solution**: Ensure CORS_ORIGINS in `.env` includes your frontend URL:
```env
CORS_ORIGINS=http://localhost:5000,http://127.0.0.1:5000
```

## Testing the Application

### Test Backend Health:
```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "Plant Diagnosis API is running",
  "database": "connected"
}
```

### Test Frontend:
1. Navigate to http://localhost:5000
2. You should see the Kisan Mitra landing page
3. Click "Get Started" to test navigation

### Test Plant Diagnosis:
1. Sign up or log in
2. Navigate to "Diagnose" section
3. Upload a plant leaf image
4. Verify disease prediction appears

## Development Tips

### Hot Reloading
- Frontend changes auto-reload (Vite HMR)
- Backend requires manual restart after code changes

### Debugging
- Frontend: Use browser DevTools (F12)
- Backend: Check terminal output for logs
- Enable detailed logging by setting in backend:
  ```python
  app.debug = True
  ```

### Database Management
- View database: Supabase Dashboard → Table Editor
- Run migrations: Check backend/database/init_db.py
- Reset tables: Delete and recreate from Supabase dashboard

## Building for Production

### Frontend Build:
```bash
npm run build
```
Output will be in `dist/` directory.

### Backend Production:
Use Gunicorn or similar WSGI server:
```bash
gunicorn -w 4 -b 0.0.0.0:8000 backend.plant_diagnosis_api:app
```

## Next Steps

After successful setup:
1. ✅ Explore the application features
2. ✅ Try uploading plant images for diagnosis
3. ✅ Chat with the AI farming assistant
4. ✅ Check weather forecasts
5. ✅ Browse the marketplace

## Need Help?

- 📖 Check the main [README.md](README.md)
- 🐛 Report issues on GitHub
- 💬 Join our community discussions
- 📧 Email support: support@kisanmitra.com

## Success Checklist

- [ ] Node.js and Python installed
- [ ] Dependencies installed (npm + pip)
- [ ] .env file configured with API keys
- [ ] Backend running on port 8000
- [ ] Frontend running on port 5000
- [ ] Can access http://localhost:5000
- [ ] Backend health check passes
- [ ] Can sign up/login
- [ ] Plant diagnosis works
- [ ] AI chat responds

---

**Happy Farming! 🌾**
