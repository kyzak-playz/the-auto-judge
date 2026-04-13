# Backend App

This is the FastAPI backend scaffold for The Auto Judge.

## Current Implementation Notes

- Server check endpoint is currently `GET /` and returns a simple Hello world response.
- Temporary test auth route exists at `POST /signin` in `app/api/v1/auth/sigin.py` and will be removed when concrete auth implementation begins.
- Data layer direction is SQLModel with PostgreSQL hosted on Supabase.
- Database driver choice is `psycopg[binary,pool]` (modern psycopg3 driver with pooling support).
- Redis is included for queue/runtime integration.
- Celery folder is scaffolded now; task definitions will be added when worker flows are implemented.
- Current auth implementation target is HttpOnly cookie-based flow; hybrid bearer + refresh-cookie flow remains documented as a deferred option.

## Backend Folder Plan

The backend is structured to keep API, business logic, schemas, and async worker code separated from day one.

```text
apps/backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── auth/
│   │           └── sigin.py
│   ├── core/
│   ├── services/
│   ├── schemas/
│   ├── workers/
│   └── main.py
├── tests/
├── pyproject.toml
└── README.md
```

## Folder Responsibilities

- `app/main.py`
  - FastAPI app entrypoint.
  - Includes routers and global app setup.

- `app/api/v1/`
  - Versioned HTTP route handlers.
  - Keep handlers thin and delegate real logic to `services/`.

- `app/core/`
  - Core shared pieces such as settings, constants, and security helpers.

- `app/services/`
  - Business logic layer used by API routes and workers.

- `app/schemas/`
  - Pydantic request/response models.

- `app/workers/`
  - Celery tasks and queue orchestration (submission execution pipeline).

- `tests/`
  - Unit and integration tests for routes, services, and worker behavior.

## Minimal Endpoint Included

A minimal GET endpoint is already created:

- `GET /` → returns:

```json
{
  "message": "Hello world"
}
```

## Local Run (Backend Only)

From `apps/backend`:

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then open `http://localhost:8000/`.

## Backend Dependency Decisions

- `sqlmodel`
  - Selected as the ORM/data-model layer for clean SQLAlchemy-based development with typed models.

- `psycopg[binary,pool]`
  - Selected as the PostgreSQL driver for new projects using psycopg3 features and connection pooling support.

- `redis`
  - Included as queue/message infrastructure for Celery integration.

## Data Access Boundary

- The backend uses SQLModel + PostgreSQL connectivity to the Supabase-hosted database.
- Supabase Python SDK is not the primary data-access path in this backend scaffold.

## Models and Migrations

- SQLModel table definitions now live under `app/models/` with one table per file:
  - `user.py`
  - `problem.py`
  - `submission.py`
  - `result.py`
- Shared enums are defined in `app/models/enums.py`.
- Alembic is initialized in `apps/backend/alembic` for migration-based schema changes.
- Initial schema has been applied in Supabase successfully using the first migration script (`0f1be5216f30`).

## Environment Variables

Current required backend variable:

```env
DATABASE_URI=postgresql://user:password@host:5432/dbname
```

Supabase auth and key variables are documented in the temporary setup plan and will be enforced in settings during concrete auth implementation.

### Migration Commands

From `apps/backend`:

```bash
uv run python -m alembic revision -m "describe change"
uv run python -m alembic upgrade head
uv run python -m alembic downgrade -1
```
