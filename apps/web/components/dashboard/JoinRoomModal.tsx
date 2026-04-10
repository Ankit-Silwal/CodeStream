"use client"
import React, { useState } from "react";

type JoinRoomModalProps={
  isOpen:boolean;
  onClose:()=>void;
  onJoin:(roomId:string)=>void;
}

export function JoinRoomModal({
  isOpen,
  onClose,
  onJoin
}:JoinRoomModalProps){
  const [roomId,setRoomId]=useState<string>("")
  if(!isOpen) return null;

  const handleSubmit=()=>{
    if(!roomId.trim()) return;
    onJoin(roomId);
    setRoomId("");
  }

  return(
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, backgroundColor: "var(--modal)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "var(--card)", padding: "20px", borderRadius: "12px", width: "400px", maxWidth: "90vw", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(140,149,159,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <span style={{ fontSize: "15px", fontWeight: "600" }}>Join a room</span>
          <button onClick={() => onClose()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "var(--muted)", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Room ID or invite link</label>
          <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="e.g. cs-a3f8bc21 or paste invite URL" style={inputStyle} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button onClick={() => onClose()} style={btnStyle}>Cancel</button>
          <button onClick={handleSubmit} style={{ ...btnStyle, background: "#2da44e", color: "white", borderColor: "#2da44e" }}>Join room</button>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: "12px", fontWeight: "500", color: "var(--muted)",
  display: "block", marginBottom: "5px",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "7px 10px", borderRadius: "6px",
  border: "1px solid var(--border)", background: "var(--card)",
  color: "var(--text)", fontSize: "13px", outline: "none",
  boxSizing: "border-box",
};

const btnStyle: React.CSSProperties = {
  fontSize: "13px", padding: "5px 14px", borderRadius: "6px",
  cursor: "pointer", fontWeight: "500",
  border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)",
};