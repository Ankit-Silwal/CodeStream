import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import { setupRoomSockets } from "../modules/room/room.sockets.js";

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

    socket.on("disconnect", () => {
      console.log(`User disconnected from socket: ${socket.id}`);
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
