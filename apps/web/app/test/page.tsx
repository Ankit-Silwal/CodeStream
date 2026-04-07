"use client";
import { useState,useEffect } from "react";
import {socket} from "../../lib/socket"
export default function Page()
{
  type User={
    id:string,
    name:string,
    email:string
  }
  type CodePayload={
    code:string
  }
  const [user,setUser]=useState<User|null>(null);
  const [roomId,setRoomId]=useState<string>("");
  const [joined,setJoined]=useState<boolean>(false);
  const [code,setCode]=useState<string>("");
  useEffect(()=>{
    const token=localStorage.getItem("token")
    if(!token) return;
    fetch("http://localhost:5000/auth/me",{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    .then(res=>res.json())
    .then(data=>{
      if(data.user){
        setUser(data.user);
      }
    })
  },[])
  useEffect(()=>{
    if(!joined || !user) return;
    socket.connect();
    socket.off("connect")
    socket.off("init-code")
    socket.off("code-update")
    socket.on("connect",()=>{
      console.log("connected",socket.id);
      socket.emit("join-room",{
        roomId,
        userId:user?.id
      })
      socket.on("init-code",(data:CodePayload)=>{
        setCode(data.code)
      })
      socket.on("code-update",(data:CodePayload)=>{
        setCode(data.code)
      })
      return ()=>{
        socket.off("connect")
        socket.off("init-code")
        socket.off("code-update")
        socket.disconnect()
      }
    })
  },[joined,user,roomId])
  return(
    <div style={{padding:"20px"}}>
      {!joined && (
        <div>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e)=>setRoomId(e.target.value)}
            style={{padding:"8px",marginRight:"10px"}}
          />
          <button onClick={()=>{
            if(!roomId) return;
            setJoined(true)
          }}>
            Join
          </button>
        </div>
      )}

      {joined && (
        <div>
          <h3>Room: {roomId}</h3>

          <textarea
            value={code}
            onChange={(e)=>{
              const newCode=e.target.value;
              setCode(newCode)
              socket.emit("code-update",{
                roomId,
                code:newCode
              })
            }}
            
            style={{
              width:"100%",
              height:"400px",
              marginTop:"10px",
              padding:"10px",
              fontFamily:"monospace"
            }}
          />
        </div>
      )}
    </div>
  );
}