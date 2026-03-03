# Deploy to Vercel + Render

## Frontend (Vercel)
1. Push to GitHub and connect repo to [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add env var: `NEXT_PUBLIC_API_URL` = your Render backend URL (e.g. `https://vantage-backend.onrender.com`)
4. Deploy – Vercel runs `npm run build` automatically (production mode)

## Backend (Render)
1. Create **Web Service** at [Render](https://render.com)
2. Connect repo, set **Root Directory** to `backend`
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_JWT_SECRET`
6. Deploy

## Local (Production Build)
```bash
# Frontend
cd frontend && npm run prod

# Backend
cd backend && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000
```
