# Frontend App

This is the Next.js frontend for The Auto Judge.

## Setup

From this directory (`apps/frontend`):

```bash
pnpm install
```

## Run

```bash
pnpm dev
```

The app runs on `http://localhost:3000` by default.

## Build

```bash
NODE_ENV=production pnpm build
```

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn-compatible setup (manual config)

## Notes

- Source code lives under `src/`.
- The current base UI uses a dark-theme baseline.
