# AssessHub — AI-Powered Student Assessment Platform

> One platform for **all types of student assessments** — academic exams, placement preparation, competitive test practice, and skill evaluations.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://prisma.io)
[![Claude AI](https://img.shields.io/badge/Claude-AI-orange)](https://anthropic.com)

---

## What It Does

AssessHub lets teachers/admins build a **knowledge base** (paste notes, textbook chapters, course material), then have **Claude AI automatically generate quizzes** from that content. Students take the quiz with a live timer, and the platform instantly **evaluates MCQs and AI-grades descriptive answers**, then generates a comprehensive **assessment report** with topic-wise analysis, grade, readiness score, strengths, weaknesses, and personalised recommendations.

### Use Cases
| Type | Examples |
|---|---|
| Academic | Mid-terms, end-sems, unit tests, lab vivas |
| Placement Prep | Aptitude, DSA, core subjects, HR rounds |
| Competitive | GATE, GRE, UPSC, JEE mock tests |
| Skill | Coding, design, soft skills, domain knowledge |

---

## Features

- **AI Question Generation** — Claude generates MCQ and/or descriptive questions from any knowledge base
- **Two Question Types** — MCQ (auto-graded) and Descriptive (AI-evaluated with detailed feedback)
- **Timed Quizzes** — Countdown timer, auto-submit on expiry, answer auto-saved
- **Quiz Scheduling** — Set a future date/time; quiz activates automatically
- **Smart Reports** — Score, grade, topic-wise radar chart, placement/readiness %, strengths, weaknesses, recommendations
- **Admin Dashboard** — Manage knowledge bases, quizzes, view all student performance & analytics
- **Student Dashboard** — Attempt quizzes, track progress over time, view all reports
- **Role-based Access** — Separate flows for Admin and Student with JWT auth

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Database | PostgreSQL 16 + Prisma ORM |
| Auth | NextAuth.js (JWT strategy) |
| AI | Anthropic Claude API |
| Charts | Recharts |
| Styling | Tailwind CSS |
| Deployment | Docker + docker-compose |

### Software Design (SOLID / DRY)

| File | Principle |
|---|---|
| `src/lib/api-response.ts` | Single source for all HTTP response helpers |
| `src/lib/auth-guard.ts` | Single source for auth & role enforcement |
| `src/lib/route-handler.ts` | Open/Closed — wraps any handler with error boundaries |
| `src/lib/scoring.ts` | Pure function, no side-effects, fully testable |
| `src/lib/anthropic.ts` | Interface Segregation — separate functions per AI task |

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ running locally

### 1. Clone & Install
```bash
git clone https://github.com/shwetacse/assessment-platform.git
cd assessment-platform
npm install --legacy-peer-deps
```

### 2. Environment Variables
```bash
cp .env.example .env.local
```
Edit `.env.local`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/assessment_platform"
NEXTAUTH_SECRET="any-random-32-char-string"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-your-key-here"
```
Get your Claude API key at: https://console.anthropic.com

### 3. Database Setup
```bash
npm run db:push      # create tables
npm run db:seed      # load demo admin + student + sample quiz
```

### 4. Run
```bash
npm run dev
```
Open http://localhost:3000

**Demo accounts (created by seed):**
| Role | Email | Password |
|---|---|---|
| Admin | admin@placeprep.com | admin123 |
| Student | student@placeprep.com | student123 |

---

## Docker Deployment (Production)

### 1. Set secrets
```bash
cp .env.example .env
# Fill in ANTHROPIC_API_KEY and set a strong NEXTAUTH_SECRET
```

### 2. Build & start
```bash
docker-compose up -d --build
```

### 3. First-time database setup
```bash
docker-compose exec app npx prisma db push
docker-compose exec app npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

App will be live at http://localhost:3000

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login, register     # Public auth pages
│   ├── admin/                     # Admin-only pages (dashboard, KB, quizzes, students, analytics)
│   ├── student/                   # Student-only pages (dashboard, quiz-taking, reports)
│   └── api/                       # REST API routes
│       ├── auth/                  # NextAuth handler
│       ├── register/              # User registration
│       ├── knowledge-base/        # CRUD for knowledge bases
│       ├── quizzes/               # CRUD + AI generation + enroll
│       ├── attempts/              # Start / save-answer / submit
│       ├── reports/               # Fetch assessment reports
│       └── admin/                 # Admin stats & student list
├── components/
│   ├── ui/                        # Button, Card, Badge, Input, Modal, Progress, Spinner
│   ├── layout/                    # AdminSidebar, StudentSidebar
│   └── charts/                   # PerformanceLineChart, TopicRadarChart
└── lib/
    ├── auth.ts                    # NextAuth configuration
    ├── auth-guard.ts              # requireAuth / requireAdmin / requireStudent
    ├── api-response.ts            # ok / created / unauthorized / notFound / …
    ├── route-handler.ts           # withErrorHandling HOF
    ├── anthropic.ts               # generateQuestions / evaluateAnswer / generateReport
    ├── scoring.ts                 # buildTopicAnalysis (pure function)
    ├── db.ts                      # Prisma singleton
    └── utils.ts                   # formatDate / getGrade / cn / …
```

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/register` | Public | Register new user |
| GET | `/api/knowledge-base` | Any | List knowledge bases |
| POST | `/api/knowledge-base` | Admin | Create knowledge base |
| GET | `/api/quizzes` | Any | List quizzes |
| POST | `/api/quizzes` | Admin | Create quiz |
| POST | `/api/quizzes/[id]/generate` | Admin | AI-generate questions |
| POST | `/api/attempts` | Student | Start quiz attempt |
| PATCH | `/api/attempts/[id]` | Student | Save answer |
| POST | `/api/attempts/[id]/submit` | Student | Submit & evaluate |
| GET | `/api/reports/[id]` | Any | Get assessment report |
| GET | `/api/admin/stats` | Admin | Dashboard statistics |
| GET | `/api/admin/students` | Admin | All students + performance |

---

## License
MIT
