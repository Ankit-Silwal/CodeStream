# CodeStream API and Socket Documentation

This file documents the backend behavior implemented in `apps/api`.

Base URL (local): `http://localhost:5000`

## Health

### GET `/health`

Response:

```json
{
  "success": true
}
```

## Authentication Routes

Base path: `/auth`

### GET `/auth/google`

Starts Google OAuth flow with scopes `profile` and `email`.

### GET `/auth/google/callback`

Handles OAuth callback and redirects to frontend with a JWT query param:

`http://localhost:<FPORT>?token=<JWT_TOKEN>`

### GET `/auth/me`

Requires header: `Authorization: Bearer <token>`

Response:

```json
{
  "message": "You are authenticated ",
  "user": {
    "id": "...",
    "email": "...",
    "name": "..."
  }
}
```

## Room Routes

Base path: `/room`

All room routes require a valid Bearer token.

### POST `/room/`

Create room.

Request body:

```json
{
  "name": "My Code Room",
  "language": "java",
  "is_private": false
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "id": "room-uuid",
    "name": "My Code Room"
  }
}
```

### DELETE `/room/`

Leave room.

Request body:

```json
{
  "roomId": "room-uuid"
}
```

Notes:

- Room owners cannot leave until ownership is transferred.

### POST `/room/add`

Add member.

Request body:

```json
{
  "roomId": "room-uuid",
  "targetUserId": "user-uuid",
  "role": "editor"
}
```

Notes:

- For private rooms, only owner can add members.

### POST `/room/changeOwner`

Transfer ownership.

Request body:

```json
{
  "roomId": "room-uuid",
  "newOwnerId": "user-uuid"
}
```

## Socket Events

Socket server shares the same host/port as backend (`http://localhost:5000`).

### Client -> Server

- `join-room`

```json
{
  "roomId": "room-uuid",
  "userId": "user-uuid"
}
```

- `code-update`

```json
{
  "roomId": "room-uuid",
  "code": "...latest source..."
}
```

- `leave-room`

```json
{
  "roomId": "room-uuid",
  "userId": "user-uuid"
}
```

### Server -> Client

- `init-code`

```json
{
  "code": "...current room code...",
  "version": 1
}
```

- `code-update`

```json
{
  "code": "...updated room code...",
  "version": 2
}
```

- `user-joined`

```json
{
  "userId": "user-uuid",
  "message": "A new user joined the room"
}
```

- `user-left`

```json
{
  "userId": "user-uuid"
}
```

- `error`

```json
{
  "message": "Error description"
}
```

## Persistence Flow (Code Sync)

1. `code-update` is validated and applied to Redis.
2. Backend emits latest code payload to other room clients.
3. A debounced BullMQ job (`code-save`) is queued.
4. Worker writes snapshot to `room_snapshots` with version checks.

## Related Docs

- Database schema: `apps/api/table.md`
- Project setup: `README.md`
