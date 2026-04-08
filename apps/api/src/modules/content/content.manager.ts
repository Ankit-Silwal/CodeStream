import { pool, redis } from "@repo/shared"
import { getSocketInstance } from "../../../socket.js";

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
  const key=`doc:${roomId}`
  let doc=await redis.get(key)
  if(!doc){
    const lock=await redis.set(`lock:${roomId}`,"1","EX",5,"NX");
    if(lock){
      const snapshot=await pool.query(`
        select content,version 
        from room_snapshots
        where room_id=$1
        order by version desc
        limit 1
        `,[roomId])
      let code="//Start coding"
      let version=0;
      if(snapshot.rows.length>0){
        code=snapshot.rows[0].content;
        version=snapshot.rows[0].version;
      }
      const payload={code,version}
      await redis.set(key,JSON.stringify(payload))
      getSocketInstance().in(roomId).emit("force-resync",payload)
    }
    
  }
  const version = await redis.incr(`doc:${roomId}:ver`);

  const payload = {
    code,
    version
  }
  await redis.set(`doc:${roomId}`,JSON.stringify(payload));
  return payload;
}