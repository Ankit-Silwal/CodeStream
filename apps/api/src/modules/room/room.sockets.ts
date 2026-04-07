import type { Server, Socket } from "socket.io";
import { codeChangeSocket, loadContentSocket } from "../content/content.socket.js";
import { roomExists } from "./room.services.js";
import { redis } from "@repo/shared";

export function setupRoomSockets(io: Server, socket: Socket) {
  socket.on("join-room", async (data) => {
    const { roomId, userId } = data;
    
    if (!roomId) {
      return socket.emit("error", { message: "Room ID is required to join" });
    }
    const exists=await roomExists(roomId)
    if(!exists){
      socket.emit("error",{
        message:"Room not found"
      })
      return;
    }
    socket.join(roomId);
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
    await codeChangeSocket(socket,roomId,code);
  })
  socket.on("leave-room", (data) => {
    const { roomId, userId } = data;
    if (!roomId) return;
    socket.leave(roomId);
    console.log(`User ${userId || socket.id} left room ${roomId}`);
    socket.to(roomId).emit("user-left", {
      userId: userId || socket.id,
    });
  });
}
