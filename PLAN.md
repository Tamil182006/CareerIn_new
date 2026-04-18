# 🚀 CareerIN — 11-Day Build Plan (80% MVP Target)

> **Start Date:** April 7 | **Deadline:** April 18 | **Goal:** Fully working MVP

---

## 🧠 What We're Building

```
User → Landing Page
     → Sign Up / Log In
     → Select Interests (coding / design / finance etc.)
     → Get Recommended Careers
     → Click Career → See Full Details + Roadmap
     → Mark Roadmap Steps Done → Progress % tracked
     → Dashboard shows real stats
     → Upload Resume → Profile auto-filled
```

---

## 🏗️ Current Status (What's ALREADY Done)

| Done | Location |
|---|---|
| ✅ Landing page (good UI) | `app/landingpage/page.jsx` |
| ✅ Login page (UI only) | `app/login/page.jsx` |
| ✅ Signup page (UI only) | `app/signup/page.jsx` |
| ✅ Dashboard home (UI only) | `app/home/page.jsx` |
| ✅ Profile card (UI, fake data) | `app/components/profileCard.jsx` |
| ✅ Backend server boilerplate | `backend/server.js` |
| ✅ MongoDB connected | `backend/.env` |
| ✅ Profile model + routes | `backend/src/routes/profileRoutes.js` |
| ✅ Resume upload route | `backend/src/routes/resumeRoute.js` |
| ✅ Python resume parser | `resume_parser-main/` ← USE THIS |
| ✅ Node→Python bridge | `backend/src/utils/runParser.js` (needs path fix) |

---

## ⚠️ Things That Need Fixing Before Building

> Fix these TODAY before anything else. Fast fixes, big impact.

| Fix | File | What to do |
|---|---|---|
| Middleware order bug | `backend/server.js` | Move `cors()` + `express.json()` BEFORE routes |
| Resume route not mounted | `backend/server.js` | Add `const resumeRoute = require(...)` + `app.use("/api/resume", resumeRoute)` |
| Parser path wrong | `backend/src/utils/runParser.js` | Point to `resume_parser-main/run_parser.py` (currently points to wrong path) |
| Branding mistake | `login/page.jsx` & `signup/page.jsx` | Replace "ResumeCatalyst" → "CareerIN" |
| `services/api.js` is empty | `app/services/api.js` | Will fill in Day 2 |

---

## 📅 11-Day Sprint Plan

---

### DAY 1 (TODAY) — Fix Bugs + Setup Backend Auth
**Goal:** Backend is clean and working. Auth API ready.

- [ ] Fix `server.js` (middleware order + register resumeRoute)
- [ ] Fix `runParser.js` path → point to `resume_parser-main/run_parser.py`
- [ ] Fix branding in login + signup pages ("ResumeCatalyst" → "CareerIN")
- [ ] Install `bcryptjs` + `jsonwebtoken` in backend
- [ ] Create `User` model: `{name, email, password, interests[], skillLevel, goals}`
- [ ] Create `POST /api/auth/signup` route (hash password, save user, return JWT)
- [ ] Create `POST /api/auth/login` route (verify password, return JWT)
- [ ] Test both routes with Postman / Thunder Client

**Backend stack in `server.js` when done:**
```
cors → express.json → /api/auth → /api/profile → /api/resume → /api/careers → /api/progress
```

---

### DAY 2 — Connect Frontend Auth (Login + Signup Working)
**Goal:** User can actually sign up and log in. JWT stored in browser.

- [ ] Install `axios` in frontend (`npm i axios`)
- [ ] Fill `services/api.js` — create `signup()` and `login()` functions
- [ ] Connect `signup/page.jsx` → call real API → redirect to `/interests` on success
- [ ] Connect `login/page.jsx` → call real API → save JWT to `localStorage` → redirect to `/home`
- [ ] Create a simple `AuthContext` in React (store user + token globally)
- [ ] Create auth guard utility — redirect to `/login` if no token

---

### DAY 3 — Career Data + Career API
**Goal:** Career data exists in DB. API endpoints working.

- [ ] Create career seed data JSON (hardcode 10-15 careers):
  ```json
  {
    "id": "software-developer",
    "title": "Software Developer",
    "description": "...",
    "relatedInterests": ["coding", "problem-solving"],
    "skills": ["JavaScript", "React", "Node.js", "Git"],
    "salary": "₹6L – ₹25L/year",
    "roadmap": [
      { "step": 1, "title": "Learn Programming Basics", "desc": "..." },
      { "step": 2, "title": "Build Projects", "desc": "..." },
      { "step": 3, "title": "Learn DSA", "desc": "..." },
      { "step": 4, "title": "Internship / Freelance", "desc": "..." },
      { "step": 5, "title": "Apply for Jobs", "desc": "..." }
    ]
  }
  ```
