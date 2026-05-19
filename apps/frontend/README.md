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

## Authentication & Proxy (May 2026)

- The frontend now includes a complete authentication UI and client-side flows: login, sign-in, and profile components live under `src/components/shared/` and `src/components/shared/profile/`.
- Client hooks and helpers are in `src/hooks/` and `src/lib/` (for example `useAuthGuard.ts`, `useClientFetch.ts`, and `client-fetch.ts`).
- Actions for auth flows live in `src/actions/` (`authenticate-user.ts`, `refresh-session.ts`, `refresh-token.ts`, `logout.ts`).
- A lightweight local proxy helper was added at `src/proxy.ts` to simplify API requests that rely on HTTP-only cookies (used by `/api/refresh` and `/api/logout` routes).

When testing locally, run the frontend as usual (`pnpm dev`) and verify the end-to-end auth flows against the backend Compose stack.

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
