# CodeStream

CodeStream is a secure coding assessment platform built as a Turborepo monorepo. It supports teacher-created exams, MCQ and LeetCode-style coding questions, paste penalties, candidate monitoring, and C/C++/Python/Java coding attempts.

The repository includes:

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

## Product Areas

### Dashboard

Path: `/dashboard`

The dashboard is the assessment control center. It shows active exams, total questions, total marks, enabled security controls, and quick actions for opening the teacher section or starting an exam.

### Teacher Section

Path: `/teacher`

Teachers can:

- Create exams with a title and duration.
- Add MCQ questions with selectable correct answers.
- Add coding questions with points, paste penalty, expected time complexity, expected space complexity, and test cases.
- Enable languages: C, C++, Python, and Java.
- Import LeetCode-style question metadata from a LeetCode problem URL.
- Review recent submissions with raw score, penalty, and final score.

### Student Exam Attempt

Path: `/exam/[examId]`

Students can:

- Answer MCQ questions.
- Solve coding questions in C, C++, Python, or Java.
- View visible test cases and complexity expectations.
- Finish the exam and receive a penalty-adjusted score summary.

## Scoring and Penalty Rules

Each question has:

- `points`: maximum marks.
- `penalty`: marks deducted if paste/copy activity is detected for that question.

Example: if a coding question is worth `10` marks and the teacher sets a paste penalty of `4`, a correct answer with paste activity receives `6` marks.

Final score is calculated as:

```text
final question score = max(0, points - paste penalty)
```

This deduction is applied only when the answer is otherwise correct/submitted and paste activity exists for that question.

## Exam Security

The platform records candidate behavior during attempts:

- Paste/copy detection with warning on every paste.
- Typing-speed spike detection.
- Tab-switch detection through page visibility changes.
- Fullscreen-exit detection.
- Security event log saved with each attempt.

The backend also includes baseline protections:

- Request rate limiting.
- Security headers.
- JSON body size limit.
- JSON-only enforcement for mutating routes.
- Restricted CORS through `CORS_ORIGIN`.
- Disabled Express `x-powered-by` fingerprinting.

These controls reduce abuse and accidental overload, but production deployments should still use infrastructure-level DoS protection such as a CDN/WAF, reverse-proxy rate limits, container resource limits, database connection limits, and centralized logging.

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
npm run infra:up
```

This starts:

- Redis at `localhost:6379`
- Postgres at `localhost:5432`

3. Configure environment variables.

At minimum, backend/services require:

```env
PORT=5000
FPORT=3000

JWT_SECRET=your-jwt-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

DB_URL=postgresql://postgres:postgres@localhost:5432/codestream
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000
API_RATE_LIMIT_PER_MINUTE=120
```

4. Start all apps in dev mode:

```bash
npm run dev
```

## Useful Commands

From repo root:

- `npm run dev`: run all dev tasks through Turborepo
- `npm run infra:up`: start Redis and Postgres for local dev
- `npm run infra:down`: stop the Docker Compose stack
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
4. Teachers create exams and questions through `/teacher`.
5. Students attempt exams through `/exam/[examId]`.
6. Paste, tab-switch, fullscreen, and typing-speed events are tracked during the attempt.
7. Submitted attempts include raw score, penalty score, final score, answers, and security events.

Legacy collaboration room APIs and sockets are still present in the backend, but the main user flow now focuses on secured assessments.

## API and Schema Docs

- REST and socket details: `docs.md`
- SQL schema reference: `apps/api/table.md`

## Notes

- Authentication is required for `/room` and `/exams` REST endpoints.
- LeetCode import depends on public LeetCode GraphQL availability. Hidden judge tests are not publicly available; teachers should add or review hidden tests manually.
