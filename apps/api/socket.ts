import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import { setupRoomSockets } from "./src/modules/room/room.sockets.js";
import { redis } from "@repo/shared";

let io: Server;

export function initializeSocket(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected to socket: ${socket.id}`);
    setupRoomSockets(io, socket);

    socket.on("disconnect", async () =>
{
  try
  {
    const rooms = Array.from(socket.rooms);
    for (const roomId of rooms)
    {
      if (roomId === socket.id) continue;
      await redis.srem(`room:${roomId}:users`, socket.id);
      const users = await redis.smembers(`room:${roomId}:users`);
      socket.to(roomId).emit("users-updated", {
        roomId,
        users
      });
      socket.to(roomId).emit("cursor-remove",{
        socketId:socket.id
      })
    }
    console.log(`Socket disconnected: ${socket.id}`);
  }
  catch (err)
  {
    console.error("Disconnect handler failed", err);
  }
});
  });

  return io;
}

export function getSocketInstance() {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
}