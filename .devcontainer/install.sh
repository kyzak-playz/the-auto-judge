#!/usr/bin/env bash
set -euo pipefail

echo ">>> Installing uv (Python package manager)..."
curl -LsSf https://astral.sh/uv/install.sh | sh
# Make uv available in the current shell
export PATH="$HOME/.local/bin:$PATH"
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc

echo ">>> Installing pnpm (Node.js package manager)..."
npm install -g pnpm
pnpm setup
source ~/.bashrc || true

echo ">>> Verifying installations..."
uv --version
pnpm --version

echo ">>> Dev environment setup complete."
