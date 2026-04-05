import type { Request, Response } from "express";
import { createRoomService, leaveRoomService, addMemberService, changeOwnerService } from "./room.services.js";
import { pool } from "@repo/shared";

export async function createRoom(req: Request, res: Response) {
  const { name, language="java", is_private=false } = req.body;
  if(!name){
    return res.status(400).json({
      success:false,
      message:"Please pass the name"
    })
  }
  if(!req.userId){
    return res.status(400).json({
      success:false,
      messgae:"Please pass on the userId"
    })
  }
  const response= await createRoomService({
    name,
    owner_id: req.userId,
    language,
    is_private
  });
  return res.status(200).json({
    success:true,
    data:response
  })
}

export async function leaveRoom(req:Request,res:Response){
  const {roomId}=req.body;
  if(!roomId){
    return res.status(400).json({
      sucess:false,
      message:"Please pass on the roomId"
    })
  }
  const check=await pool.query(
    `
      select 1 from rooms
      where owner_id =$1 and id=$2
    `,[req.userId,roomId]
  )
  if(check.rows.length>0){
    return res.status(400).json({
      success:false,
      message:"Pass on owner to before leaving"
    })
  }

  await leaveRoomService(req.userId as string, roomId);
  return res.status(200).json({
    success: true,
    message: "Left room successfully"
  });
}

export async function addMember(req: Request, res: Response) {
  const { roomId, targetUserId, role = 'editor' } = req.body;
  const userId = req.userId;

  if (!roomId || !targetUserId) {
    return res.status(400).json({ success: false, message: "Missing roomId or targetUserId" });
  }

  try {
    const roomResult = await pool.query(`SELECT owner_id, is_private FROM rooms WHERE id = $1`, [roomId]);
    
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const room = roomResult.rows[0];

    if (room.is_private) {
      if (room.owner_id !== userId) {
        return res.status(403).json({ success: false, message: "Only the owner can add members to a private room" });
      }
    }

    await addMemberService(roomId, targetUserId, role);

    return res.status(200).json({ success: true, message: "Member added successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function changeOwner(req: Request, res: Response) {
  const { roomId, newOwnerId } = req.body;
  const userId = req.userId;

  if (!roomId || !newOwnerId) {
    return res.status(400).json({ success: false, message: "Missing roomId or newOwnerId" });
  }

  try {
    const check = await pool.query(`SELECT owner_id FROM rooms WHERE id = $1`, [roomId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    if (check.rows[0].owner_id !== userId) {
      return res.status(403).json({ success: false, message: "Only the current owner can transfer ownership" });
    }

    await changeOwnerService(roomId, newOwnerId);

    await pool.query(`
      INSERT INTO room_participants (room_id, user_id, role)
      VALUES ($1, $2, 'owner')
      ON CONFLICT (room_id, user_id) 
      DO UPDATE SET role = 'owner'
    `, [roomId, newOwnerId]);

    return res.status(200).json({ success: true, message: "Ownership transferred successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}