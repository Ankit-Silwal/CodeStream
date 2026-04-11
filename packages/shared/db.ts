import {Pool} from "pg";
const pool=new Pool({
  connectionString:process.env.DB_URL
})

export const initDb = async () => {
  try {
    await pool.query(`
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