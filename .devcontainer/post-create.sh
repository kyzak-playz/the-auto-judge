#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"

echo "Installing frontend dependencies with pnpm..."
cd "$repo_root/apps/frontend"
pnpm install

echo "Installing backend dependencies with uv sync..."
cd "$repo_root/apps/backend"
uv sync

echo "Post-create setup complete."
