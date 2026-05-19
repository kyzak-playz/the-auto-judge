# Backend App

This is the FastAPI backend for The Auto Judge.

## Current Implementation Notes

- Backend startup uses FastAPI lifespan for runtime config validation and a database connectivity check.
- Auth routes are implemented under `app/api/v1/auth/` and mounted at `/api/v1/auth`.
- Auth uses Supabase Python SDK with refresh-token cookies managed by FastAPI response headers.
- The root Compose stack starts backend API, Redis, and Celery worker for local development.

### Recent changes (May 2026)

- Added `app/middleware/authentication.py` — middleware to validate tokens and extract user context during request processing.
- Introduced `app/exceptions.py` and registered centralized HTTP/validation exception handlers in `app/main.py` to normalize error shapes returned by the API.
- Auth endpoints (`login`, `signup`, `refresh`, `logout`) were updated to use the new error shapes and to raise `HttpException` where appropriate.

Please validate auth flows (login/refresh/logout) locally after updating environment variables.

## Authentication Implementation Caveats

The current auth implementation is intentionally basic and has known constraints:

- Supabase Python SDK is not a very natural fit for fully stateless backend auth flows.
- Logout currently creates a temporary in-memory session from incoming tokens before signout, because SDK signout relies on session state currently loaded in client memory.
- A shared global Supabase auth client is avoided because user context can override client state.
- Auth handlers currently create a new Supabase client per request as a safer isolation tradeoff.
- The per-request client strategy is expected to be acceptable for now, but should be validated with load tests.

## Backend Folder Layout

```text
apps/backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── auth/
│   │           ├── __init__.py
│   │           ├── signup.py
│   │           ├── login.py
│   │           ├── refresh.py
│   │           └── logout.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── supabase_client.py
│   ├── models/
│   ├── schemas/
│   │   └── auth_schema.py
│   ├── services/
│   ├── workers/
│   └── main.py
├── tests/
├── Makefile
├── pyproject.toml
└── README.md
```

## Local Run (Backend Only)

From `apps/backend`:

```bash
make dev
```

Equivalent command:

```bash
uv run uvicorn app.main:app --reload
```

## Local Run With Docker Compose

From the repository root:

```bash
docker compose up --build
```

The backend and worker services read `apps/backend/.env.local` through Compose and mount backend source for live reload. Redis is available as `redis://redis:6379/0` inside the Compose network.

## Environment Variables

Required backend variables:

```env
DATABASE_URI=postgresql://user:password@host:5432/dbname
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET=<supabase-secret>
SUPABASE_ANON_KEY=<supabase-anon-key>
```

For local Compose development, keep these values in `apps/backend/.env.local`.

## Models and Migrations

- SQLModel table definitions live under `app/models/`.
- Alembic is configured in `apps/backend/alembic`.
- Initial schema migration: `0f1be5216f30_create_initial_schema_models.py`.
- Initial RLS migration: `bf3f1bab7a24_add_initial_rls_policies.py`.

From `apps/backend`:

```bash
uv run python -m alembic revision -m "describe change"
uv run python -m alembic upgrade head
uv run python -m alembic downgrade -1
```
