# CodeStream Database Schema

This schema is designed for PostgreSQL and supports authentication, secured exams, MCQ/coding questions, candidate attempts, security events, collaborative rooms, memberships, and versioned code snapshots.

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

CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  teacher_id uuid REFERENCES users(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'draft',
  allowed_languages TEXT[] NOT NULL DEFAULT ARRAY['c','cpp','python','java'],
  paste_penalty_enabled BOOLEAN NOT NULL DEFAULT true,
  fullscreen_required BOOLEAN NOT NULL DEFAULT true,
  tab_switch_warnings INTEGER NOT NULL DEFAULT 3,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
  starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'coding')),
  prompt TEXT NOT NULL DEFAULT '',
  points INTEGER NOT NULL DEFAULT 10,
  paste_penalty INTEGER NOT NULL DEFAULT 0,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_option INTEGER,
  difficulty TEXT,
  time_complexity TEXT,
  space_complexity TEXT,
  starter_code JSONB NOT NULL DEFAULT '{}'::jsonb,
  test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id uuid REFERENCES users(id) ON DELETE SET NULL,
  raw_score INTEGER NOT NULL DEFAULT 0,
  penalty_score INTEGER NOT NULL DEFAULT 0,
  final_score INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP
);

CREATE TABLE exam_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES exam_attempts(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_id UUID REFERENCES exam_questions(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  penalty INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Notes

- `rooms.owner_id` references `users.id`.
- `room_participants` enforces unique user-per-room membership via `UNIQUE(room_id, user_id)`.
- `room_snapshots.version` is currently globally unique.
- Worker persistence logic inserts into `room_snapshots` only when incoming version is newer than the latest saved version for that room.
- `exams.teacher_id` references the teacher user and can be null if the user is removed.
- `exam_questions.question_type` supports only `mcq` and `coding`.
- `exam_questions.options`, `starter_code`, and `test_cases` are JSONB to keep question authoring flexible.
- `exam_attempts` stores raw score, penalty score, final score, and the submitted answers.
- `exam_security_events` records paste, tab-switch, fullscreen-exit, typing-spike, and related monitoring events for teacher review.
