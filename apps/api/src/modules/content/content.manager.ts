import { pool, redis } from "@repo/shared"

export async function loadContent(roomId: string)
{
  if (!roomId)
  {
    throw new Error("RoomId is required for this purpose");
  }
  const versionKey = `doc:${roomId}`;
  const versionExists = await redis.exists(versionKey);
  if (!versionExists) {
    await redis.set(versionKey, 0);
  }
  const existing = await redis.get(versionKey);
  if (existing)
  {
    return JSON.parse(existing);
  }
  const dbres = await pool.query(
    `
    SELECT content
    FROM room_snapshots
    WHERE room_id = $1
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [roomId]
  );
  let code = "//Start Coding";
  if (dbres.rows.length > 0) {
    code = dbres.rows[0].content;
  }
  const payload = {
    code,
    version: 0
  };
  await redis.set(versionKey, JSON.stringify(payload));
  await redis.set(`doc:${roomId}:ver`,0);
  return payload;
}

export async function applyCodeChange(roomId: string, code: string) {
  if (!roomId) {
    throw new Error("RoomId is required")
  }
  const version = await redis.incr(`doc:${roomId}:ver`);

  const payload = {
    code,
    version
  }
  await redis.set(`doc:${roomId}`,JSON.stringify(payload));
  return payload;
}