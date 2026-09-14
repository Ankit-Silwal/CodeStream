import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { pool } from "@repo/shared";

const scrypt = promisify(scryptCallback);

export type UserRole = "admin" | "teacher" | "student";

type CreateTeacherInput = {
  name: string;
  email: string;
  password: string;
  createdBy?: string;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
};

const verifyPassword = async (password: string, passwordHash: string | null) => {
  if (!passwordHash) return false;
  const [salt, stored] = passwordHash.split(":");
  if (!salt || !stored) return false;

  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(stored, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
};

export const findOrCreateUser = async (profile: any) => {
  const googleId = profile.id;
  const email = normalizeEmail(profile.emails[0].value);
  const name = profile.displayName;
  const avatar = profile.photos[0].value;

  let user = await pool.query(`select * from users where google_id=$1`, [googleId]);
  if (user.rows.length === 0) {
    user = await pool.query(
      `
      INSERT INTO users (google_id,email,name,avatar,role)
      VALUES ($1,$2,$3,$4,'student')
      ON CONFLICT (email) DO UPDATE
        SET google_id = EXCLUDED.google_id,
            avatar = EXCLUDED.avatar,
            name = COALESCE(users.name, EXCLUDED.name)
        WHERE users.role = 'student'
      RETURNING *
      `,
      [googleId, email, name, avatar],
    );
    if (user.rows.length === 0) {
      throw new Error("Email belongs to another account type");
    }
  }
  return user.rows[0];
};

export const verifyAdminCredentials = (email: string, password: string) => {
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL ?? "admin@codestream.local");
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  return normalizeEmail(email) === adminEmail && password === adminPassword;
};

export const createAdminUser = (email: string) => ({
  id: "admin",
  email: normalizeEmail(email),
  name: "Admin",
  role: "admin" as UserRole,
});

export const createTeacher = async ({ name, email, password, createdBy }: CreateTeacherInput) => {
  const passwordHash = await hashPassword(password);
  const result = await pool.query(
    `
    INSERT INTO users (email, name, password_hash, role, created_by)
    VALUES ($1,$2,$3,'teacher',$4)
    RETURNING id, email, name, role, is_active, created_at
    `,
    [normalizeEmail(email), name.trim(), passwordHash, createdBy === "admin" ? null : createdBy ?? null],
  );
  return result.rows[0];
};

export const listTeachers = async () => {
  const result = await pool.query(
    `
    SELECT id, email, name, role, is_active, created_at
    FROM users
    WHERE role = 'teacher'
    ORDER BY created_at DESC
    `,
  );
  return result.rows;
};

export const findUserByCredentials = async (email: string, password: string, role: UserRole) => {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE email = $1 AND role = $2 AND is_active = true
    LIMIT 1
    `,
    [normalizeEmail(email), role],
  );
  const user = result.rows[0];
  if (!user) return null;
  const isValid = await verifyPassword(password, user.password_hash);
  return isValid ? user : null;
};

export const findOrCreateStudent = async (name: string, email: string) => {
  const result = await pool.query(
    `
    INSERT INTO users (email, name, role)
    VALUES ($1,$2,'student')
    ON CONFLICT (email) DO UPDATE
      SET name = COALESCE(NULLIF(EXCLUDED.name, ''), users.name)
      WHERE users.role = 'student'
    RETURNING *
    `,
    [normalizeEmail(email), name.trim()],
  );
  const user = result.rows[0];
  if (!user) return null;
  return user.role === "student" ? user : null;
};
