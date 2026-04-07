# CodeStream Database Schema

This schema is designed for PostgreSQL and supports authentication, collaborative rooms, memberships, and versioned code snapshots.

## Tables

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY default gen_random_uuid(),
  google_id TEXT UNIQUE,
  email TEXT UNIQUE,
  name TEXT,
  avatar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'java',
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE room_participants (
  id uuid PRIMARY KEY default gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer', -- viewer / editor / owner
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(room_id, user_id)
);

CREATE TABLE room_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  version Integer Unique,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Notes

- `rooms.owner_id` references `users.id`.
- `room_participants` enforces unique user-per-room membership via `UNIQUE(room_id, user_id)`.
- `room_snapshots.version` is currently globally unique.
- Worker persistence logic inserts into `room_snapshots` only when incoming version is newer than the latest saved version for that room.