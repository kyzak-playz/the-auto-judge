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

## Environment Variables

Create `apps/frontend/.env.local` with only public Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_SB_PUBLISHABLE_KEY=sb_publishable_<your_key>
```

Keep all secret/service-role keys in backend-only environment files.

## Public Data Access

- The shared Supabase client lives in `src/lib/supabase.ts`.
- The home page public problems section fetches live problem rows with that client.
- Keep frontend reads limited to public data only; privileged operations stay backend-side.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn-compatible setup (manual config)

## Notes

- Source code lives under `src/`.
- The current base UI uses a dark-theme baseline.
