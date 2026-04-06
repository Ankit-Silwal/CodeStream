import { applyCodeChange, loadContent } from "./content.manager.js";
import type { Socket } from "socket.io";
import { debounceSave } from "./content.debounce.js";
import { codeQueue } from "../../configs/queue.js";
export async function loadContentSocket(socket:Socket,roomId:string){
  try{
    const content=await loadContent(roomId)
    socket.emit("init-code",content);
  }catch(err){
    console.error("Error loading the content:", err);
    socket.emit("error",{
      message:"Failed to load the content"
    })
  }
}

export async function codeChangeSocket(socket:Socket,roomId:string,code:string){
  try{
    if(!roomId || typeof code!=="string"){
      return socket.emit("error",{message:"Invalid code-change payload"})
    }
    const result=await applyCodeChange(roomId,code);
    debounceSave(roomId,async ()=>{
      await codeQueue.add("save-code",{roomId}) 
    })
    socket.to(roomId).emit("code-update",result);
  }catch(err){
    console.error("Error in updating the code",err);
    socket.emit("error",{
      message:"Failed to process code change"
    })
  }
}