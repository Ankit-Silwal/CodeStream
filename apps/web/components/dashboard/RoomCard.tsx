import React from 'react';
import { Room } from './AppSidebar';

const LANG_COLORS: Record<string, { bg: string; color: string }> = {
  JS: { bg: "#fff3cd", color: "#735c0f" },
  PY: { bg: "#ddf4ff", color: "#0550ae" },
  TS: { bg: "#e8f5e9", color: "#116329" },
  GO: { bg: "#fae8ff", color: "#6e40c9" },
  RS: { bg: "#ffe3e3", color: "#cf222e" },
};

const AVATAR_COLORS = ["#1f6feb", "#2da44e", "#6e40c9", "#cf222e", "#0550ae", "#e3b341"];

interface RoomCardProps {
  room: Room;
  isLoggedIn: boolean;
}

export function RoomCard({ room, isLoggedIn }: RoomCardProps) {
  const lang = LANG_COLORS[room.language] ?? { bg: "#f6f8fa", color: "var(--muted)" };
  return (
    <div
      style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px", cursor: isLoggedIn ? "pointer" : "default", transition: "border-color 0.15s, box-shadow 0.15s" }}
      onMouseEnter={(e) => { if (isLoggedIn) { e.currentTarget.style.borderColor = "#0969da"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#d0d7de"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: lang.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: lang.color }}>{room.language}</div>
        <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", fontWeight: "500", background: room.status === "live" ? "#dafbe1" : "#f6f8fa", color: room.status === "live" ? "#116329" : "#57606a", border: room.status === "idle" ? "1px solid #d0d7de" : "none" }}>
          {room.status === "live" ? "● live" : "idle"}
        </span>
      </div>
      <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>{room.name}</div>
      <div style={{ fontSize: "12px", color: "var(--muted)", lineHeight: "1.5", marginBottom: "12px" }}>{room.description}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex" }}>
            {Array.from({ length: Math.min(room.members, 4) }).map((_, i) => (
              <div key={`avatar-${room.id}-${i}`} style={{ width: "20px", height: "20px", borderRadius: "50%", border: "1.5px solid white", background: AVATAR_COLORS[i % AVATAR_COLORS.length], fontSize: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", color: "white", marginLeft: i === 0 ? "0" : "-4px" }}>
                {room.members > 4 && i === 3 ? `+${room.members - 3}` : ""}
              </div>
            ))}
          </div>
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>{room.members} dev{room.members !== 1 ? "s" : ""}</span>
        </div>
        <button
          disabled={!isLoggedIn}
          style={{ fontSize: "12px", padding: "4px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: "transparent", color: isLoggedIn ? "#1f2328" : "#8c959f", cursor: isLoggedIn ? "pointer" : "not-allowed", fontWeight: "500" }}
          onMouseEnter={(e) => { if (isLoggedIn) { e.currentTarget.style.backgroundColor = "#f6f8fa"; e.currentTarget.style.borderColor = "#0969da"; e.currentTarget.style.color = "#0969da"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "#d0d7de"; e.currentTarget.style.color = isLoggedIn ? "#1f2328" : "#8c959f"; }}
        >Join</button>
      </div>
    </div>
  );
}