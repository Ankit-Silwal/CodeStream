import { loadContent } from "./content.manager.js";
import type { Socket } from "socket.io";
export async function loadContentSocket(socket:Socket,roomId:string){
  try{
    const content=await loadContent(roomId)
    socket.emit("init-code",content);
  }catch(err){
    console.error("Error loading the content");
    socket.emit("error",{
      message:"Failed to load the content"
    })
  }
}