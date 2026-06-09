# PlaceMate Roadmap: Architectural Approach & Task Deconstruction

This roadmap outlines the implementation strategy for **PlaceMate**, transitioning from a high-level vision to a structured, step-by-step development process. 

---

## 1. Development Philosophy & Core Approach

To avoid the common pitfalls of complex application builds, we will follow three core principles:

### 1.1 Vertical Slicing over Horizontal Layering
Instead of building the entire backend database and API first, followed by the entire frontend client, we will build **vertical slices** of functionality.
* *Example*: For **User Onboarding**, we will build the database schema, the backend API, the frontend onboarding form, and local state handling as one single, continuous step.
* *Why?* This ensures we have a fully functional product at every stage, making testing and visual feedback immediate.

### 1.2 Isolation & Mock-First Strategy
External integrations (Claude API, Puppeteer, Gmail API, Razorpay) are prone to latency, cost, rate-limiting, and credentials issues.
* **We will build mock providers** for these services on day one.
* We can develop the core logic using predictable, local mocks and switch to real API connections only during final module integration.

### 1.3 Atomic Tasks
We will break down large deliverables (e.g., "Build the Job Scraper") into **micro-tasks** that take less than 2 hours each. A task is complete only when it meets a specific, verifiable **definition of done (DoD)**.

---

## 2. Core Architecture Overview

```mermaid
graph TD
    subgraph Client [React Frontend / Vite]
        A[Auth Pages] --> B[Dashboard]
        B --> C[Portfolio Preview / Live Page]
        B --> D[Resume Downloader]
        B --> E[Job Agent Manager]
    end

    subgraph Server [Node.js + Express]
        F[Auth Controller] --> G[User Model]
        H[Profile API] --> G
        I[Portfolio Generator] --> J[Subdomain/Public Handler]
        K[Cron Scheduler] --> L[Puppeteer Scrapers]
        L --> M[Job Model]
        M --> N[AI Matcher / Claude API]
        N --> O[PDFKit Generator]
        O --> P[Nodemailer / Gmail API]
    end

    subgraph Database [MongoDB]
        G
        M
        Q[SentJobs Model]
    end

    C -.-> J
    P -.-> |Sends 5 emails/day| Gmail[User's Gmail Inbox]
```

---

## 3. Phase-by-Phase Deconstruction into Tiny Tasks

Below is the breakdown of the major phases into micro-tasks, including their specific Definition of Done (DoD).

### Phase 1: Project Setup & User Authentication
Goal: Establish the repo structure, build database connection, user registration, and login.

| Task ID | Micro-Task Description | Est. Time | Definition of Done (DoD) |
| :--- | :--- | :--- | :--- |
| **1.1** | Create workspace directories, initialize Node backend and Vite React frontend, verify package configurations. | 1.5h | `npm run dev` works for both client and server; `.gitignore` configured. |
| **1.2** | Setup Express app, configure MongoDB connection using Mongoose, and implement environment variable configuration. | 1h | Server starts and prints "Connected to MongoDB" on startup. |
| **1.3** | Create the `User` schema including password hashing using `bcrypt`. | 1h | Database model test script successfully saves and verifies a user password. |
| **1.4** | Write backend authentication routes (`/api/auth/register`, `/api/auth/login`) returning JWTs. | 1.5h | Routes tested via Postman/curl and return expected JWT tokens & errors. |
| **1.5** | Build React Auth UI (Login and Sign-up pages) with responsive design and form validation. | 2h | Visual validation errors display; UI matches aesthetic standards (sleek inputs, transitions). |
| **1.6** | Connect React login/register forms to backend API, storing JWT in `localStorage` / state. | 1.5h | Successful login redirects to `/dashboard` with credentials stored. |

---

### Phase 2: Onboarding Form & Profile Management
Goal: Allow users to build their unified profile which feeds the Portfolio, Resume, and Job Matching systems.

| Task ID | Micro-Task Description | Est. Time | Definition of Done (DoD) |
| :--- | :--- | :--- | :--- |
| **2.1** | Design the profile database schema nested inside the `User` model. | 1h | Schema handles education, experiences, skills array, projects, and target preferences. |
| **2.2** | Build a multi-step onboarding wizard frontend (Steps 1–5: Personal, Education, Skills, Projects, Preferences). | 2.5h | Form state persists between steps; includes progress bar; validates fields before proceeding. |
| **2.3** | Implement auto-saving profile endpoint (`PUT /api/profile/:id`) and hook up to frontend wizard. | 1.5h | Forms automatically save draft state to database every 10 seconds or on step transition. |
| **2.4** | Create Profile View & Edit page in the client dashboard. | 1.5h | User can load their profile, make changes, click save, and see instant updates in UI. |

