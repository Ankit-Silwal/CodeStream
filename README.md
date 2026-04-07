# CodeStream

CodeStream is a collaborative coding workspace built as a Turborepo monorepo with:

- `apps/web`: Next.js frontend
- `apps/api`: Express + Socket.IO backend
- `apps/worker`: BullMQ worker for background snapshot persistence
- `packages/shared`: shared Postgres and Redis clients
- `packages/ui`: shared UI components

## Tech Stack

- Node.js 18+
- TypeScript
- Turborepo
- Next.js (App Router)
- Express + Socket.IO
- PostgreSQL
- Redis + BullMQ

## Monorepo Layout

```text
apps/
	api/      Backend REST + socket server (port 5000)
	web/      Frontend app (port 3000)
	worker/   Queue worker for code snapshot saves
packages/
	shared/   DB/Redis connection layer
	ui/       Shared components
	eslint-config/
	typescript-config/
```

## Prerequisites

1. Node.js `>=18`
2. npm (workspace root uses `npm@11.6.1`)
3. Docker (recommended for local Postgres + Redis)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Start infrastructure:

```bash
docker compose up -d
```

This starts:

- Redis at `localhost:6969`
- Postgres at `localhost:2222`

3. Configure environment variables.

At minimum, backend/services require:

```env
PORT=5000
FPORT=3000

JWT_SECRET=your-jwt-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

DB_URL=postgresql://postgres:postgres@localhost:2222/codestream
REDIS_URL=redis://localhost:6969
```

4. Start all apps in dev mode:

```bash
npm run dev
```

## Useful Commands

From repo root:

- `npm run dev`: run all dev tasks through Turborepo
- `npm run build`: build all packages/apps
- `npm run lint`: lint all packages/apps
- `npm run check-types`: run type checks across workspace
- `npm run format`: run Prettier over ts/tsx/md files

Target a specific app using Turbo filters:

```bash
npx turbo run dev --filter=web
npx turbo run dev --filter=api
npx turbo run dev --filter=worker
```

## Runtime Architecture

1. User authenticates with Google via backend `/auth/google`.
2. Backend redirects to frontend with JWT query token.
3. Frontend includes JWT in `Authorization: Bearer <token>` for protected REST calls.
4. For collaboration, frontend joins a room over Socket.IO.
5. Backend applies code changes to Redis and emits updates to room participants.
6. Worker consumes BullMQ jobs and persists snapshot versions into Postgres.

## API and Schema Docs

- REST and socket details: `docs.md`
- SQL schema reference: `apps/api/table.md`

## Notes

- CORS is currently permissive (`origin: "*"`) for local development.
- Authentication is required for all `/room` REST endpoints.
