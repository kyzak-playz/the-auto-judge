# The Auto Judge ⚖️
**An Intelligent Code Evaluation Platform**

Developed as a final-year project for the Bachelor of Computer Applications (BCA) program, **The Auto Judge** is a scalable, asynchronous system designed to securely execute, evaluate, and provide AI-driven feedback on student code submissions.

## 🚀 Features
* **Secure Sandbox Execution:** Safely runs untrusted code in isolated Docker containers.
* **Asynchronous Processing:** Utilizes a Redis task queue to handle multiple submissions without blocking the API.
* **Intelligent Feedback:** Integrates with the Gemini API to provide students with structured code reviews, time complexity analysis, and contextual hints.
* **Robust Authentication:** Server-side auth flow managed by FastAPI and Supabase to ensure high security.
* **Interactive UI:** A highly responsive frontend built with modern web standards.

## 💻 Technology Stack
* **Frontend:** Next.js (App Router), React, Tailwind CSS
* **Backend Gateway:** FastAPI (Python)
* **Execution Engine:** Python Workers, Docker
* **Task Queue:** Redis
* **Database & Auth:** Supabase (PostgreSQL)
* **AI Integration:** Google Gemini API

## 📂 Project Structure (Monorepo)
This project is structured as a monorepo to separate the serverless frontend from the stateful backend execution environment.

```text
the-auto-judge/
├── apps/
│   ├── frontend/       # Next.js UI (Deployed via Vercel)
│   └── backend/        # FastAPI Gateway & API endpoints (Deployed via VPS)
├── docker/             # Dockerfiles for the isolated execution sandbox
├── docs/               # Architecture diagrams (DFDs, ERD) and project reports
└── README.md
```
## 🛠️ Getting Started
Status: Currently in active development (Sprint 1).