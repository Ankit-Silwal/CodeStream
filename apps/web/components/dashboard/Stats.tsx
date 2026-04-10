import React from 'react';

interface StatsProps {
  activeRooms: number;
  totalMembers: number;
}

export function Stats({ activeRooms, totalMembers }: StatsProps) {
  return (
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
  );
}