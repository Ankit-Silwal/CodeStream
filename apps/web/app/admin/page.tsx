"use client";

import React, { useEffect, useState } from "react";
import { KeyRound, Plus, ShieldCheck } from "lucide-react";
import { api, getApiErrorMessage } from "../../lib/api";
import { getSessionUser, saveSession } from "../../lib/auth";

type TeacherAccount = {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export default function AdminPage() {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teachers, setTeachers] = useState<TeacherAccount[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const loadTeachers = async () => {
    const res = await api.get("/auth/admin/teachers");
    setTeachers(res.data.data ?? []);
  };

  useEffect(() => {
    const user = getSessionUser();
    if (user?.role === "admin") {
      setIsAdmin(true);
      loadTeachers().catch(() => setIsAdmin(false));
    }
  }, []);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await api.post("/auth/admin/login", {
        email: adminEmail,
        password: adminPassword,
      });
      saveSession(res.data.data.token, res.data.data.user);
      setIsAdmin(true);
      await loadTeachers();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Admin login failed"));
    }
  };

  const createTeacher = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/auth/admin/teachers", {
        name: teacherName,
        email: teacherEmail,
        password: teacherPassword,
      });
      setTeacherName("");
      setTeacherEmail("");
      setTeacherPassword("");
      setMessage("Teacher account created.");
      await loadTeachers();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Could not create teacher"));
    }
  };

  if (!isAdmin) {
    return (
      <main className="auth-shell admin-auth-shell">
        <form className="auth-card" onSubmit={login}>
          <div className="auth-icon">
            <ShieldCheck size={24} />
          </div>
          <p className="eyebrow">Admin console</p>
          <h1>Create teacher access</h1>
          <label className="form-label">
            Admin email
            <input
              className="form-input"
              type="email"
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
            />
          </label>
          <label className="form-label">
            Password
            <input
              className="form-input"
              type="password"
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button className="primary-button auth-submit">
            <KeyRound size={16} />
            <span>Open admin</span>
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="teacher-shell">
      <header className="exam-topbar">
        <div className="brand-mark">
          <ShieldCheck size={18} />
          <span>Admin Console</span>
        </div>
      </header>
      <section className="admin-layout">
        <form className="teacher-panel" onSubmit={createTeacher}>
          <p className="eyebrow">New teacher</p>
          <label className="form-label">
            Teacher name
            <input
              className="form-input"
              value={teacherName}
              onChange={(event) => setTeacherName(event.target.value)}
            />
          </label>
          <label className="form-label">
            Teacher Gmail
            <input
              className="form-input"
              type="email"
              value={teacherEmail}
              onChange={(event) => setTeacherEmail(event.target.value)}
            />
          </label>
          <label className="form-label">
            Temporary password
            <input
              className="form-input"
              type="text"
              value={teacherPassword}
              onChange={(event) => setTeacherPassword(event.target.value)}
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-success">{message}</p>}
          <button className="primary-button auth-submit">
            <Plus size={16} />
            <span>Create Teacher</span>
          </button>
        </form>

        <section className="dashboard-content">
          <div className="section-title">
            <h2>Teacher Accounts</h2>
            <span>{teachers.length} total</span>
          </div>
          <div className="exam-list">
            {teachers.map((teacher) => (
              <article className="exam-card" key={teacher.id}>
                <span className={teacher.is_active ? "status-pill active" : "status-pill"}>teacher</span>
                <h3>{teacher.name}</h3>
                <p>{teacher.email}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
