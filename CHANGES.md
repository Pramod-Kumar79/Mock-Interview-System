# What's new

This adds accounts, interview history, and a recruiter dashboard on top of the
existing Mock Interview System.

## New concepts
- **Accounts**: people now sign up as either a **Candidate** or a **Recruiter**.
- **Candidates** take mock interviews as before. Every completed interview
  (job role, experience level, Q&A, emotion data, suspicious-activity count,
  AI review, and a new 0-100 **performance score**) is now saved to their
  account automatically.
- **Recruiters** can't take interviews. Instead they get a dashboard listing
  every candidate, with total interviews taken, average score, and last
  interview date — and can drill into any candidate to see their full
  interview-by-interview history and read the AI feedback for each one.

## Backend changes (`server/`)
- `models.py` (new): `User` and `Interview` SQLAlchemy models (SQLite by default).
- `auth.py` (new): JWT-based login (`generate_token`, `token_required`, `role_required`).
- `app.py`: added
  - `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
  - `POST /api/interview/save` — saves a completed interview for the logged-in candidate
  - `GET /api/interview/history` — candidate's own history
  - `GET /api/interview/history/<id>` — full detail of one interview (owner or any recruiter)
  - `GET /api/recruiter/candidates` — all candidates + aggregate stats (recruiter-only)
  - `GET /api/recruiter/candidates/<id>/history` — one candidate's full history (recruiter-only)
- `functions/review_generation.py`: the AI is now also asked for a `SCORE: NN`
  line, parsed into a 0-100 performance score (falls back to a simple
  completeness/suspicious-activity heuristic if parsing fails).
- `requirements.txt`: added `Flask-SQLAlchemy`, `PyJWT`.
- `.env.example` (new): documents `GEMINI_API_KEY3`, `JWT_SECRET_KEY`, and
  optional `DATABASE_URL`.

**Before running the server**, copy `server/.env.example` to `server/.env`
and fill in your Gemini key and a real `JWT_SECRET_KEY`. Then:
```
cd server
pip install -r requirements.txt
python app.py
```
A `mock_interview.db` SQLite file is created automatically on first run.

> Note: SQLite is great for local use/demoing, but Vercel's filesystem is
> read-only, so a production deploy needs `DATABASE_URL` pointed at a real
> hosted database (e.g. Postgres) instead of the SQLite default.

## Frontend changes (`client/`)
- `pages/LoginPage.jsx`, `pages/RegisterPage.jsx` (new) — auth screens, with a
  candidate/recruiter toggle on sign-up.
- `pages/HistoryPage.jsx` (new) — candidate's own interview history table +
  detail view.
- `pages/RecruiterDashboard.jsx` (new) — candidate list with stats, drill-down
  into any candidate's history.
- `components/Navbar.jsx`, `components/InterviewDetailModal.jsx`,
  `components/utils/ProtectedRoute.jsx`, `components/utils/api.js` (new).
- `components/utils/GlobalState.js` — now also stores the logged-in user +
  auth token (persisted in `localStorage` so refreshing doesn't log you out).
- `App.js` — new routes: `/login`, `/register`, `/history`, `/recruiter`.
  `/`, `/interview`, `/review`, `/history` require a candidate login;
  `/recruiter` requires a recruiter login.
- `pages/HomePage.jsx` — small account bar (name, "My History", Logout) in
  the header when logged in. Also fixed a pre-existing bug where the
  experience level from `/api/get-questions` was read from the wrong field.
- `pages/ReviewPageNew.jsx` — after the AI review is generated, the full
  interview (including the new score) is auto-saved to the candidate's
  history, and the score is shown next to "FeedBack".

## Try it out
1. Register two accounts: one as a Candidate, one as a Recruiter.
2. Log in as the Candidate, take a mock interview, finish it — it's now saved.
3. Check `/history` to see it.
4. Log out, log in as the Recruiter, open `/recruiter` — you'll see that
   candidate with their average score, and can drill into their interview.