---

### Phase 3: Portfolio Builder (Automatic Subdomains)
Goal: Generate public portfolio sites using templates based on the user's profile.

| Task ID | Micro-Task Description | Est. Time | Definition of Done (DoD) |
| :--- | :--- | :--- | :--- |
| **3.1** | Build the core portfolio public endpoint (`GET /api/portfolio/:username`). | 1.5h | Returns the public user profile data as JSON, returns 404 if profile not found. |
| **3.2** | Develop Theme 1 (Minimal) public portfolio layout using responsive HTML/CSS. | 2h | Renders public page beautifully at `/portfolio/:username` with links to Github/LinkedIn. |
| **3.3** | Develop Theme 2 (Developer-dark) and Theme 3 (Bold) portfolio templates. | 2.5h | CSS classes update based on theme selection query parameter (e.g. `?theme=dark`). |
| **3.4** | Implement Domain/Subdomain Routing or virtual subdomains in Express. | 2h | Server maps requests to `username.placemate.tech` to render the correct user's portfolio. |
| **3.5** | Build the Dashboard Portfolio Tab (theme preview, toggle template, copy share link). | 1.5h | Users can change templates and instantly copy their live subdomain URL. |

---

### Phase 4: Resume Builder (ATS-Optimized PDF)
Goal: Generate a clean, single-page PDF resume using the profile details.

| Task ID | Micro-Task Description | Est. Time | Definition of Done (DoD) |
| :--- | :--- | :--- | :--- |
| **4.1** | Configure backend PDFKit library and construct a basic single-page grid/layout. | 1.5h | A static test script produces a well-aligned, clean PDF document. |
| **4.2** | Write the resume generation utility (`utils/pdfgen.js`) mapped to user profile fields. | 2h | Script prints full education, experiences, skills, and projects dynamically. |
| **4.3** | Implement the backend download endpoint (`GET /api/resume/:id`) sending the PDF stream. | 1h | Client clicking "Download Resume" triggers native download of the generated PDF. |
| **4.4** | Incorporate basic AI phrasing adjustments (using a simple local rewrite prompt or Claude mockup). | 1.5h | Resume descriptions use action verbs and impact-oriented sentences. |

---

### Phase 5: Puppeteer Job Scrapers
Goal: Build reliable scraping mechanisms to pull job listings from Internshala, Indeed, and LinkedIn.

| Task ID | Micro-Task Description | Est. Time | Definition of Done (DoD) |
| :--- | :--- | :--- | :--- |
| **5.1** | Define the Mongoose `Job` schema with unique `applyLink` to prevent duplicates. | 1h | Database prevents duplicate entries on insertions of the same URL. |
| **5.2** | Build Puppeteer scraper for Internshala (search by role name, extract title, company, details). | 2.5h | Node script runs locally and logs array of 10 clean job objects with all fields. |
| **5.3** | Build Puppeteer scraper for Indeed India with anti-detection configurations. | 2.5h | Script successfully extracts Indeed listings without getting blocked by Captchas. |
| **5.4** | Create the central normalization utility (`utils/normalize.js`) to standardize raw scrapings. | 1h | Scraper outputs from all boards conform to the exact same database structure. |
| **5.5** | Write database ingestion job that runs scrapers and bulk-saves matches safely. | 1.5h | Calling `ingestJobs()` populated the database with unique listings. |

---

### Phase 6: AI Matching & Resume Tailoring (Claude API)
Goal: Use LLM to calculate match scores and rewrite resumes per job description.

| Task ID | Micro-Task Description | Est. Time | Definition of Done (DoD) |
| :--- | :--- | :--- | :--- |
| **6.1** | Create Claude API client utility with rate-limiting handlers and system instructions. | 1.5h | A test command sends a profile and JD, and receives a clean JSON response. |
| **6.2** | Design and test the Job Matching Prompt (takes user profile + JD → returns score 0-100 & justification). | 2h | Claude consistently outputs JSON format `{ "score": 85, "reason": "..." }`. |
| **6.3** | Design and test the Resume Tailoring Prompt (takes profile + target JD → returns tweaked bullet points). | 2.5h | Claude returns optimized project descriptions incorporating key terms from target JD. |
| **6.4** | Integrate custom PDF generation for tailored resumes (`utils/pdfgen.js` accepting rewritten fields). | 2h | Script outputs unique PDF files customized to specific company requirements. |

---

