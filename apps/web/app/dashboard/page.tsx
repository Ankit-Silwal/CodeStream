"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BookOpenCheck,
  Clock3,
  FileCode2,
  GraduationCap,
  LockKeyhole,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { Exam, getStoredExams } from "../../lib/exam";

export default function Dashboard() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [userName, setUserName] = useState("Teacher");

  useEffect(() => {
    setExams(getStoredExams());
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.name) setUserName(data.user.name.split(" ")[0]);
      })
      .catch(() => {});
  }, []);

  const totals = useMemo(() => {
    const questionCount = exams.reduce((sum, exam) => sum + exam.questions.length, 0);
    const codingCount = exams.reduce(
      (sum, exam) => sum + exam.questions.filter((q) => q.type === "coding").length,
      0,
    );
    const maxScore = exams.reduce(
      (sum, exam) => sum + exam.questions.reduce((total, q) => total + q.points, 0),
      0,
    );
    return { questionCount, codingCount, maxScore };
  }, [exams]);

  return (
    <main className="exam-shell">
      <header className="exam-topbar">
        <div className="brand-mark">
          <ShieldCheck size={18} />
          <span>CodeStream Exams</span>
        </div>
        <nav className="topbar-actions" aria-label="Primary actions">
          <button className="ghost-button" onClick={() => router.push("/teacher")}>
            <Plus size={16} />
            <span>Teacher Section</span>
          </button>
          <button className="primary-button" onClick={() => router.push(`/exam/${exams[0]?.id ?? "secure-dsa-101"}`)}>
            <FileCode2 size={16} />
            <span>Open Exam</span>
          </button>
        </nav>
      </header>

      <section className="workspace-grid">
        <aside className="exam-sidebar">
          <button className="side-item active">
            <BookOpenCheck size={16} />
            <span>Assessments</span>
          </button>
          <button className="side-item" onClick={() => router.push("/teacher")}>
            <GraduationCap size={16} />
            <span>Teacher</span>
          </button>
          <button className="side-item">
            <LockKeyhole size={16} />
            <span>Security Policy</span>
          </button>
        </aside>

        <section className="dashboard-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">Assessment control center</p>
              <h1>Good day, {userName}</h1>
              <p>
                Create secured MCQ and coding exams with paste penalties, typing telemetry,
                complexity targets, and language-specific starter code.
              </p>
            </div>
            <button className="primary-button" onClick={() => router.push("/teacher")}>
              <Plus size={16} />
              <span>Create Exam</span>
            </button>
          </div>

          <div className="metric-row">
            <Metric label="Active exams" value={String(exams.filter((e) => e.status === "active").length)} />
            <Metric label="Questions" value={String(totals.questionCount)} />
            <Metric label="Coding tasks" value={String(totals.codingCount)} />
            <Metric label="Total marks" value={String(totals.maxScore)} />
          </div>

          <div className="policy-band">
            <ShieldCheck size={22} />
            <div>
              <strong>Candidate protection is enabled.</strong>
              <span>
                Repeated paste, tab switching, fullscreen exits, and unnatural typing spikes
                trigger warnings and configurable mark deductions.
              </span>
            </div>
          </div>

          <div className="section-title">
            <h2>Exam Library</h2>
            <span>{exams.length} exams</span>
          </div>

          <div className="exam-list">
            {exams.map((exam) => {
              const marks = exam.questions.reduce((sum, q) => sum + q.points, 0);
              const coding = exam.questions.filter((q) => q.type === "coding").length;
              const mcq = exam.questions.filter((q) => q.type === "mcq").length;
              return (
                <article className="exam-card" key={exam.id}>
                  <div className="exam-card-header">
                    <div>
                      <span className={`status-pill ${exam.status}`}>{exam.status}</span>
                      <h3>{exam.title}</h3>
                    </div>
                    <button className="icon-action" onClick={() => router.push(`/exam/${exam.id}`)} title="Start exam">
                      <FileCode2 size={18} />
                    </button>
                  </div>
                  <p>
                    {coding} coding questions, {mcq} MCQs, {marks} marks. Languages:
                    {" "}{exam.allowedLanguages.map((lang) => lang.toUpperCase()).join(", ")}.
                  </p>
                  <div className="exam-meta">
                    <span><Clock3 size={14} /> {exam.durationMinutes} min</span>
                    <span><AlertTriangle size={14} /> paste penalty on</span>
                    <span><LockKeyhole size={14} /> DoS limits {exam.security.rateLimitPerMinute}/min</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-tile">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
