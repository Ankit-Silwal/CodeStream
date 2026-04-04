CREATE TABLE users (
  id uuid PRIMARY KEY default gen_random_uuid(),
  google_id TEXT UNIQUE,
  email TEXT UNIQUE,
  name TEXT,
  avatar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);