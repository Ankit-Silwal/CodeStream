import React, { useState } from "react";

interface CreatedRoomModalProps {
  isOpen: boolean;
  roomId: string | null;
  onClose: () => void;
  onGoToRoom: () => void;
}

export const CreatedRoomModal: React.FC<CreatedRoomModalProps> = ({ isOpen, roomId, onClose, onGoToRoom }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
        <button onClick={onClose} style={{
          position: "absolute", top: "12px", right: "12px", background: "none",
          border: "none", cursor: "pointer", color: "var(--muted)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "4px", borderRadius: "4px"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
          </svg>
        </button>

        <h2 style={{ fontSize: "16px", fontWeight: "600", marginTop: 0, marginBottom: "8px" }}>Room Created Successfully!</h2>
        <p style={{ fontSize: "14px", color: "var(--muted)", margin: "0 0 20px 0" }}>Share this room ID with your teammates to let them join.</p>

        <div style={{
          display: "flex",
          alignItems: "center",
          background: "var(--bg)",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid var(--border)",
          marginBottom: "24px",
          justifyContent: "space-between"
        }}>
          <span style={{ fontSize: "14px", fontFamily: "monospace", color: "var(--text)", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis" }}>
            {roomId}
          </span>
          <button onClick={handleCopy} style={{
            background: "white", border: "1px solid var(--border)", borderRadius: "6px",
            padding: "6px 12px", fontSize: "13px", cursor: "pointer",
            color: "var(--text)", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}>
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path></svg>
                Copied
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path><path fillRule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path></svg>
                Copy
              </>
            )}
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button onClick={onClose} style={{
            background: "white", color: "var(--text)", padding: "8px 16px",
            fontSize: "14px", border: "1px solid var(--border)", borderRadius: "8px",
            cursor: "pointer", fontWeight: "600"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}>
            Cancel
          </button>
          <button onClick={onGoToRoom} style={{
            background: "#1f6feb", color: "white", padding: "8px 16px",
            fontSize: "14px", border: "none", borderRadius: "8px",
            cursor: "pointer", fontWeight: "600"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1a5ed4")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1f6feb")}>
            Go to Room
          </button>
        </div>
      </div>
    </div>
  );
};
