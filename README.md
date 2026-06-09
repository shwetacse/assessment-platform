# PlacePrep — AI-Powered Placement Assessment Platform

A full-stack assessment platform that generates quizzes from knowledge bases using Claude AI, evaluates answers automatically, and provides detailed placement readiness reports.

## Features

- **AI Question Generation** — Claude AI generates MCQ and descriptive questions from your knowledge base
- **Dual Quiz Types** — MCQ (auto-graded), Descriptive (AI-evaluated), or Mixed
- **Quiz Scheduling** — Schedule quizzes for future dates
- **Timed Assessments** — Countdown timer with auto-submit
- **AI Evaluation** — Descriptive answers are evaluated by Claude with detailed feedback
- **Smart Reports** — Topic-wise analysis, grade, placement readiness score, and recommendations
- **Admin Dashboard** — Manage knowledge bases, quizzes, and view all student performance
- **Student Dashboard** — Track progress, attempt quizzes, view reports

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **AI**: Anthropic Claude API (question generation + answer evaluation)
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Deployment**: Docker + docker-compose

---

## Quick Start

### 1. Clone & Install

```bash
cd placement-assessment-platform
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/placement_platform"
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

### 3. Database Setup

```bash
# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo Credentials:**
- Admin: `admin@placeprep.com` / `admin123`
- Student: `student@placeprep.com` / `student123`

---

## Docker Deployment

### 1. Set Environment Variables

```bash
cp .env.example .env
# Edit .env with your values
```

### 2. Build and Run

```bash
# Start database + app
docker-compose up -d

# First time: run migrations + seed
docker-compose --profile setup run migrate
```

### 3. Access

Open [http://localhost:3000](http://localhost:3000)

---

## Admin Workflow

1. **Register/Login** as Admin
2. Go to **Knowledge Base** → Add study material (paste notes/textbook content)
3. Go to **Quizzes** → Create new quiz, select knowledge base, set type (MCQ/Descriptive/Mixed)
4. **Generate Questions** with AI — Claude generates questions automatically
5. **Schedule** the quiz or publish immediately
6. Students see active quizzes, attempt them, get instant AI-evaluated reports
7. Admin sees all performance in **Analytics** tab

## Student Workflow

1. **Register/Login** as Student
2. **Dashboard** shows available quizzes and performance trends
3. Click **Start Quiz** → read instructions → timer begins
4. Answer MCQ/Descriptive questions, auto-saved
5. Submit → AI evaluates descriptive answers
6. View detailed **Assessment Report** with:
   - Score, grade, placement readiness %
   - Topic-wise performance radar chart
   - Strengths, weaknesses, recommendations
   - Answer review with AI feedback

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login, register     # Auth pages
│   ├── admin/                     # Admin pages
│   ├── student/                   # Student pages  
│   └── api/                       # REST API routes
├── components/
│   ├── ui/                        # Reusable UI components
│   ├── layout/                    # Sidebars
│   └── charts/                    # Recharts components
└── lib/
    ├── auth.ts                    # NextAuth config
    ├── db.ts                      # Prisma client
    ├── anthropic.ts               # Claude AI functions
    └── utils.ts                   # Utilities
```

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| GET/POST | `/api/knowledge-base` | List/Create knowledge bases |
| GET/POST | `/api/quizzes` | List/Create quizzes |
| POST | `/api/quizzes/[id]/generate` | AI question generation |
| POST | `/api/attempts` | Start quiz attempt |
| PATCH | `/api/attempts/[id]` | Save answer |
| POST | `/api/attempts/[id]/submit` | Submit & evaluate |
| GET | `/api/reports/[id]` | Get assessment report |
| GET | `/api/admin/stats` | Admin dashboard stats |
| GET | `/api/admin/students` | All students performance |
