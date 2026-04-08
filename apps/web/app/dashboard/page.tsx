"use client";
import React, { useState, useEffect } from "react";

const MOCK_ROOMS = [
  { id: "1", name: "React Developers Group", language: "JS", description: "Working on a new dashboard component with hooks and context API.", members: 3, status: "live" },
  { id: "2", name: "Node.js Backend Collab", language: "TS", description: "Setting up an Express API with WebSockets and JWT authentication.", members: 2, status: "live" },
  { id: "3", name: "Python Data Science", language: "PY", description: "Analyzing pandemic datasets and building visualizations with pandas.", members: 5, status: "live" },
  { id: "4", name: "Go Microservices", language: "GO", description: "Building a distributed tracing system with OpenTelemetry.", members: 1, status: "idle" },
  { id: "5", name: "Rust Systems Club", language: "RS", description: "Exploring async runtimes, ownership patterns, and performance tuning.", members: 2, status: "idle" },
];

const LANG_COLORS: Record<string, { bg: string; color: string }> = {
  JS: { bg: "#fff3cd", color: "#735c0f" },
  PY: { bg: "#ddf4ff", color: "#0550ae" },
  TS: { bg: "#e8f5e9", color: "#116329" },
  GO: { bg: "#fae8ff", color: "#6e40c9" },
  RS: { bg: "#ffe3e3", color: "#cf222e" },
};

