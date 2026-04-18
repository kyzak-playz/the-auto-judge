# Architecture Overview

**The Auto Judge** is an intelligent, automated code evaluation platform designed for students and teachers. Students submit code solutions to programming problems; the system executes them in an isolated sandbox, scores them against test cases, and delivers AI-generated feedback and hints via the Gemini API.

---

## Table of Contents

1. [System Context (DFD Level 0)](#1-system-context-dfd-level-0)
2. [Deployment Architecture](#2-deployment-architecture)
3. [Data Flow (DFD Level 1)](#3-data-flow-dfd-level-1)
4. [Database Schema (ERD)](#4-database-schema-erd)
5. [Component Breakdown](#5-component-breakdown)
6. [Security Design](#6-security-design)
7. [Suggested Improvements & Missing Pieces](#7-suggested-improvements--missing-pieces)

---

## 1. System Context (DFD Level 0)

![ DFD Level 0](<diagrams/Auto Judge-DFD Level 0.jpg>)

At the highest level, the system has three external actors:

| Actor                          | Interactions                                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| **User (Student)**             | Sends login credentials and source code + Problem ID; receives evaluation results, score, and AI feedback |
| **Admin / Teacher**            | Sends admin login, test cases, and problems; receives student performance reports and student status logs |
| **AI Language Model (Gemini)** | Receives raw execution output and source code; returns structured intelligent code review and hints       |

---

## 2. Deployment Architecture

![ System Architecture](<diagrams/Auto Judge-Architecture.jpg>)

### Infrastructure Overview

```
User Device
    │
    ▼
Vercel CDN  ──── Next.js Frontend (SSR/SSG)
    │  REST API (HTTPS)
    ▼
┌──────────────────── Dedicated VPS ─────────────────────┐
│                                                         │
│  FastAPI Backend  ──► Celery Task Queue (Redis)         │
│        │                       │                        │
│        │               Worker Process                   │
│        │                       │                        │
│        │               Docker Sandbox                   │
│        │                                                │
│   SQL queries & Auth Validation                         │
└────────────────────────────────────────────────────────┘
         │
         ▼
   PostgreSQL + Supabase Auth
         │
         ▼               ◄──── Gemini API
   Result saved
```

### Authentication Flow

- User authenticates via the FastAPI backend.
- The current implementation uses an **HTTP-Only cookie** flow to keep tokens out of JavaScript.
- Hybrid bearer + refresh-cookie flow is documented as a future fallback option if cross-site reliability requires it.

### Code Execution Flow

1. Frontend submits source code + problem ID via REST API.
2. FastAPI validates the session, persists the submission, then **pushes a task** to the Celery queue backed by Redis.
3. A **Worker** picks up the task and spawns a **Docker Isolated Sandbox** to run the code against test cases.
4. Execution results (stdout, stderr, runtime) are returned to the Worker.
5. The Worker writes the evaluated result to PostgreSQL and optionally calls **Gemini API** for AI feedback.
6. The frontend polls or receives the result and displays it to the student.

---

## 3. Data Flow (DFD Level 1)

![ DFD Level 1](<diagrams/Auto Judge-DFD Level 1.jpg>)

### Processes

| Process ID | Name                 | Responsibility                                                                                                                       |
| ---------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **1.0**    | Auth Service         | Authenticates students and admins; reads/writes D1 User Store                                                                        |
| **2.0**    | Submission Handler   | Receives source code + problem ID from authenticated students; writes to D2 Submission Store; dispatches to 4.0                      |
| **3.0**    | Problem Manager      | Admin CRUD for problems and test cases; reads/writes D3 Problem Store; serves problem lists to students                              |
| **4.0**    | Evaluation Engine    | Runs code in Docker sandbox against test cases from D3; calculates score and execution time; writes to D4 Result Store; triggers 5.0 |
| **5.0**    | Intelligent Analysis | Sends source code + execution output to Gemini API; stores AI feedback JSON                                                          |
| **6.0**    | Hint Generator       | On student hint request (Problem ID), queries D4 Result Store and calls AI LM; returns contextual hint to student                    |

### Data Stores

| Store                   | Maps&nbsp;To       | Contents                                            |
| ----------------------- | ------------------ | --------------------------------------------------- |
| **D1** User Store       | `user` table       | Credentials, roles                                  |
| **D2** Submission Store | `submission` table | Source code, language, status, hints used           |
| **D3** Problem Store    | `problem` table    | Problem description, difficulty, test cases (JSONB) |
| **D4** Result Store     | `result` table     | Score, AI feedback JSON, execution time             |

---

## 4. Database Schema (ERD)

![ ERD](<diagrams/Auto Judge-ERD.jpg>)

### Tables

#### `user`

| Column     | Type                      | Constraint       |
| ---------- | ------------------------- | ---------------- |
| `user_id`  | UUID                      | PK               |
| `username` | VARCHAR                   | NOT NULL         |
| `email`    | VARCHAR                   | NOT NULL, UNIQUE |
| `role`     | ENUM (`student`, `admin`) | NOT NULL         |

#### `problem`

| Column        | Type                             | Constraint                                  |
| ------------- | -------------------------------- | ------------------------------------------- |
| `problem_id`  | UUID                             | PK                                          |
| `title`       | VARCHAR                          | NOT NULL                                    |
| `description` | TEXT                             |                                             |
| `difficulty`  | VARCHAR (`easy`/`medium`/`hard`) |                                             |
| `test_case`   | JSONB                            | Array of `{input, expected_output}` objects |

#### `submission`

| Column          | Type    | Constraint                                                                                    |
| --------------- | ------- | --------------------------------------------------------------------------------------------- |
| `submission_id` | UUID    | PK                                                                                            |
| `user_id`       | UUID    | FK → `user.id`                                                                                |
| `problem_id`    | UUID    | FK → `problem.id`                                                                             |
| `source_code`   | TEXT    |                                                                                               |
| `language`      | VARCHAR | e.g. `python`, `cpp`, `java`                                                                  |
| `status`        | VARCHAR | `pending` / `running` / `accepted` / `wrong_answer` / `runtime_error` / `time_limit_exceeded` |
| `hints_used`    | INTEGER | Default 0                                                                                     |

#### `result`

| Column          | Type    | Constraint                 |
| --------------- | ------- | -------------------------- |
| `result_id`     | UUID    | PK                         |
| `submission_id` | UUID    | FK → `submission.id`       |
| `score`         | INTEGER | 0–100                      |
| `ai_feedback`   | JSONB   | Structured Gemini response |
| `exec_time`     | FLOAT   | Seconds                    |

### Relationships

```
user ──< submission >── problem
              │
              └──< result
```

---

## 5. Component Breakdown

### Frontend — Next.js (TypeScript + Tailwind + shadcn/ui)

- **Deployment:** Vercel CDN (edge-cached, global distribution)
- **Responsibilities:** Problem listing, code editor (Monaco or CodeMirror), submission status polling, displaying AI feedback and hints, admin dashboard for problem management
- **Auth:** Reads session state via HTTP-Only cookie (no localStorage token storage)

### Backend — FastAPI (Python)

- **Deployment:** Dedicated VPS (e.g., DigitalOcean, Hetzner)
- **Responsibilities:** REST API, session validation, input sanitisation, task dispatching to Celery, proxying hint/feedback requests
- **Key endpoints:**
  - `POST /auth/login` — issues session cookie
  - `POST /submissions` — validates and queues submission
  - `GET /submissions/{id}` — polls result
  - `POST /hints` — triggers Hint Generator (6.0)
  - `GET /problems` — lists problems
  - `POST /problems` — admin creates problem (RBAC-guarded)

### Task Queue — Celery + Redis

- Redis acts as both the **broker** (task delivery) and the **result backend** (task state).
- Celery workers are horizontally scalable; multiple worker instances can run in parallel.

### Execution Sandbox — Docker

- Each submission runs in a **freshly spawned, ephemeral container** with:
  - No network access
  - Memory and CPU limits enforced
  - Time limit enforced (kill signal after deadline)
  - Read-only filesystem (code written to a tmpfs volume)
- Languages are pre-baked into sandbox images (Python, C++, Java, etc.)

### AI Layer — Gemini API

- Used by **5.0 Intelligent Analysis** for post-execution code review.
- Used by **6.0 Hint Generator** for contextual, non-spoiler hints.
- Prompt includes: problem description, student source code, execution output/errors, and a structured output schema (JSON) for downstream parsing.

### Database — Supabase (PostgreSQL)

- Supabase provides managed PostgreSQL with built-in **Row Level Security (RLS)** and Auth.
- Initial schema bootstrap was applied using the first Alembic migration script in the backend.
- Initial RLS posture is handled by a follow-up Alembic migration that enables RLS and adds public read access for `problem`.
- `pgvector` extension reserved for future semantic similarity search (e.g., finding similar past submissions or problems).

---

## 6. Security Design

| Concern                         | Mitigation                                                             |
| ------------------------------- | ---------------------------------------------------------------------- |
| Auth token theft (XSS)          | HTTP-Only session cookies; no token in `localStorage`                  |
| Code injection via submission   | Docker sandbox with no network, strict resource limits, read-only FS   |
| SQL injection                   | ORM / parameterised queries via SQLAlchemy                             |
| Unauthorised problem management | RBAC (`role` ENUM); FastAPI dependency checks role before admin routes |
| Rate abuse / DoS                | API rate limiting middleware (e.g., `slowapi`) on submission endpoint  |
| Secrets exposure                | Environment variables; never committed to source control               |

---

## 7. Suggested Improvements & Missing Pieces

The following are gaps or enhancements worth considering as the system matures:

| #   | Area                              | Suggestion                                                                                                                                             |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Leaderboard**                   | Add a `leaderboard` view or materialised table ranking students by score/problem count; useful for competitive contexts                                |
| 2   | **WebSocket / SSE**               | Replace submission polling with WebSocket or Server-Sent Events for real-time result push                                                              |
| 3   | **Observability**                 | Integrate structured logging (e.g., Loguru) and a monitoring stack (Sentry for errors, Prometheus + Grafana for metrics)                               |
| 4   | **CI/CD Pipeline**                | Add GitHub Actions workflows for linting, testing, building Docker images, and deploying to VPS                                                        |
| 5   | **Plagiarism Detection**          | Use `pgvector` embeddings to detect suspiciously similar submissions across students                                                                   |
| 6   | **Multi-language Sandbox Images** | Document how sandbox images are built and versioned; consider a sandbox image registry                                                                 |
| 7   | **Hint Budget**                   | `hints_used` is tracked but a hard limit policy (e.g., max 3 hints per submission) should be enforced at the API layer                                 |
| 8   | **Admin Analytics Dashboard**     | Student performance reports (DFD Level 0) need a dedicated analytics endpoint aggregating submission stats per student/problem                         |
| 9   | **Result Caching**                | Cache identical `(source_code_hash, problem_id)` pairs in Redis to avoid re-running duplicate submissions                                              |
| 10  | **Problem Versioning**            | `test_case` is a JSONB blob; if test cases change after submissions exist, historical results become inconsistent — consider a `problem_version` field |

### Current Implementation Gaps

These items are still intentionally incomplete in the repository and should remain documented as future work rather than implied as finished:

- Full production auth hardening and the broader auth rollout.
- Frontend orchestration is still separate; the current Compose stack only covers the backend API, Redis, and the Celery worker.
- Queue task definitions and job pipeline beyond the scaffolded Celery app.
- A dedicated backend health endpoint beyond lifespan startup validation.
- Key rotation and environment hygiene procedures for Supabase secrets.
- Any BFF-style Next.js proxy layer for cookie reliability.
