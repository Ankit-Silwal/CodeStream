import "./env.js";
import {Pool} from "pg";
const pool=new Pool({
  connectionString:process.env.DB_URL
})

export const initDb = async () => {
  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY default gen_random_uuid(),
        google_id TEXT UNIQUE,
        email TEXT UNIQUE,
        name TEXT,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        owner_id uuid REFERENCES users(id) ON DELETE CASCADE,
        language TEXT DEFAULT 'java',
        is_private BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS room_participants (
        id uuid PRIMARY KEY default gen_random_uuid(),
        room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
        user_id uuid REFERENCES users(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'viewer',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(room_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS room_snapshots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        version Integer Unique,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
        ) THEN
          ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'teacher', 'student')) NOT VALID;
        END IF;
      END $$;
      CREATE TABLE IF NOT EXISTS exams (
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
      CREATE TABLE IF NOT EXISTS exam_questions (
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
      CREATE TABLE IF NOT EXISTS exam_attempts (
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
      CREATE TABLE IF NOT EXISTS exam_security_events (
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
    `);
    console.log('Database tables initialized completely');
  } catch (err: any) {
    console.error('Failed to initialize tables:', err.message);
  }
};

pool.connect()
  .then(()=> {
    console.log(`Postgres is connected `);
  })
  .catch((error)=>console.log(`Error connecting the postgres ${error?.message}`))

export default pool;
