# Formify — Turn One Idea Into Five Formats

Turn one topic into 5 platform-ready formats — blog post, LinkedIn post,
Twitter/X thread, YouTube script, and email newsletter — generated in the
background and streamed to the UI as they complete.

## Tech Stack
- **Frontend:** Next.js 15 (React 19) + Tailwind CSS
- **Backend:** Node.js + Express (TypeScript)
- **Database:** MongoDB Atlas (Mongoose)
- **Auth:** JWT + bcrypt
- **Queue:** Redis + BullMQ, with retry + dead-letter queue for failed jobs
- **AI:** OpenAI (primary) with Cloudflare Workers AI as automatic fallback
- **Security:** Helmet, per-IP + per-user rate limiting, input sanitization
- **Testing:** Jest (auth logic + retry/backoff/dead-letter queue logic)

## Features
1. AI content generation — 1 topic → 5 formats
2. Secure authentication (JWT + bcrypt)
3. Background job processing (BullMQ) with retry + dead-letter handling
4. Real-time streaming (SSE) — content appears live as each format finishes
5. Regenerate a single format instead of redoing all 5
6. Usage history with a calendar-style activity heatmap
7. Analytics dashboard (Recharts)
8. Editable profile (name + password change)
9. Credit system tied to subscription plans

## Local Setup

### Backend
```bash
cd backend
cp .env.example .env   # fill in MongoDB Atlas URI, JWT secret, AI keys, Redis URL
npm install
npm run dev
```
Redis is required for the queue — run locally (`redis-server`) or use a
free hosted Redis (e.g. Upstash) and put its URL in `.env`.

### Frontend
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Running tests
```bash
cd backend
npm test
```

## Deployment Checklist

Complete these in order — each later step depends on the one before it.

- [ ] **MongoDB Atlas** — create a free cluster, add a database user,
      whitelist `0.0.0.0/0` (or Render's IPs) under Network Access, copy
      the connection string into `MONGODB_URI`.
- [ ] **Upstash** — create a free Redis database, copy the connection
      URL (starts with `rediss://`) into `REDIS_URL`.
- [ ] **AI provider** — get an OpenAI API key (`OPENAI_API_KEY`), or set
      up Cloudflare Workers AI (`CLOUDFLARE_ACCOUNT_ID` +
      `CLOUDFLARE_API_TOKEN`) as a free-tier alternative.
- [ ] **Render** — create a new Web Service pointing at `backend/`,
      build command `npm install && npm run build`, start command
      `npm start`. Add every variable from `.env.example` under
      Environment. Note the resulting `https://your-app.onrender.com` URL.
- [ ] **Vercel** — import `frontend/`, set `NEXT_PUBLIC_API_URL` to your
      Render backend URL + `/api` (e.g. `https://your-app.onrender.com/api`).
- [ ] **CORS** — set `FRONTEND_URL` in Render's env vars to your live
      Vercel URL so the backend accepts requests from it.
- [ ] **Verify end-to-end** — sign up, generate content, watch it stream,
      regenerate one format, check History and Analytics on the live URLs.

**Known gotcha:** Render's free tier spins down after inactivity, so the
first request after idle time can take 20-30s to wake up — this is normal,
not a bug in your code.

## Project Structure
```
formify/
├── backend/
│   └── src/
│       ├── config/       # DB + queue connection setup
│       ├── models/       # User, Content (Mongoose schemas)
│       ├── controllers/  # auth, content, analytics, user
│       ├── routes/       # Express route definitions
│       ├── middleware/   # JWT auth, rate limiting
│       ├── utils/        # AI service (with fallback), queue worker
│       └── __tests__/    # Jest test suites
└── frontend/
    └── app/
        ├── login/ signup/            # auth pages
        └── dashboard/
            ├── generate/             # core feature — streaming + regenerate
            ├── history/              # calendar heatmap + list
            ├── analytics/            # Recharts dashboard
            └── profile/              # editable account settings
```
