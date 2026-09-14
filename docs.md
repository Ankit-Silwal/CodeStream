# CodeStream API and Socket Documentation

This file documents the backend behavior implemented in `apps/api`.

Base URL (local): `http://localhost:5000`

Most protected routes require:

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

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

### GET `/room/all`

Get all rooms accessible to the authenticated user.

Success response:

```json
{
  "success": true,
  "data": [
    {
      "id": "room-uuid",
      "name": "My Code Room",
      "language": "java",
      "owner_id": "user-uuid"
    }
  ]
}
```

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

## Exam Routes

Base path: `/exams`

All exam routes require a valid Bearer token.

### GET `/exams`

List exams visible to the authenticated user. Teachers see exams they created, and active exams are visible for attempts.

Success response:

```json
{
  "success": true,
  "data": [
    {
      "id": "exam-uuid",
      "title": "Secure DSA Assessment",
      "duration_minutes": 75,
      "status": "active",
      "question_count": 2,
      "total_marks": 15
    }
  ]
}
```

### POST `/exams`

Create an exam with MCQ and coding questions.

Request body:

```json
{
  "title": "Secure DSA Assessment",
  "durationMinutes": 75,
  "status": "active",
  "allowedLanguages": ["c", "cpp", "python", "java"],
  "security": {
    "pastePenaltyEnabled": true,
    "fullscreenRequired": true,
    "tabSwitchWarnings": 3,
    "rateLimitPerMinute": 60
  },
  "questions": [
    {
      "title": "Two Sum",
      "type": "coding",
      "prompt": "Given nums and target, return indices...",
      "points": 10,
      "penalty": 4,
      "difficulty": "Easy",
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(n)",
      "starterCode": {
        "c": "...",
        "cpp": "...",
        "python": "...",
        "java": "..."
      },
      "testCases": [
        {
          "input": "nums = [2,7,11,15], target = 9",
          "expectedOutput": "[0,1]",
          "isHidden": false
        }
      ]
    },
    {
      "title": "Hash Map Complexity",
      "type": "mcq",
      "prompt": "What is average lookup time?",
      "points": 5,
      "penalty": 1,
      "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      "correctOption": 0
    }
  ]
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "id": "exam-uuid",
    "title": "Secure DSA Assessment",
    "durationMinutes": 75,
    "status": "active",
    "allowedLanguages": ["c", "cpp", "python", "java"],
    "questions": []
  }
}
```

### GET `/exams/:examId`

Fetch one exam with its questions.

Success response:

```json
{
  "success": true,
  "data": {
    "id": "exam-uuid",
    "title": "Secure DSA Assessment",
    "durationMinutes": 75,
    "status": "active",
    "security": {
      "pastePenaltyEnabled": true,
      "fullscreenRequired": true,
      "tabSwitchWarnings": 3,
      "rateLimitPerMinute": 60
    },
    "questions": []
  }
}
```

### POST `/exams/:examId/submit`

Submit an exam attempt with answers, scores, and security events.

Request body:

```json
{
  "rawScore": 10,
  "penaltyScore": 4,
  "finalScore": 6,
  "answers": {
    "question-uuid": {
      "questionId": "question-uuid",
      "code": "class Solution {...}",
      "language": "java",
      "typedCharacters": 140,
      "pastedCharacters": 62
    }
  },
  "securityEvents": [
    {
      "questionId": "question-uuid",
      "type": "paste",
      "message": "Copy/paste detected.",
      "penalty": 4
    }
  ]
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "id": "attempt-uuid",
    "exam_id": "exam-uuid",
    "raw_score": 10,
    "penalty_score": 4,
    "final_score": 6
  }
}
```

### POST `/exams/import/leetcode`

Import public LeetCode problem metadata into a coding-question draft.

Request body:

```json
{
  "url": "https://leetcode.com/problems/two-sum/"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "title": "Two Sum",
    "type": "coding",
    "prompt": "Given an array of integers...",
    "points": 10,
    "penalty": 4,
    "difficulty": "Easy",
    "timeComplexity": "Teacher review required",
    "spaceComplexity": "Teacher review required",
    "starterCode": {
      "c": "...",
      "cpp": "...",
      "python": "...",
      "java": "..."
    },
    "testCases": [],
    "sourceUrl": "https://leetcode.com/problems/two-sum/"
  }
}
```

Notes:

- LeetCode hidden judge test cases are not publicly available.
- The importer normalizes public examples and starter snippets. Teachers should review prompts, constraints, complexities, visible tests, and hidden tests before publishing.

## Security Middleware

The API applies these protections before routes:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy` disabling camera, microphone, and geolocation
- `Cross-Origin-Resource-Policy: same-site`
- Per-IP/per-path in-memory rate limiting
- JSON body size limit of `256kb`
- JSON-only enforcement for `POST`, `PUT`, and `PATCH`
- CORS configured from `CORS_ORIGIN`

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