const AVATAR_COLORS = ["#1f6feb", "#2da44e", "#6e40c9", "#cf222e", "#0550ae", "#e3b341"];

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [createRoomName, setCreateRoomName] = useState("");
  const [createRoomLanguage, setCreateRoomLanguage] = useState("JS");
  const [createRoomDesc, setCreateRoomDesc] = useState("");
  const [createVisibility, setCreateVisibility] = useState("Public");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    setIsDarkMode(isDark);
    if (isDark) document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:5000/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) { setUser(data.user); setIsLoggedIn(true); }
      })
      .catch(() => {});
  }, []);

  const handleLogin = () => { globalThis.location.href = "http://localhost:5000/auth/google"; };
  const handleLogout = () => { localStorage.removeItem("token"); setUser(null); setIsLoggedIn(false); };

  const submitCreateRoom = () => {
    if (!createRoomName.trim()) return;
    setRooms([...rooms, {
      id: Date.now().toString(),
      name: createRoomName,
      language: createRoomLanguage,
      description: createRoomDesc || "No description provided.",
      members: 1,
      status: "live",
    }]);
    setIsCreateModalOpen(false);
    setCreateRoomName(""); setCreateRoomDesc(""); setCreateRoomLanguage("JS");
  };

  const submitJoinRoom = () => {
    if (!joinRoomId.trim()) return;
    alert(`Joining room: ${joinRoomId}`);
    setIsJoinModalOpen(false);
    setJoinRoomId("");
  };

  const activeRooms = rooms.filter((r) => r.status === "live").length;
  const totalMembers = rooms.reduce((acc, r) => acc + r.members, 0);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", margin: 0, padding: 0, backgroundColor: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --bg: #f6f8fa;
          --text: #1f2328;
          --nav-bg: #24292f;
          --border: #d0d7de;
          --card: white;
          --muted: #57606a;
          --hover: #f6f8fa;
          --modal: rgba(0,0,0,0.45);
        }
        :root.dark {
          --bg: #0d1117;
          --text: #c9d1d9;
          --nav-bg: #010409;
          --border: #30363d;
          --card: #161b22;
          --muted: #8b949e;
          --hover: #21262d;
          --modal: rgba(0,0,0,0.8);
        }
      `}} />
      {/* ── Navbar ── */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px", height: "49px", backgroundColor: "var(--nav-bg)", borderBottom: "1px solid #30363d", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "28px", height: "28px", background: "#1f6feb", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2">
                <polyline points="4,6 1,8 4,10" /><polyline points="12,6 15,8 12,10" /><line x1="9" y1="3" x2="7" y2="13" />
              </svg>
            </div>
            <span style={{ fontSize: "15px", fontWeight: "600", color: "white" }}>CodeStream</span>
          </div>
          {["Dashboard", "Explore", "Docs"].map((link) => (
            <button key={link}
              style={{ background: "none", border: "none", color: "#e6edf3", fontSize: "14px", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", fontWeight: link === "Dashboard" ? "600" : "400" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >{link}</button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.07)", border: "1px solid #444c56", borderRadius: "6px", padding: "5px 12px", width: "220px" }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#8b949e" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4.5" /><line x1="9.5" y1="9.5" x2="13" y2="13" /></svg>
            <input placeholder="Search rooms..." style={{ background: "none", border: "none", outline: "none", fontSize: "13px", color: "#e6edf3", width: "100%" }} />
          </div>

          {isLoggedIn ? (
            <>
              <button onClick={() => setIsJoinModalOpen(true)}
                style={{ fontSize: "13px", padding: "5px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "500", border: "1px solid #444c56", background: "rgba(255,255,255,0.07)", color: "#e6edf3" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)")}
              >Join room</button>
              <button onClick={() => setIsCreateModalOpen(true)}
                style={{ fontSize: "13px", padding: "5px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "500", border: "1px solid #1f6feb", background: "#1f6feb", color: "white" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1a5ed4")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1f6feb")}
              >+ New room</button>
              <div
                style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#1f6feb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "600", color: "white", cursor: "pointer" }}
                title={user?.name}
              >
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "ME"}
              </div>
              <button onClick={handleLogout}
                style={{ background: "none", border: "none", color: "#8b949e", fontSize: "13px", cursor: "pointer", padding: "4px 8px", borderRadius: "6px" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#e6edf3")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#8b949e")}
              >Log out</button>
            </>
          ) : (
            <button onClick={handleLogin}
              style={{ fontSize: "13px", padding: "5px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", border: "1px solid #1f6feb", background: "#1f6feb", color: "white" }}
            >Log in / Sign up</button>
          )}
        </div>
      </nav>

      {/* ── Layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 49px)" }}>

        {/* ── Sidebar ── */}
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

        {/* ── Main Content ── */}
        <div style={{ padding: "28px 32px" }}>

          {/* Page header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "600" }}>
                {isLoggedIn ? `Good afternoon, ${user?.name?.split(" ")[0] ?? "there"}` : "Welcome to CodeStream"}
              </div>
              <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "3px" }}>
                {activeRooms} rooms active · {totalMembers} developers online
              </div>
            </div>
            {isLoggedIn && (
              <button
                style={{ fontSize: "13px", padding: "5px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "500", border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", display: "flex", alignItems: "center", gap: "6px" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f6f8fa")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="8" y1="2" x2="8" y2="14" /><line x1="2" y1="8" x2="14" y2="8" /></svg>
                Invite teammate
              </button>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", marginBottom: "28px" }}>
            {[
              { label: "Active rooms", value: activeRooms },
              { label: "Developers online", value: totalMembers },
            ].map((s) => (
              <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px 20px" }}>
                <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "6px" }}>{s.label}</div>
                <div style={{ fontSize: "26px", fontWeight: "600" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Blurred overlay for logged-out */}
          <div style={{ position: "relative" }}>
            {!isLoggedIn && (
              <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(246,248,250,0.85)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", zIndex: 10, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>Join the community</div>
                <p style={{ color: "var(--muted)", marginBottom: "20px", fontSize: "14px", textAlign: "center" }}>Log in to explore active rooms and start coding together.</p>
                <button onClick={handleLogin}
                  style={{ background: "#1f6feb", color: "white", padding: "8px 24px", fontSize: "14px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1a5ed4")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1f6feb")}
                >Get started</button>
              </div>
            )}

            {/* Rooms */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "14px", fontWeight: "600" }}>Active rooms</span>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>{rooms.length} rooms</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {rooms.map((room) => {
                const lang = LANG_COLORS[room.language] ?? { bg: "#f6f8fa", color: "var(--muted)" };
                return (
                  <div key={room.id}
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
                            <div key={i} style={{ width: "20px", height: "20px", borderRadius: "50%", border: "1.5px solid white", background: AVATAR_COLORS[i % AVATAR_COLORS.length], fontSize: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", color: "white", marginLeft: i === 0 ? "0" : "-4px" }}>
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
                        onClick={() => { /* router.push(`/room/${room.id}`) */ }}
                      >Join</button>
                    </div>
                  </div>
                );
              })}

              {isLoggedIn && (
                <div
                  onClick={() => setIsCreateModalOpen(true)}
                  style={{ background: "var(--card)", border: "1px dashed #d0d7de", borderRadius: "10px", padding: "16px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "160px", transition: "border-color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0969da")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#d0d7de")}
                >
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="8" y1="2" x2="8" y2="14" /><line x1="2" y1="8" x2="14" y2="8" /></svg>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "500", marginBottom: "4px" }}>New room</div>
                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>Start a session</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Create Room Modal ── */}
      {isCreateModalOpen && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setIsCreateModalOpen(false); }}
          style={{ position: "fixed", inset: 0, backgroundColor: "var(--modal)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--card)", padding: "20px", borderRadius: "12px", width: "400px", maxWidth: "90vw", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(140,149,159,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "15px", fontWeight: "600" }}>Create new room</span>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "var(--muted)", lineHeight: 1 }}>×</button>
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
              <label style={labelStyle}>Description <span style={{ fontWeight: "400", color: "#8c959f" }}>(optional)</span></label>
              <input value={createRoomDesc} onChange={(e) => setCreateRoomDesc(e.target.value)} placeholder="What are you building?" style={inputStyle} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button onClick={() => setIsCreateModalOpen(false)} style={btnStyle}>Cancel</button>
              <button onClick={submitCreateRoom} style={{ ...btnStyle, background: "#1f6feb", color: "white", borderColor: "#1f6feb" }}>Create room</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Join Room Modal ── */}
      {isJoinModalOpen && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setIsJoinModalOpen(false); }}
          style={{ position: "fixed", inset: 0, backgroundColor: "var(--modal)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--card)", padding: "20px", borderRadius: "12px", width: "400px", maxWidth: "90vw", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(140,149,159,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "15px", fontWeight: "600" }}>Join a room</span>
              <button onClick={() => setIsJoinModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "var(--muted)", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Room ID or invite link</label>
              <input value={joinRoomId} onChange={(e) => setJoinRoomId(e.target.value)} placeholder="e.g. cs-a3f8bc21 or paste invite URL" style={inputStyle} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button onClick={() => setIsJoinModalOpen(false)} style={btnStyle}>Cancel</button>
              <button onClick={submitJoinRoom} style={{ ...btnStyle, background: "#2da44e", color: "white", borderColor: "#2da44e" }}>Join room</button>
            </div>
          </div>
        </div>
      )}
    {/* Dark Mode Button */}
      <button
        onClick={toggleTheme}
        style={{
          position: "fixed", bottom: "24px", left: "24px", width: "48px", height: "48px", borderRadius: "50%",
          background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)",
          display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 9999
        }}
      >
        {isDarkMode ? "☀️" : "🌙"}
      </button>
    </div>
  );
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
