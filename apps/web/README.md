# Web App (`apps/web`)

Next.js frontend for CodeStream collaborative coding.

## Run Locally

From workspace root:

```bash
npm run dev
```

Or only the web app:

```bash
npx turbo run dev --filter=web
```

Default URL: `http://localhost:3000`

## Scripts

- `npm run dev`: start Next dev server on port 3000
- `npm run build`: production build
- `npm run start`: serve production build
- `npm run lint`: lint source
- `npm run check-types`: generate Next types and run TypeScript checks

## Collaboration Flow

- Web client connects to Socket.IO backend at `http://localhost:5000` (`lib/socket.ts`).
- It joins a room with `join-room` payload:

```json
{
	"roomId": "room-uuid",
	"userId": "user-uuid"
}
```

- Initial code arrives via `init-code` payload and live updates via `code-update` payload.
- Editor changes emit `code-update`:

```json
{
	"roomId": "room-uuid",
	"code": "..."
}
```

## Auth Integration

- After OAuth redirect, frontend reads `token` from query and/or local storage.
- Protected API requests use:

`Authorization: Bearer <token>`

## Key Paths

- `app/page.tsx`: landing page
- `app/test/page.tsx`: collaborative editor test page
- `lib/socket.ts`: Socket.IO client singleton
