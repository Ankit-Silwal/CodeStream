import React from "react";

export interface Room {
  id: string;
  name: string;
  description: string;
  language: string;
  members: number;
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


export interface Room {
  id: string;
  name: string;
  language: string;
  description: string;
  members: number;
  status: string;
}

const sidebarLabelStyle: React.CSSProperties = {
  fontSize: "11px", fontWeight: "600", color: "var(--muted)",
  letterSpacing: "0.06em", textTransform: "uppercase",
  padding: "0 16px", marginBottom: "4px",
};

const sidebarItemStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "8px",
  padding: "7px 16px", fontSize: "13px", color: "var(--muted)",
  cursor: "pointer", borderLeft: "2px solid transparent",
  transition: "background 0.1s",
};

interface SidebarProps {
  rooms: Room[];
}

export function Sidebar({ rooms }: SidebarProps) {
  return (
    <div style={{ backgroundColor: "var(--card)", borderRight: "1px solid #d0d7de", padding: "16px 0" }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={sidebarLabelStyle}>Overview</div>
        <div style={{ ...sidebarItemStyle, borderLeftColor: "#1f6feb", backgroundColor: "var(--bg)", color: "var(--text)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" />
            <rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" />
          </svg>
          Dashboard
        </div>
        <div style={sidebarItemStyle}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f6f8fa"; e.currentTarget.style.color = "#1f2328"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#57606a"; }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3" /><path d="M1 14c0-3 3-5 7-5s7 2 7 5" /></svg>
          People
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div style={sidebarLabelStyle}>Your rooms</div>
        {rooms.slice(0, 5).map((r) => (
          <div key={r.id} style={sidebarItemStyle}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f6f8fa"; e.currentTarget.style.color = "#1f2328"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#57606a"; }}
          >
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: r.status === "live" ? "#2da44e" : "#57606a", flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
          </div>
        ))}
      </div>

      <div>
        <div style={sidebarLabelStyle}>Settings</div>
        <div style={sidebarItemStyle}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f6f8fa"; e.currentTarget.style.color = "#1f2328"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#57606a"; }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" /></svg>
          Settings
        </div>
      </div>
    </div>
  );
}