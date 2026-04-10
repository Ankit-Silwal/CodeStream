import React from 'react';
import { Room } from './AppSidebar';
import { RoomCard } from './RoomCard';

interface RoomGridProps {
  rooms: Room[];
  isLoggedIn: boolean;
  onOpenCreate: () => void;
}

export function RoomGrid({ rooms, isLoggedIn, onOpenCreate }: RoomGridProps) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span style={{ fontSize: "14px", fontWeight: "600" }}>Active rooms</span>
        <span style={{ fontSize: "12px", color: "var(--muted)" }}>{rooms.length} rooms</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} isLoggedIn={isLoggedIn} />
        ))}

        {isLoggedIn && (
          <div
            onClick={onOpenCreate}
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
    </>
  );
}