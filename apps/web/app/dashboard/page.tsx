"use client";
import React, { useState, useEffect } from "react";

// Mock data (replace with real data later)
const MOCK_ROOMS = [
  { id: "1", name: "React Developers Group", description: "Working on a new dashboard component." },
  { id: "2", name: "Node.js Backend Collab", description: "Setting up an Express API with WebSockets." },
  { id: "3", name: "Python Data Science", description: "Analyzing pandemic datasets together." },
];

const FEATURES = [
  {
    title: "Real-Time Collaboration",
    description: "Write code with your team simultaneously with zero lag, seeing changes as they happen.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#3b82f6" }}>
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: "Integrated Video & Chat",
    description: "Communicate seamlessly with built-in voice, video, and text chats within the coding environment.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#10b981" }}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    title: "Instant Environment Setup",
    description: "No more 'works on my machine'. Instantly spin up a containerized environment tailored to your project.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#8b5cf6" }}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    title: "Global Community",
    description: "Join public rooms to learn, mentor, or just code alongside developers from around the world.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#f59e0b" }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [rooms, setRooms] = useState(MOCK_ROOMS);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createRoomName, setCreateRoomName] = useState("");
  const [createRoomLanguage, setCreateRoomLanguage] = useState("javascript");

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      })
      .catch(() => {
        setUser(null);
        setIsLoggedIn(false);
      });
  }, []);

  const handleLogin = () => {
    globalThis.location.href = "http://localhost:5000/auth/google";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsLoggedIn(false);
  };

  const submitCreateRoom = () => {
    if (!createRoomName.trim() || !createRoomLanguage) return;
    const newRoom = {
      id: Date.now().toString(),
      name: createRoomName,
      description: `Language: ${createRoomLanguage.toUpperCase()}`,
    };
    setRooms([...rooms, newRoom]);
    setIsCreateModalOpen(false);
    setCreateRoomName("");
  };

  const submitJoinRoom = () => {
    if (!joinRoomId.trim()) return;
    alert(`Joining room: ${joinRoomId}`); // Placeholder for actual join logic
    setIsJoinModalOpen(false);
    setJoinRoomId("");
  };

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        margin: 0,
        padding: 0,
        backgroundColor: "#0f172a", // Dark modern background
        color: "#f8fafc", // Light text
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* Navigation Bar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.5rem 3rem",
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              color: "white",
            }}
          >
            {"</>"}
          </div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.5px" }}>CodeStream</h1>
        </div>

        {isLoggedIn ? (
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "1rem", color: "#cbd5e1" }}>
              Welcome back, <strong style={{ color: "white" }}>{user?.name}</strong>
            </span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "transparent",
                color: "#f87171",
                padding: "0.5rem 1.2rem",
                border: "1px solid #f87171",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f87171";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#f87171";
              }}
            >
              Log Out
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
              color: "white",
              padding: "0.6rem 1.5rem",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.39)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            Log In / Sign Up
          </button>
        )}
      </nav>

      <main style={{ padding: "4rem 2rem", maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
        {/* Dynamic Hero Section */}
        <section style={{ textAlign: "center", marginBottom: "5rem" }}>
          <h2
            style={{
              fontSize: "3.5rem",
              fontWeight: "800",
              marginBottom: "1.5rem",
              background: "linear-gradient(to right, #60a5fa, #c084fc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-1px",
            }}
          >
            Code Together, Without Limits
          </h2>
          <p
            style={{
              fontSize: "1.25rem",
              color: "#94a3b8",
              maxWidth: "800px",
              margin: "0 auto",
              lineHeight: "1.7",
            }}
          >
            CodeStream is the ultimate collaborative coding platform. Join dynamic rooms, write code in real-time, and
            brainstorm solutions with brilliant developers around the world. We bring the entire IDE ecosystem right into
            your browser.
          </p>
        </section>

        {/* Dashboard Content Container */}
        <div style={{ position: "relative" }}>
          {!isLoggedIn && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(15, 23, 42, 0.5)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <h3 style={{ fontSize: "2.2rem", marginBottom: "1rem", fontWeight: "700", color: "white" }}>
                Ready to Join the Community?
              </h3>
              <p style={{ marginBottom: "2.5rem", color: "#cbd5e1", fontSize: "1.2rem" }}>
                Log in to explore active rooms and start coding together instantly.
              </p>
              <button
                onClick={handleLogin}
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  padding: "1rem 3rem",
                  fontSize: "1.25rem",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 15px 30px -5px rgba(16, 185, 129, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(16, 185, 129, 0.4)";
                }}
              >
                Get Started Now
              </button>
            </div>
          )}

          {/* Rooms Area */}
          <div
            style={{
              filter: isLoggedIn ? "none" : "blur(8px)",
              transition: "filter 0.4s ease",
              backgroundColor: "rgba(30, 41, 59, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              padding: "3rem",
              borderRadius: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2.5rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                paddingBottom: "1.5rem",
              }}
            >
              <h3 style={{ fontSize: "1.75rem", color: "white", fontWeight: "700", margin: 0 }}>Active Rooms</h3>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={() => setIsJoinModalOpen(true)}
                  disabled={!isLoggedIn}
                  style={{
                    background: isLoggedIn ? "rgba(59, 130, 246, 0.1)" : "#334155",
                    color: isLoggedIn ? "#60a5fa" : "#94a3b8",
                    padding: "0.75rem",
                    border: isLoggedIn ? "1px solid rgba(59, 130, 246, 0.3)" : "none",
                    borderRadius: "8px",
                    cursor: isLoggedIn ? "pointer" : "not-allowed",
                    minWidth: "120px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (isLoggedIn) {
                      e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isLoggedIn) {
                      e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
                    }
                  }}
                >
                  Join Room
                </button>
                
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  disabled={!isLoggedIn}
                  style={{
                    background: isLoggedIn ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "#475569",
                    color: "white",
                    padding: "0.75rem 1.75rem",
                    border: "none",
                    borderRadius: "8px",
                    cursor: isLoggedIn ? "pointer" : "not-allowed",
                    fontWeight: "600",
                    transition: "all 0.2s",
                    boxShadow: isLoggedIn ? "0 4px 14px rgba(59, 130, 246, 0.3)" : "none",
                  }}
                >
                  + Create Room
                </button>
              </div>
            </div>

            {/* Room List Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "2rem",
              }}
            >
              {rooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    padding: "2rem",
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    transition: "all 0.3s ease",
                    cursor: isLoggedIn ? "pointer" : "default",
                  }}
                  onMouseEnter={(e) => {
                    if (isLoggedIn) {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.borderColor = "rgba(96, 165, 250, 0.5)";
                      e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.5)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isLoggedIn) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: "#10b981",
                        marginRight: "0.75rem",
                        boxShadow: "0 0 10px #10b981",
                      }}
                    />
                    <h4 style={{ margin: 0, color: "white", fontSize: "1.25rem", fontWeight: "600" }}>{room.name}</h4>
                  </div>
                  <p style={{ margin: "0 0 1.5rem 0", color: "#94a3b8", fontSize: "1rem", lineHeight: "1.5" }}>
                    {room.description}
                  </p>
                  <button
                    disabled={!isLoggedIn}
                    style={{
                      backgroundColor: isLoggedIn ? "rgba(59, 130, 246, 0.1)" : "#334155",
                      color: isLoggedIn ? "#60a5fa" : "#94a3b8",
                      padding: "0.75rem",
                      border: isLoggedIn ? "1px solid rgba(59, 130, 246, 0.3)" : "none",
                      borderRadius: "8px",
                      cursor: isLoggedIn ? "pointer" : "not-allowed",
                      width: "100%",
                      fontWeight: "600",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (isLoggedIn) {
                        e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isLoggedIn) {
                        e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
                      }
                    }}
                    onClick={() => {
                        if (isLoggedIn) {
                            setJoinRoomId(room.id);
                            setIsJoinModalOpen(true);
                        }
                    }}
                  >
                    Join Code Space
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features & Advantages Section (Always Visible) */}
        <section style={{ marginBottom: "5rem" }}>
          <h3 style={{ fontSize: "2rem", fontWeight: "700", textAlign: "center", margin: "3rem" }}>
            Why Choose CodeStream?
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "2rem",
            }}
          >
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(30, 41, 59, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "16px",
                  padding: "2rem",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 10px 30px -10px rgba(0,0,0,0.5)";
                  e.currentTarget.style.background = "rgba(30, 41, 59, 0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "rgba(30, 41, 59, 0.5)";
                }}
              >
                <div style={{ marginBottom: "1.25rem", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0.75rem", borderRadius: "10px", background: "rgba(255,255,255,0.05)" }}>
                  {feature.icon}
                </div>
                <h4 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.75rem", color: "white" }}>
                  {feature.title}
                </h4>
                <p style={{ color: "#94a3b8", lineHeight: "1.6", margin: 0 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Create Room Modal */}
        {isCreateModalOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100, backdropFilter: "blur(4px)" }}>
            <div style={{ backgroundColor: "#1e293b", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "400px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
              <h3 style={{ fontSize: "1.5rem", color: "white", marginBottom: "1.5rem", marginTop: 0 }}>Create Code Space</h3>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", color: "#cbd5e1", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Room Name</label>
                <input type="text" value={createRoomName} onChange={(e) => setCreateRoomName(e.target.value)} placeholder="e.g., Next.js Setup" style={{ width: "92%", padding: "0.75rem", borderRadius: "6px", backgroundColor: "#0f172a", border: "1px solid #334155", color: "white", outline: "none" }} />
              </div>
              <div style={{ marginBottom: "2rem" }}>
                <label style={{ display: "block", color: "#cbd5e1", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Primary Language</label>
                <select value={createRoomLanguage} onChange={(e) => setCreateRoomLanguage(e.target.value)} style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", backgroundColor: "#0f172a", border: "1px solid #334155", color: "white", outline: "none" }}>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button onClick={() => setIsCreateModalOpen(false)} style={{ padding: "0.6rem 1.2rem", borderRadius: "6px", backgroundColor: "transparent", color: "#cbd5e1", border: "1px solid transparent", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.borderColor = "#334155"} onMouseLeave={(e) => e.currentTarget.style.borderColor = "transparent"}>Cancel</button>
                <button onClick={submitCreateRoom} style={{ padding: "0.6rem 1.2rem", borderRadius: "6px", backgroundColor: "#3b82f6", color: "white", border: "none", cursor: "pointer", fontWeight: "600", boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)" }}>Create Room</button>
              </div>
            </div>
          </div>
        )}

        {/* Join Room Modal */}
        {isJoinModalOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100, backdropFilter: "blur(4px)" }}>
            <div style={{ backgroundColor: "#1e293b", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "400px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
              <h3 style={{ fontSize: "1.5rem", color: "white", marginBottom: "1.5rem", marginTop: 0 }}>Join Code Space</h3>
              <div style={{ marginBottom: "2rem" }}>
                <label style={{ display: "block", color: "#cbd5e1", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Room ID</label>
                <input type="text" value={joinRoomId} onChange={(e) => setJoinRoomId(e.target.value)} placeholder="e.g., 17135891..." style={{ width: "92%", padding: "0.75rem", borderRadius: "6px", backgroundColor: "#0f172a", border: "1px solid #334155", color: "white", outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button onClick={() => setIsJoinModalOpen(false)} style={{ padding: "0.6rem 1.2rem", borderRadius: "6px", backgroundColor: "transparent", color: "#cbd5e1", border: "1px solid transparent", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.borderColor = "#334155"} onMouseLeave={(e) => e.currentTarget.style.borderColor = "transparent"}>Cancel</button>
                <button onClick={submitJoinRoom} style={{ padding: "0.6rem 1.2rem", borderRadius: "6px", backgroundColor: "#10b981", color: "white", border: "none", cursor: "pointer", fontWeight: "600", boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)" }}>Join Room</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
