"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/dashboard/Navbar";
import { JoinRoomModal } from "../../components/dashboard/JoinRoomModal";
import { CreateRoomModal, CreateRoomPayload } from "../../components/dashboard/CreateRoomModal";
import { CreatedRoomModal } from "../../components/dashboard/CreatedRoomModal";
import { LeaveRoomModal } from "../../components/dashboard/LeaveRoomModal";
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
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name?: string } | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [roomToLeave, setRoomToLeave] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingAuth(false);
      return;
    }
    fetch("http://localhost:5000/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) { setUser(data.user); setIsLoggedIn(true); }
      })
      .catch(() => {})
      .finally(() => setLoadingAuth(false));
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    const fetchRooms = async () => {
      try {
        const res = await api.get('/room/all');
        if (res.data?.data) {
          setRooms(res.data.data);
        } else {
          setRooms([]);
        }
      } catch (err) {
        console.error("Error occurred while fetching rooms", err);
        setRooms([]);
      }
    };
    fetchRooms();
  }, [isLoggedIn]);

  const handleLogin = () => { globalThis.location.href = "http://localhost:5000/auth/google"; };
  const handleLogout = () => { localStorage.removeItem("token"); setUser(null); setIsLoggedIn(false); };

  const submitCreateRoom = async (data: CreateRoomPayload) => {
    if (!data.name.trim() || !isLoggedIn) return;
    try {
      const res = await api.post("/room/", {
        name: data.name,
        language: data.language,
        is_private: data.visibility === "Private",
      });
      if (res.data?.success && res.data?.data?.id) {
        setIsCreateModalOpen(false);
        setCreatedRoomId(res.data.data.id);
      }
    } catch (err) {
      console.error("Failed to create room", err);
    }
  };

  const submitJoinRoom = (roomId: string) => {
    if (!roomId.trim()) return;
    setIsJoinModalOpen(false);
    router.push(`/room/${roomId}`);
  };

  const submitLeaveRoom = async () => {
    if (!roomToLeave || !isLoggedIn) return;
    setIsLeaving(true);
    try {
      const res = await api.delete("/room/", { data: { roomId: roomToLeave } });
      if (res.data?.success) {
        setRooms(prev => prev.filter(r => r.id !== roomToLeave));
        setRoomToLeave(null);
      }
    } catch (err: unknown) {
      console.error("Failed to leave room", err);
      const e = err as { response?: { data?: { message?: string } } };
      if (e.response?.data?.message) {
        alert(e.response.data.message);
      } else {
        alert("Failed to leave room.");
      }
    } finally {
      setIsLeaving(false);
    }
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
                {activeRooms} rooms active · {totalMembers} developers online <span style={{ fontSize: "10px", color: "#d29922", marginLeft: "6px" }}>🔨 under construction</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <Stats activeRooms={activeRooms} totalMembers={totalMembers} />

          {/* Blurred overlay for logged-out */}
          <div style={{ position: "relative" }}>
            {!loadingAuth && !isLoggedIn && (
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
            <RoomGrid 
              rooms={rooms} 
              isLoggedIn={isLoggedIn} 
              onOpenCreate={() => setIsCreateModalOpen(true)} 
              onJoinRoom={submitJoinRoom} 
              onLeaveRoom={(id) => setRoomToLeave(id)}
            />
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

      {/* ── Created Room Modal ── */}
      <CreatedRoomModal
        isOpen={!!createdRoomId}
        roomId={createdRoomId}
        onClose={() => setCreatedRoomId(null)}
        onGoToRoom={() => createdRoomId && router.push(`/room/${createdRoomId}`)}
      />

      {/* ── Leave Room Modal ── */}
      <LeaveRoomModal
        isOpen={!!roomToLeave}
        onClose={() => setRoomToLeave(null)}
        onConfirm={submitLeaveRoom}
        isLoading={isLeaving}
      />
    </div>
  );
}


