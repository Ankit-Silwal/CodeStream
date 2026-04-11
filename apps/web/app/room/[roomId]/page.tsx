"use client";
import { useEffect, useState,useRef } from "react";
import { socket } from "../../../lib/socket";
import { useRouter, useParams } from "next/navigation";
import RoomError from "../../../components/room/error";
import { MonacoEditor } from "../../../components/room/monaco";

export default function RoomPage() {
  const [code, setCode] = useState("");
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const params = useParams();
  const router = useRouter();
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleEditorChange = (value: string) => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    socket.emit("code-update", {
      roomId,
      code: value,
    });
  };

  const handleCursorChange = (line: number, column: number) => {
    socket.emit("cursor-update", {
      roomId,
      line,
      column,
    });
  };

  const roomId = params.roomId as string;
  useEffect(() => {
    if (!roomId) return;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
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
    socket.on("code-update", (data) => {
      setCode((prev) => {
        if (data.version <= version) return prev;
        setVersion(data.version);
        return data.code;
      });
    });
    socket.on("cursor-update", (data) => {
      console.log("Remote cursor update:", data);
      // Here you can set state to render other users' cursors securely
    });
    socket.on("error", (err) => {
      setError(err.message);
      setLoading(false);
    });
  }, [roomId, version]);
//   useEffect(() => {
//   const interval = setInterval(() => {
//     const randomLetter = String.fromCharCode(
//       97 + Math.floor(Math.random() * 26)
//     );

//     isRemoteUpdate.current = true;

//     setCode((prev) => {
//       const updated = prev + randomLetter;

//       socket.emit("code-update", {
//         roomId,
//         code: updated,
//       });

//       return updated;
//     });
//   }, 1000);

//   return () => clearInterval(interval);
// }, [roomId]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error, router]);

  if (loading) return <div>Joining room</div>;

  if (error) {
    return <RoomError error={error} />;
  }
  return (
    <MonacoEditor
      code={code}
      onChange={handleEditorChange}
      onCursorChange={handleCursorChange}
    />
  );
}