### Phase 7: Gmail Integration & Scheduler
Goal: Set up Node-Cron to trigger the daily 8 AM job match process and email users their customized results.

| Task ID | Micro-Task Description | Est. Time | Definition of Done (DoD) |
| :--- | :--- | :--- | :--- |
| **7.1** | Configure Nodemailer with Gmail API OAuth2 authentication. | 2h | Running a test script sends a sample email with an attachment to a test inbox. |
| **7.2** | Design the responsive HTML email template for the daily job digest. | 1.5h | Email matches design spec: shows match score badge, skills matched, and CTA button. |
| **7.3** | Build the main Cron Runner (`server/utils/agent.js`) that runs matching for all Pro users. | 2.5h | Orchestrator processes a single user: matches jobs, builds PDFs, and sends emails. |
| **7.4** | Configure `node-cron` to schedule the job execution for 8:00 AM daily. | 1h | Scheduler successfully invokes agent runner at the scheduled cron pattern. |

---

### Phase 8: Subscription (Razorpay) & Job Dashboard
Goal: Protect the agent under a payment gateway, and build the history/tracking dashboard.

| Task ID | Micro-Task Description | Est. Time | Definition of Done (DoD) |
| :--- | :--- | :--- | :--- |
| **8.1** | Create the `SentJob` Mongoose schema to log sent jobs, status, and PDF paths. | 1h | Database logs links between Users, Jobs, custom scores, and application status. |
| **8.2** | Build the Job Dashboard API (`GET /api/jobs/history`, `PATCH /api/jobs/:id/applied`). | 1.5h | API allows updating application toggle state and returns sent history. |
| **8.3** | Build frontend Dashboard Job Hunting tab (applied list, charts for scores, active toggle). | 2.5h | User sees job listing history cards, can toggle application status, and pause agent. |
| **8.4** | Integrate Razorpay Checkout on frontend and create webhook route on backend. | 2.5h | Successful checkout calls backend webhook and updates user status to `plan: "pro"`. |

---

## 4. Execution Workflow: The "TDD-Lite" Loop

When building each micro-task, developers should adhere to the following workflow:

```
1. Plan / Understand Task Focus
       │
       ▼
2. Write Local Isolated Test script (e.g. test-scraper.js)
       │
       ▼
3. Implement Code logic (e.g. indeedScraper.js)
       │
       ▼
4. Run Local Test (Verify exact JSON output/behavior)
       │
       ▼
5. Integrate into Express Routes / React Components
       │
       ▼
6. Commit & Mark Task as Complete [x]
```

This prevents debug loops from compounding, allowing you to move with velocity and stability.

---

## 5. Solve Dummy Data Problem

**Background:** An audit of the codebase revealed that several files use hardcoded dummy/mock data instead of real data. This phase systematically replaces every instance of fake data with real, production-ready integrations.

**Files affected:**
- `client/src/features/jobs/JobDashboardTab.jsx` — pads job lists with fabricated cards
- `server/utils/scrapers/internshalaScraper.js` — falls back to 3 hardcoded mock internships
- `server/utils/scrapers/indeedScraper.js` — falls back to 3 hardcoded mock jobs
- `server/controllers/paymentController.js` — simulates payments without a real gateway
- `server/utils/mailer.js` — writes emails to local file instead of sending them

### Phase 9A: Remove Fake Job Padding from Dashboard (Priority: CRITICAL)

**Why this is first:** Users currently see fabricated job cards (fake companies, dead links, random scores) mixed with real matches. This is the most user-facing problem.

**Level 1 explanation:** Right now the code says "always show exactly 5 jobs per day". If you only have 2 real matches, it invents 3 fake ones to fill the list. We need to remove this and just show whatever real jobs exist.

**Level 2 explanation:** The `padWithJobs()` function clones existing job objects or creates fabricated `{ title: 'Fullstack Software Engineer', company: 'Tech Innovations' }` entries with `applyLink: '#'`. This corrupts UX because users click on dead links. The fix is to remove the padding logic entirely and let the UI gracefully handle 0 jobs with an empty-state message.

