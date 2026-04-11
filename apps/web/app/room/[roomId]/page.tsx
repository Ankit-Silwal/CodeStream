"use client";
import { useEffect, useState } from "react";
import { socket } from "../../../lib/socket";
import { useRouter, useParams } from "next/navigation";

export default function RoomPage() {
  const [code, setCode] = useState("");
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const params = useParams();
  const router = useRouter();
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
    socket.on("code-update",(data)=>{
      setCode((prev)=>{
        if(data.version<=version) return prev;
        setVersion(data.version)
        return data.code;
      })
    })
    socket.on("error", (err) => {
      setError(err.message);
      setLoading(false);
    });
  }, [roomId, version]);

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
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d1117",
          color: "#e6edf3",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "12px",
            padding: "32px",
            width: "380px",
            textAlign: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: "48px",
              height: "48px",
              margin: "0 auto 16px",
              borderRadius: "50%",
              background: "#da3633",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: "bold",
            }}
          >
            !
          </div>

          {/* Title */}
          <h2 style={{ marginBottom: "8px", fontSize: "20px" }}>
            Failed to join room
          </h2>

          {/* Message */}
          <p
            style={{
              fontSize: "14px",
              color: "#8b949e",
              marginBottom: "20px",
            }}
          >
            {error || "This room does not exist or you don't have access."}
          </p>

          {/* Action */}
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background: "#1f6feb",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Go back to dashboard
          </button>

          {/* Auto redirect note */}
          <p
            style={{
              marginTop: "12px",
              fontSize: "12px",
              color: "#6e7681",
            }}
          >
            Redirecting automatically...
          </p>
        </div>
      </div>
    );
  }
  return (
    <div>
      Room: {roomId}
      <pre>{code}</pre>
    </div>
  );
}