- [ ] Create 10+ careers covering: coding, design, data, finance, marketing
- [ ] Create `Career` model in MongoDB
- [ ] Create seed script to populate DB
- [ ] Create `GET /api/careers` — return all careers
- [ ] Create `GET /api/career/:id` — return one career with full roadmap
- [ ] Create `POST /api/recommend` — takes `{interests: []}` → returns matching careers

---

### DAY 4 — Interest Selection Page
**Goal:** After signup, user picks their interests → system recommends careers.

- [ ] Create `/interests` page (new Next.js route)
- [ ] Build interest selection UI — grid of clickable cards:
  - 💻 Coding, 🎨 Design, 📊 Data & AI, 💰 Finance, 📱 App Dev, 🎮 Game Dev, 📣 Marketing...
- [ ] On submit → call `POST /api/recommend` → save to user profile
- [ ] Store selected interests in user's DB record
- [ ] Redirect to `/careers` after submission

---

### DAY 5 — Career List Page
**Goal:** User sees their recommended career cards.

- [ ] Create `/careers` page
- [ ] Fetch recommended careers from API (based on logged-in user's interests)
- [ ] Build career card UI:
  ```
  [Card]
  title: Software Developer
  skills: JavaScript, React, Node.js
  salary: ₹6L – ₹25L/year
  match: 85% (based on resume skills if uploaded)
  [View Roadmap →]
  ```
- [ ] Make cards clickable → navigate to `/career/[id]`
- [ ] Add search/filter bar (optional but good to have)

---

### DAY 6 — Career Detail Page + Roadmap UI
**Goal:** User sees full career info + step-by-step roadmap.

- [ ] Create `/career/[id]` dynamic route page
- [ ] Fetch career detail from `GET /api/career/:id`
- [ ] Build Career Detail UI:
  - Title, description, salary range
  - Required skills as tags
  - Step-by-step Roadmap section (numbered vertical cards)
- [ ] Each roadmap step has:
  - Step number
  - Title
  - Short description
  - Checkbox to mark complete

---

### DAY 7 — Progress Tracking
**Goal:** User can mark roadmap steps done. Progress tracked and saved.

- [ ] Create `Progress` model: `{userId, careerId, completedSteps: [1, 2, 3]}`
- [ ] Create `POST /api/progress` — save completed steps
- [ ] Create `GET /api/progress/:userId/:careerId` — fetch progress
- [ ] Wire roadmap checkboxes → API call when toggled
- [ ] Calculate progress % `(completedSteps.length / totalSteps) * 100`
- [ ] Show progress bar on career detail page

---

### DAY 8 — Connect Dashboard to Real Data
**Goal:** Dashboard shows real user info, real progress, real careers.

- [ ] Fetch logged-in user from JWT / API on dashboard load
- [ ] Show real name in welcome message (not hardcoded "Alex")
- [ ] Show real progress % in the circular progress indicator
- [ ] Show real career cards in "Recommended" section
- [ ] Connect "Quick Actions" buttons to actual pages:
  - "Edit Profile" → `/profile`
  - "Set Career Goal" → `/interests`
  - "Upload Resume" → `/upload`
- [ ] "Next Steps" checklist — mark "Upload Resume" done if profile exists

---

### DAY 9 — Resume Upload Page + Parser Integration
**Goal:** User uploads resume → profile auto-filled from parsed data.

- [ ] Create `/upload` page
- [ ] Build file upload UI (drag & drop or button)
- [ ] On upload → call backend `POST /api/resume/upload` with file + userId
- [ ] Backend calls `resume_parser-main/run_parser.py` (using fixed `runParser.js`)
- [ ] Parsed data returns → save to Profile model in MongoDB
- [ ] After upload → redirect to `/profile` to see parsed data
- [ ] Update dashboard to show "Resume: Uploaded ✅" instead of "Pending"

---

### DAY 10 — Profile Page (Dynamic)
**Goal:** Profile page shows real data from DB (not hardcoded "Loki").

- [ ] Connect `profileCard.jsx` → fetch from `GET /api/profile/:userId`
- [ ] Display real: name, email, phone, skills, education from parsed resume
- [ ] Show "career match %" for each eligible role
- [ ] Add "Current Focus" section from user's selected goal
- [ ] Link profile back to dashboard in navbar

---

### DAY 11 — Polish, Test & Final Fixes
**Goal:** Everything works end-to-end. UI is presentable.

- [ ] Full end-to-end test: Signup → Interests → Careers → Roadmap → Progress → Dashboard
- [ ] Fix any broken links or navigation issues
- [ ] Add loading spinners on all API calls
- [ ] Add proper error messages (wrong password, network error, etc.)
- [ ] Check mobile responsiveness on all pages
- [ ] Fix any remaining branding issues
- [ ] Clean up `frontend/a/` empty folder
- [ ] Test resume upload with a real PDF

---

## 🗃️ Backend API Endpoints (Complete Picture)

| Method | Route | Purpose | Day |
|---|---|---|---|
| POST | `/api/auth/signup` | Register new user | Day 1 |
| POST | `/api/auth/login` | Login, get JWT | Day 1 |
| GET | `/api/careers` | Get all careers | Day 3 |
| GET | `/api/career/:id` | Get one career + roadmap | Day 3 |
| POST | `/api/recommend` | Get careers by interests | Day 3 |
| POST | `/api/progress` | Save completed steps | Day 7 |
| GET | `/api/progress/:userId/:careerId` | Get progress | Day 7 |
| POST | `/api/resume/upload` | Upload PDF → parse → save | Day 9 |
| GET | `/api/profile/:userId` | Get parsed profile | Exists |
| POST | `/api/profile` | Save/update profile | Exists |

---

## 🖥️ Frontend Pages (Complete Picture)

| Page | Route | Day |
|---|---|---|
| Landing Page | `/landingpage` | ✅ Done |
| Login | `/login` | ✅ UI done → Wire Day 2 |
| Signup | `/signup` | ✅ UI done → Wire Day 2 |
| Interest Selection | `/interests` | Day 4 |
| Career List | `/careers` | Day 5 |
| Career Detail + Roadmap | `/career/[id]` | Day 6 |
| Dashboard | `/home` | ✅ UI done → Wire Day 8 |
| Profile | `/profile` | ✅ UI done → Wire Day 10 |
| Resume Upload | `/upload` | Day 9 |

---

## 🔑 Important Architecture Decisions

| Decision | Answer |
|---|---|
| Auth method | JWT (you already have Node backend) |
| Career data | Start hardcoded JSON → seed into MongoDB Day 3 |
| HTTP client | Axios (install in frontend) |
| State management | React Context API (AuthContext, enough for MVP) |
| Session storage | JWT in `localStorage`, sent as `Authorization: Bearer <token>` |
| Parser | Use `resume_parser-main/run_parser.py` (the real one) |
| Python bridge | Fix `runParser.js` to point to correct script path |

---

## ⚠️ Parser Architecture (Important!)

The current `runParser.js` points to the **wrong path**. Fix it like this:

```js
// backend/src/utils/runParser.js — CORRECT path
const parserPath = path.join(
  __dirname,
  "../../../resume_parser-main/run_parser.py"  // ← point here
);
```

The parser requires **Poppler** on Windows. Make sure:
- Poppler is installed at `C:\poppler-25.12.0\Library\bin` (it's already in `run_parser.py`)
- Python packages installed: `pip install -r resume_parser-main/requirements.txt`
- spaCy model installed: `python -m spacy download en_core_web_sm`

---

## 📊 80% Completion Checklist

By Day 11, you'll have:

- [x] Landing page — visual entry point
- [ ] Working signup + login with JWT
- [ ] Interest selection → career recommendation
- [ ] Career list page with real data
- [ ] Career detail page with full roadmap
- [ ] Progress tracker (checkboxes + % saved)
- [ ] Dashboard with real user data
- [ ] Resume upload + auto-fill profile
- [ ] Dynamic profile page
- [ ] End-to-end flow working

**That's 80%+ of what was planned in the master plan.**

---

## 🚫 What We're NOT Building (Save for Later)

- AI recommendations (OpenAI API) — too complex for 11 days
- Chatbot mentor — not needed for MVP
- Course links (YouTube/Coursera) — add later
- Resume suggestions — later
- Google OAuth — later
- Forget password / email verification — later

---

## ▶️ Start Right Now (Day 1 Tasks)

```
1. Fix server.js (5 min)
2. Fix runParser.js path (2 min)
3. Fix login/signup branding (2 min)
4. npm install bcryptjs jsonwebtoken in backend
5. Create User model
6. Create /api/auth/signup route
7. Create /api/auth/login route
8. Test with Postman
```

**Want me to start coding Day 1 right now?**
