# CRAB AI — Setup & Run Guide

## Step 1: Get your API keys (5 minutes)

### Supabase (for login/signup)
1. Go to https://supabase.com and open your project
2. Click **Settings → API**
3. Copy:
   - **Project URL** → `SUPABASE_URL` (backend) and `VITE_SUPABASE_URL` (frontend)
   - **anon public key** → `VITE_SUPABASE_PUBLISHABLE_KEY` (frontend)
   - **JWT Secret** (scroll down) → `SUPABASE_JWT_SECRET` (backend)
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (backend)

### Gemini AI (for AI features — FREE, no billing)
1. Go to https://aistudio.google.com/app/apikey
2. Click **Create API key**
3. Copy the key → `GEMINI_API_KEY` (backend)

---

## Step 2: Fill in .env files

**`CRAB AI BACKEND/.env`** — fill in:
- SUPABASE_JWT_SECRET
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- GEMINI_API_KEY

**`CRAB AI FRONTEND/.env`** — fill in:
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY

---

## Step 3: Run the backend

```bash
cd "CRAB AI BACKEND"
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

---

## Step 4: Run the frontend

```bash
cd "CRAB AI FRONTEND"
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `pip install` fails for psycopg2 | Already removed from requirements.txt — this is fixed |
| Login says "Invalid token" | Check SUPABASE_JWT_SECRET in backend .env |
| AI features return nothing | Check GEMINI_API_KEY in backend .env |
| CORS errors | Make sure backend is running on port 8000 and VITE_API_BASE_URL is set |
| "Supabase URL is required" | Fill in VITE_SUPABASE_URL in frontend .env |
