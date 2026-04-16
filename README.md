# The Auto Judge ⚖️

**An Intelligent Code Evaluation Platform**

> Developed as a final-year project for the Bachelor of Computer Applications (BCA) program.

**The Auto Judge** is a scalable, asynchronous platform that securely executes student code submissions, scores them against predefined test cases, and delivers structured AI-driven feedback and contextual hints via the Gemini API — all without blocking the API or exposing the host system.

---

## 🚀 Features

| Feature                      | Description                                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Secure Sandbox Execution** | Untrusted code runs inside ephemeral, network-isolated Docker containers with strict CPU, memory, and time limits         |
| **Asynchronous Processing**  | Submissions are queued via Redis and processed by Celery workers, keeping the API non-blocking and horizontally scalable  |
| **AI-Powered Feedback**      | Gemini API provides structured code reviews, time-complexity analysis, and contextual hints without spoiling the solution |
| **Hint System**              | Students can request contextual hints per submission; hint usage is tracked and limited per submission                    |
| **Role-Based Access**        | Students submit and view results; Admins/Teachers manage problems, test cases, and review performance reports             |
| **Robust Authentication**    | HTTP-Only cookies issued by FastAPI; hybrid bearer + refresh-cookie flow is deferred                                      |
| **Responsive UI**            | Modern, accessible interface built with Next.js, Tailwind CSS, and shadcn/ui components                                   |

---

## 💻 Technology Stack

| Layer                | Technology                                                                     |
| -------------------- | ------------------------------------------------------------------------------ |
| **Frontend**         | Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui               |
| **Backend**          | FastAPI (Python), SQLModel, psycopg3 (`psycopg[binary,pool]`)                  |
| **Task Queue**       | Celery + Redis                                                                 |
| **Execution Engine** | Docker isolated sandbox containers                                             |
| **Database**         | Supabase PostgreSQL (+ pgvector for future semantic search)                    |
| **Auth**             | FastAPI HttpOnly cookie flow now; hybrid bearer + refresh-cookie flow deferred |
| **AI Integration**   | Google Gemini API                                                              |
| **Frontend Hosting** | Vercel CDN                                                                     |
| **Backend Hosting**  | Dedicated VPS                                                                  |

---

## 🏗️ Architecture

The system follows an **async, event-driven architecture** on a dedicated VPS, with the frontend served globally via Vercel's CDN.

```
User Device → Vercel (Next.js) → FastAPI → Redis/Celery → Docker Sandbox
												 ↓                         ↓
									 Supabase (PostgreSQL)      Gemini API (AI Feedback)
```

See [docs/architecture.md](docs/architecture.md) for the full design breakdown, including DFD Level 0, DFD Level 1, ERD, deployment diagram, and security decisions.

---

## 📂 Project Structure

This project is a **monorepo** separating the stateless frontend from the stateful backend execution environment.

```text
the-auto-judge/
├── apps/
│   ├── frontend/       # Next.js UI — deployed via Vercel
│   └── backend/        # FastAPI gateway & API endpoints — deployed via VPS
├── docker/             # Dockerfiles for isolated execution sandboxes
├── docs/               # Architecture docs, DFD & ERD diagrams
│   ├── architecture.md
│   ├── CONTRIBUTING.md
│   └── diagrams/
└── README.md
```

---

## 🛠️ Getting Started

> **Status:** Active development — Sprint 1

This root README covers the shared project setup and local development flow. Detailed service-specific setup should live with each app so frontend and backend instructions can evolve independently.

### Prerequisites

Install these before working locally:

- Node.js and npm
- Python 3.11+
- Docker
- Docker Compose
- A Supabase project
- A Gemini API key

### Basic Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/kyzak-playz/the-auto-judge.git
   cd the-auto-judge
   ```
2. Prepare environment variables for both services:
   - frontend variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_SB_PUBLISHABLE_KEY`
   - backend variables: `DATABASE_URI`, Supabase URL, secret key, JWT signing key, and app/runtime settings
3. Make sure Docker is running before starting the backend stack with Docker Compose.
4. Use app-level package managers:
   - frontend (`apps/frontend`) uses `pnpm`
   - backend (`apps/backend`) will use `uv`

### Database Bootstrap Note

- Initial schema bootstrap is already applied using the first Alembic migration script from `apps/backend`.
- RLS policies are already applied in a follow-up Alembic migration.
- All future schema updates should continue through Alembic migrations.
- Backend startup now validates required runtime config and checks database connectivity during lifespan startup.
- Frontend public reads use the shared Supabase client and only expose publishable-key access.

### Local Development Flow

Use this order when running the system locally:

1. Start the backend services with Docker Compose
2. Start the Next.js frontend locally

The Docker Compose setup should run the backend components as separate services, such as the FastAPI API, Celery worker, Redis, and any other required backend dependency.

### Full Setup References

Keep detailed setup instructions inside each service directory:

- Frontend setup: `apps/frontend/README.md`
- Backend setup: `apps/backend/README.md`

Those app-level docs should contain dependency installation, environment variable details, and run commands specific to their own environments.

### Known Gaps

- The full Docker Compose local stack is still a milestone item, so the repository does not yet have a complete one-command backend orchestration flow.
- Full production auth hardening remains in progress; the docs should be treated as current-state guidance, not a finished release checklist.

---

## 🤝 Contributing

Contributions are welcome! Please read [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for branching conventions, commit message format, PR guidelines, and code style expectations before opening a PR.

---

## 📄 License

This project is licensed under the terms of the [LICENSE](LICENSE) file in the root of this repository.
