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
| **Robust Authentication**    | HTTP-Only session cookies issued by FastAPI + Supabase Auth — resistant to XSS-based token theft                          |
| **Responsive UI**            | Modern, accessible interface built with Next.js, Tailwind CSS, and shadcn/ui components                                   |

---

## 💻 Technology Stack

| Layer                | Technology                                                       |
| -------------------- | ---------------------------------------------------------------- |
| **Frontend**         | Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend**          | FastAPI (Python)                                                 |
| **Task Queue**       | Celery + Redis                                                   |
| **Execution Engine** | Docker isolated sandbox containers                               |
| **Database**         | Supabase PostgreSQL (+ pgvector for future semantic search)      |
| **Auth**             | Supabase Auth (HTTP-Only session cookies)                        |
| **AI Integration**   | Google Gemini API                                                |
| **Frontend Hosting** | Vercel CDN                                                       |
| **Backend Hosting**  | Dedicated VPS                                                    |

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

Detailed setup instructions will be added as the project stabilises. For now:

1. Clone the repository:
   ```bash
   git clone https://github.com/kyzak-playz/the-auto-judge.git
   cd the-auto-judge
   ```
2. Copy and populate environment variables for both `apps/frontend` and `apps/backend` (`.env.example` files coming soon).
3. See each app's README for service-specific setup instructions.

---

## 🤝 Contributing

Contributions are welcome! Please read [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for branching conventions, commit message format, PR guidelines, and code style expectations before opening a PR.

---

## 📄 License

This project is licensed under the terms of the [LICENSE](LICENSE) file in the root of this repository.