| Task ID | Micro-Task Description | Est. Time | Definition of Done (DoD) |
| :--- | :--- | :--- | :--- |
| **9A.1** | Remove the entire `padWithJobs()` helper function from `JobDashboardTab.jsx`. Replace `getGroupedJobs()` to return raw arrays (today/yesterday/older) without any padding or cloning. | 30min | Each tab shows only the real matched jobs from the database. No cloned or dummy entries exist. |
| **9A.2** | Add an empty-state UI component for each tab when 0 jobs exist (e.g. "No matches found for today. Your agent will check again tomorrow."). | 30min | When a day has 0 matches, a friendly message with an icon is displayed instead of blank space. |
| **9A.3** | Remove the 3-day-only filter limitation. Allow the "Last 3 Days" tab to show ALL older jobs instead of filtering to exactly 2 days ago. | 20min | Older tab shows all jobs older than yesterday, not just jobs from exactly 2 days ago. |
| **9A.4** | Verify the analytics panel (Total Matches, Avg Score, Applied Rate) still displays correct statistics using only real job data. | 15min | Stats reflect real database data. Manual test: create a job via agent, verify count increments. |

---

### Phase 9B: Replace Web Scrapers with a Real Job API (Priority: HIGH)

**Why this is second:** Both Puppeteer scrapers (Internshala + Indeed) are blocked by anti-bot protections 90%+ of the time, so they almost always return hardcoded mock jobs with fake URLs like `mock-1`, `mock-2`.

**Level 1 explanation:** Instead of trying to open a hidden browser and copy job listings from websites (which those websites block), we will use a proper Job Search API that gives us real job data legally and reliably.

**Level 2 explanation:** Puppeteer-based scraping is fragile — sites change their HTML structure, add CAPTCHAs, and block headless browsers. A proper API (like JSearch via RapidAPI, Adzuna, or Arbeitnow) returns structured JSON with real apply links. We keep the same `Job` model and `ingestor.js` pipeline, but swap the data source from scrapers to API calls.

| Task ID | Micro-Task Description | Est. Time | Definition of Done (DoD) |
| :--- | :--- | :--- | :--- |
| **9B.1** | Research and select a free/affordable Job Search API. Evaluate: Adzuna API (free tier), JSearch on RapidAPI (free tier 500 req/month), or Arbeitnow (fully free, no key). Document pros/cons and pick one. | 1h | Decision documented with API name, pricing, rate limits, and sample response format. |
| **9B.2** | Create a new utility file `server/utils/scrapers/jobApiClient.js` that calls the chosen API, fetches software/web developer jobs, and returns an array of normalized job objects. | 1.5h | Running the utility logs 5-10 real job listings with real titles, companies, and apply links. |
| **9B.3** | Update `server/utils/scrapers/normalize.js` to handle the new API response format alongside (or replacing) the old scraper format. | 30min | `normalizeJob()` correctly maps API fields (title, company, location, description, applyLink) to the `Job` schema. |
| **9B.4** | Update `server/utils/ingestor.js` to call the new API client instead of (or alongside) the old Puppeteer scrapers. Keep the old scrapers as a commented-out fallback. | 30min | `ingestJobs()` populates the database with real job listings from the API. |
| **9B.5** | Remove the `mockInternships` and `mockIndeedJobs` hardcoded arrays from both scraper files. Instead, if the API fails, return an empty array `[]` (no silent fake data). | 20min | When the API is down, `ingestJobs()` logs a warning and returns `{ totalProcessed: 0 }`. No fake jobs are inserted. |
| **9B.6** | Add the API key/config to `.env` and `.env.example`. Run full ingestion test and verify jobs appear in MongoDB. | 30min | `node -e "require('./utils/ingestor').ingestJobs()"` inserts real jobs. Verified via MongoDB shell. |
| **9B.7** | Run the full agent pipeline (`runDailyMatchingAgent`) end-to-end with real API jobs and verify real matches appear on the Job Dashboard. | 30min | Dashboard shows real job cards with real company names, real apply links, and real AI-generated match scores. |

---

### Phase 9C: Replace Mock Payments with Real Razorpay Integration (SHELVED)

**Status:** Shelved (Pivoted to Freemium model; matching is free for all onboarded candidates).

---

### Phase 9D: Configure Real Email Delivery (SHELVED)

**Status:** Shelved (Pivoted to in-app matches dashboard only; matches appear on the Job Hunting dashboard page and will not be dispatched to user email).

---

### Execution Order Summary

```
Status       Phase    What It Fixes                        Outcome
─────────────────────────────────────────────────────────────────────
✓ COMPLETED   9A      Remove fake job cards from dashboard    Successful
✓ COMPLETED   9B      Replace scrapers with real job API      Successful (JSearch API)
✗ SHELVED     9C      Add real Razorpay payments              Pivoted to Freemium
✗ SHELVED     9D      Send real emails                        Pivoted to In-App Only
```

> **Rule:** Complete each phase fully (all sub-tasks) before moving to the next. Phase 9A must be done first because it's the most visible user-facing bug.
