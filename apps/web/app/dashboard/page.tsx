"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "../../components/dashboard/Navbar";
import { JoinRoomModal } from "../../components/dashboard/JoinRoomModal";
import { CreateRoomModal, CreateRoomPayload } from "../../components/dashboard/CreateRoomModal";
import { Stats } from "../../components/dashboard/Stats";
import { AppSidebar as Sidebar } from "../../components/dashboard/AppSidebar";
import { RoomGrid } from "../../components/dashboard/RoomGrid";
import { api } from "../../lib/api";

export interface Room {
  id: string;
  name: string;
  language: string;
  members: number;
  status: string;
}

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name?: string } | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms,setLoadingRooms]=useState<boolean>(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joining,setJoining]=useState<boolean>(false);
  const [joinError,setJoinError]=useState<string>("");

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
  useEffect(()=>{
    const fetchRooms=async ()=>{
      try{
        const res=await api.get('/room/all');
        if (res.data?.data) {
          setRooms(res.data.data);
        } else {
          setRooms([]);
        }
      }catch(err){
        console.error("Error occred as",err);
      }finally{
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  },[])

  const handleLogin = () => { globalThis.location.href = "http://localhost:5000/auth/google"; };
  const handleLogout = () => { localStorage.removeItem("token"); setUser(null); setIsLoggedIn(false); };

  const submitCreateRoom = (data: CreateRoomPayload) => {
    if (!data.name.trim()) return;
    setRooms([...rooms, {
      id: Date.now().toString(),
      name: data.name,
      language: data.language,
      members: 1,
      status: "live",
    }]);
    setIsCreateModalOpen(false);
  };

  const submitJoinRoom = (roomId: string) => {
    alert(`Joining room: ${roomId}`);
    setIsJoinModalOpen(false);
  };

  const activeRooms = rooms.filter((r) => r.status === "live").length;
  const totalMembers = rooms.reduce((acc, r) => acc + (r.members || 0), 0);

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
      `}} />
      {/* ── Navbar ── */}
      <Navbar isLoggedIn={isLoggedIn}
      user={user}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onJoinOpen={()=>setIsJoinModalOpen(true)}
      onOpenCreate={()=>setIsCreateModalOpen(true)}/>

      {/* ── Layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 49px)" }}>

        {/* ── Sidebar ── */}
        <Sidebar rooms={rooms} />

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
          <Stats activeRooms={activeRooms} totalMembers={totalMembers} />

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
            <RoomGrid rooms={rooms} isLoggedIn={isLoggedIn} onOpenCreate={() => setIsCreateModalOpen(true)} />
          </div>
        </div>
      </div>

      {/* ── Create Room Modal ── */}
      <CreateRoomModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreate={submitCreateRoom} 
      />

      {/* ── Join Room Modal ── */}
      <JoinRoomModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
        onJoin={submitJoinRoom} 
      />
    </div>
  );
}


