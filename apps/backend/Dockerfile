FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_PROJECT_ENVIRONMENT=/opt/venv \
    PATH="/opt/venv/bin:$PATH" \
    UV_CACHE_DIR=/home/appuser/.cache/uv

WORKDIR /app

# 1. Install dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

# 2. Install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | sh -s -- \
    && mv /root/.local/bin/uv /usr/local/bin/uv

# 3. Create non-root user and pre-create target directories with appuser permissions
RUN useradd -m -s /bin/bash appuser \
    && mkdir -p /opt/venv /home/appuser/.cache/uv \
    && chown -R appuser:appuser /opt/venv /app /home/appuser

# 4. Switch to appuser BEFORE syncing or copying files
USER appuser

# 5. Copy dependency definitions and sync as appuser
COPY --chown=appuser:appuser pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# 6. Copy application code with correct ownership directly
COPY --chown=appuser:appuser alembic.ini ./
COPY --chown=appuser:appuser alembic ./alembic
COPY --chown=appuser:appuser app ./app

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
