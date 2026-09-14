"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, LogIn } from "lucide-react";
import { api, getApiErrorMessage } from "../../../lib/api";
import { saveSession } from "../../../lib/auth";

export default function StudentLoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/student/login", { name, email });
      saveSession(res.data.data.token, res.data.data.user);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Could not start student session"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={login}>
        <div className="auth-icon">
          <GraduationCap size={24} />
        </div>
        <p className="eyebrow">Student access</p>
        <h1>Register or login as student</h1>
        <label className="form-label">
          Full name
          <input className="form-input" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="form-label">
          Email
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button className="primary-button auth-submit" disabled={loading}>
          <LogIn size={16} />
          <span>{loading ? "Signing in" : "Register / Login"}</span>
        </button>
      </form>
    </main>
  );
}
