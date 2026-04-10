import React from "react";

export interface Room {
  id: string;
  name: string;
  language: string;
  members: number;
  status: string;
}

interface AppSidebarProps {
  rooms: Room[];
}

export function AppSidebar({ rooms }: AppSidebarProps) {
  const sidebarItemStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "4px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    transition: "background-color 0.15s, color 0.15s",
    color: "#57606a",
  };

  return (
    <div style={{ padding: "16px" }}>
      <h3 style={{ fontSize: "12px", fontWeight: "600", color: "#57606a", marginBottom: "12px", textTransform: "uppercase" }}>Quick Access</h3>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={sidebarItemStyle}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f6f8fa"; e.currentTarget.style.color = "#1f2328"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#57606a"; }}>
          <span style={{ marginRight: "8px" }}>🏠</span> Home
        </div>
        
        <h3 style={{ fontSize: "12px", fontWeight: "600", color: "#57606a", marginTop: "20px", marginBottom: "12px", textTransform: "uppercase" }}>Recent Rooms</h3>
        {rooms.slice(0, 5).map(r => (
          <div key={r.id} style={sidebarItemStyle}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f6f8fa"; e.currentTarget.style.color = "#1f2328"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#57606a"; }}>
            <span style={{ marginRight: "8px" }}>💬</span> {r.name}
          </div>
        ))}

        <h3 style={{ fontSize: "12px", fontWeight: "600", color: "#57606a", marginTop: "20px", marginBottom: "12px", textTransform: "uppercase" }}>Settings</h3>
        <div style={sidebarItemStyle}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f6f8fa"; e.currentTarget.style.color = "#1f2328"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#57606a"; }}>
          <span style={{ marginRight: "8px" }}>⚙️</span> Preferences
        </div>
      </div>
    </div>
  );
}

