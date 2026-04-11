"use client";
import { useRouter } from "next/navigation";

export default function RoomError({ error }: { error: string }) {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d1117",
        color: "#e6edf3",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "12px",
          padding: "32px",
          width: "380px",
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "48px",
            height: "48px",
            margin: "0 auto 16px",
            borderRadius: "50%",
            background: "#da3633",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            fontWeight: "bold",
          }}
        >
          !
        </div>

        {/* Title */}
        <h2 style={{ marginBottom: "8px", fontSize: "20px" }}>
          Failed to join room
        </h2>

        {/* Message */}
        <p
          style={{
            fontSize: "14px",
            color: "#8b949e",
            marginBottom: "20px",
          }}
        >
          {error || "This room does not exist or you don't have access."}
        </p>

        {/* Action */}
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            background: "#1f6feb",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Go back to dashboard
        </button>

        {/* Auto redirect note */}
        <p
          style={{
            marginTop: "12px",
            fontSize: "12px",
            color: "#6e7681",
          }}
        >
          Redirecting automatically...
        </p>
      </div>
    </div>
  );
}
