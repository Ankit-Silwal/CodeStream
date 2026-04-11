import React from "react";

interface LeaveRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function LeaveRoomModal({ isOpen, onClose, onConfirm, isLoading }: LeaveRoomModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "var(--modal)", display: "flex", justifyContent: "center",
      alignItems: "center", zIndex: 100
    }}>
      <div style={{
        background: "var(--card)", padding: "24px", borderRadius: "12px",
        width: "400px", maxWidth: "90%", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        position: "relative"
      }}>
        {/* Close Button */}
        <button onClick={onClose} disabled={isLoading} style={{
          position: "absolute", top: "12px", right: "12px", background: "none",
          border: "none", cursor: isLoading ? "not-allowed" : "pointer", color: "var(--muted)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "4px", borderRadius: "4px"
        }}
        onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = "var(--hover)"; }}
        onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = "transparent"; }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
          </svg>
        </button>

        <h2 style={{ fontSize: "18px", fontWeight: "600", marginTop: 0, marginBottom: "8px" }}>Leave Room?</h2>
        <p style={{ fontSize: "14px", color: "var(--muted)", margin: "0 0 24px 0", lineHeight: "1.5" }}>
          Are you sure you want to leave this room? If you are the owner, this room will be permanently deleted for everyone.
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button 
            onClick={onClose}
            disabled={isLoading}
            style={{
              background: "white", color: "var(--text)", padding: "8px 16px",
              fontSize: "14px", border: "1px solid var(--border)", borderRadius: "8px",
              cursor: isLoading ? "not-allowed" : "pointer", fontWeight: "600"
            }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = "var(--hover)"; }}
            onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = "white"; }}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              background: "#cf222e", color: "white", padding: "8px 16px",
              fontSize: "14px", border: "none", borderRadius: "8px",
              cursor: isLoading ? "not-allowed" : "pointer", fontWeight: "600",
              opacity: isLoading ? 0.7 : 1
            }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = "#a40e26"; }}
            onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = "#cf222e"; }}
          >
            {isLoading ? "Leaving..." : "Leave Room"}
          </button>
        </div>
      </div>
    </div>
  );
}