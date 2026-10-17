# Backend App

This is the FastAPI backend for The Auto Judge.


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
