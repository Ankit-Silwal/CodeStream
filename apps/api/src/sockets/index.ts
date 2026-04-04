import { Server } from "socket.io";
import { Server as httpServer } from "http";
import { joinRoom } from "./room.socket.js";

export function initSocket(server:httpServer){
  const io=new Server(server,{
    cors:{
      origin:"*"
    }
  })
  io.on("connection",(socket)=>{
    console.log("User connected:",socket.id);
    joinRoom(io,socket);
    socket.on("disconnect",()=>{
      console.log("User disconnected:",socket.id)
    })
  })
  return io;
}