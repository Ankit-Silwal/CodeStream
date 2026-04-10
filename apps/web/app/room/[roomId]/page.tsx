"use client";
import { useEffect ,useState} from "react";
import {socket} from "../../../lib/socket"

import { useParams } from "next/navigation";

export default function RoomPage()
{
  const [code, setCode] = useState("");
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const roomId = params.roomId as string;
  useEffect(()=>{
  if(!roomId) return;
    const user=JSON.parse(localStorage.getItem("user")|| "{}")
    socket.connect()
    socket.emit("join-room",{
      roomId,
      userId:user.id
    })
    socket.on("init-code",(data)=>{
      setCode(data.code)
      setVersion(data.version);
      setLoading(false)
    })
    socket.on("code-update",(data)=>{
      setCode((prev)=>{
        if(data.version<=version) return prev;
        setVersion(data.version)
        return data.code;
      })
    })
  })
  if(loading) return <div>Joining room</div>
  return (
    <div>
      Room: {roomId}
      <pre>{code}</pre>
    </div>
  );
}