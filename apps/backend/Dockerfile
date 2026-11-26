# ==========================================
# Stage 1: Builder (has uv + build caches)
# ==========================================
FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim AS builder

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/opt/venv

WORKDIR /app

# Install dependencies into /opt/venv using a BuildKit cache mount
# (keeps downloaded wheels out of the image layer completely)
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --no-install-project


# ==========================================
# Stage 2: Runtime (lean Python image only)
# ==========================================
FROM python:3.14-slim-bookworm AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# 1. Create non-root user
RUN useradd -m -s /bin/bash appuser

# 2. Copy the pre-built virtual environment from builder
COPY --from=builder --chown=appuser:appuser /opt/venv /opt/venv

# 3. Copy application code directly with appuser ownership
COPY --chown=appuser:appuser alembic.ini ./
COPY --chown=appuser:appuser alembic ./alembic
COPY --chown=appuser:appuser app ./app

# 4. Drop root privileges
USER appuser

EXPOSE 8000

# Consider dropping `uv run` and `--reload` in production for performance and security reasons.
# Use `uv run` with `--reload` only in development environments.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]