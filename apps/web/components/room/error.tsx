"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RoomError({ error }: { error: string }) {
  const router = useRouter();

  return (
    <main className="room-error-shell">
      <section className="room-error-card">
        <div className="room-error-icon">
          <AlertCircle size={26} />
        </div>
        <h2>Failed to join room</h2>
        <p>{error || "This room does not exist or you don't have access."}</p>
        <button className="primary-button" onClick={() => router.push("/dashboard")}>
          <ArrowLeft size={16} />
          <span>Back to dashboard</span>
        </button>
        <small>Redirecting automatically...</small>
      </section>
    </main>
  );
}
