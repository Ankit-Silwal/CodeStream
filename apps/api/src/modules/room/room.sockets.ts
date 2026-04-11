import type { Server, Socket } from "socket.io";
import { codeChangeSocket, cursorUpdateSocket, loadContentSocket } from "../content/content.socket.js";
import { roomExists } from "./room.services.js";
import { pool, redis } from "@repo/shared";
import { validate as isUUID } from "uuid";

export function setupRoomSockets(io: Server, socket: Socket) {
  socket.on("join-room", async (data) => {
    const { roomId, userId } = data;
    
    if (!roomId || !isUUID(roomId)) {
      return socket.emit("error", { message: "Room ID isn't valid" });
    }
    
    const exists=await roomExists(roomId)
    if(!exists){
      socket.emit("error",{
        message:"Room not found"
      })
      return;
    }
    const doc=await redis.get(`doc:${roomId}`)
    if(!doc){
      const snapshot=await pool.query(`
        select content,version from room_snapshots where room_id=$1
        order by version desc
        limit 1`,[roomId])
      
      const code = snapshot.rows.length > 0 ? snapshot.rows[0].content : "";
      const version = snapshot.rows.length > 0 ? snapshot.rows[0].version : 1;
      
      await redis.set(`doc:${roomId}`,JSON.stringify({code,version}))
    }
    socket.join(roomId);
    await redis.sadd(`room:${roomId}:users`,socket.id)
    await redis.setnx(`room:${roomId}:exists`,"1");
    console.log(`User ${userId || socket.id} joined room ${roomId}`);
    await loadContentSocket(socket,roomId)
    socket.to(roomId).emit("user-joined", {
      userId: userId || socket.id,
      message: `A new user joined the room`
    });
  });
  socket.on("code-update",async (data)=>{
    const {roomId,code}=data;
    if(!roomId || !isUUID(roomId)){
      return socket.emit("error",{
        message:"RoomId should be of correct"
      })
    }
    const exits=await roomExists(roomId)
    if(!exits){
      socket.emit("error",{
        message:"The room was deleted"
      })
      return;
    }
    await codeChangeSocket(socket,roomId,code);
  })
  socket.on("cursor-update",async (data)=>{
    const {roomId,line,column}=data;
    if(!roomId || !line ||!column){
      return socket.emit("error",{
        message:"Cursor update payload error"
      })
    }
    await cursorUpdateSocket(socket,roomId,line,column);
  })
  socket.on("leave-room", async (data) => {
    const { roomId, userId } = data;
    if (!roomId) return;
    socket.leave(roomId);
    await redis.srem(`room:${roomId}:users`,socket.id)
    console.log(`User ${userId || socket.id} left room ${roomId}`);
    socket.to(roomId).emit("user-left", {
      userId: userId || socket.id,
    });
  });
}
