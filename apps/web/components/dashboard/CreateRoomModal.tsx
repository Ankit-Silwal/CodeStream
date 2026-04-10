"use client"

import React, { useState } from "react";

export type CreateRoomPayload={
  name:string;
  language:string;
  visibility:string;
}

interface CreateRoomModalProps {
  isOpen:boolean;
  onClose:()=>void;
  onCreate:(data:CreateRoomPayload)=>void;
}

export function CreateRoomModal({ isOpen, onClose, onCreate }: CreateRoomModalProps){
  const [createRoomName, setCreateRoomName] = useState("");
  const [createRoomLanguage, setCreateRoomLanguage] = useState("JS");
  const [createVisibility, setCreateVisibility] = useState("Public");

  if (!isOpen) return null;

  const submitCreateRoom = () => {
    onCreate({
      name: createRoomName,
      language: createRoomLanguage,
      visibility: createVisibility
    });
    setCreateRoomName("");
    setCreateRoomLanguage("JS");
    setCreateVisibility("Public");
  };

  return(
          <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            style={{ position: "fixed", inset: 0, backgroundColor: "var(--modal)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
            <div style={{ background: "var(--card)", padding: "20px", borderRadius: "12px", width: "400px", maxWidth: "90vw", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(140,149,159,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "15px", fontWeight: "600" }}>Create new room</span>
                <button onClick={() => onClose()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "var(--muted)", lineHeight: 1 }}>×</button>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Room name</label>
                <input value={createRoomName} onChange={(e) => setCreateRoomName(e.target.value)} placeholder="e.g. Next.js App Router" style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                <div>
                  <label style={labelStyle}>Language</label>
                  <select value={createRoomLanguage} onChange={(e) => setCreateRoomLanguage(e.target.value)} style={inputStyle}>
                    {["JS", "TS", "PY", "GO", "RS", "Java"].map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Visibility</label>
                  <select value={createVisibility} onChange={(e) => setCreateVisibility(e.target.value)} style={inputStyle}>
                    {["Public", "Private", "Team only"].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>

              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button onClick={() => onClose()} style={btnStyle}>Cancel</button>
                <button onClick={submitCreateRoom} style={{ ...btnStyle, background: "#1f6feb", color: "white", borderColor: "#1f6feb" }}>Create room</button>
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