import { pool, redis } from "@repo/shared";
import type { createRoomInput } from "./room.types.js";

export async function createRoomService(data: createRoomInput) {
  const res=await pool.query(
    `
    INSERT INTO rooms (name, owner_id, language, is_private)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,[data.name,data.owner_id,data.language,data.is_private]
  )
  const room = res.rows[0];

  await pool.query(
    `
    INSERT INTO room_participants (room_id, user_id, role)
    VALUES ($1, $2, $3)
    `, [room.id, data.owner_id, 'owner']
  );

  return room;
}

export async function leaveRoomService(userId:string,roomId:string){
  await pool.query(
    `
    delete from room_participants
    where room_id=$1 and user_id=$2
    `,[roomId,userId]
  )
}

export async function addMemberService(roomId: string, targetUserId: string, role: string = 'viewer') {
  await pool.query(
    `
    INSERT INTO room_participants (room_id, user_id, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (room_id, user_id) DO NOTHING
    `, [roomId, targetUserId, role]
  );
}

export async function changeOwnerService(roomId: string, newOwnerId: string) {
  await pool.query(
    `
    UPDATE rooms
    SET owner_id = $1
    WHERE id = $2
    `, [newOwnerId, roomId]
  );
}

export async function roomExists(roomId: string): Promise<boolean>
{
  const redisCheck = await redis.get(`room:${roomId}:exists`);
  if (redisCheck)
  {
    return true;
  }
  const dbCheck = await pool.query(
    `SELECT 1 FROM rooms WHERE id = $1`,
    [roomId]
  );

  if (dbCheck.rowCount === 0)
  {
    return false;
  }  await redis.set(`room:${roomId}:exists`, "1");
  return true;
}