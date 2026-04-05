import { pool, redis } from "@repo/shared"

export async function loadContent(roomId: string)
{
  if (!roomId)
  {
    throw new Error("RoomId is required for this purpose");
  }
  const key = `doc:${roomId}`;
  let content = await redis.get(key);
  if (content)
  {
    return content;
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
  if (dbres.rows.length > 0)
  {
    content = dbres.rows[0].content;
  }
  else
  {
    content = "// Start coding...";
  }
  
  const contentToSave = content ?? "// Start coding...";
  await redis.set(key, contentToSave);
  return contentToSave;
}