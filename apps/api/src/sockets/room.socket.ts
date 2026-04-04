import type {Socket,Server} from "socket.io"
export function joinRoom(io:Server,socket:Socket){
  socket.on("join-room",(roomID:string)=>{
    socket.join(roomID)
    console.log(`User ${socket.id} joined the room ${roomID}`)
  })
}