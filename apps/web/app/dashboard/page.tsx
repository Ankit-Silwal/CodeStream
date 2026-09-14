"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BookOpenCheck,
  Clock3,
  FileCode2,
  LockKeyhole,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { ExamLanguage } from "../../lib/exam";
import { api } from "../../lib/api";
import { clearSession, getSessionUser } from "../../lib/auth";

type ExamSummary = {
  id: string;
  title: string;
  status: "draft" | "scheduled" | "active" | "closed";
  duration_minutes: number;
  allowed_languages: ExamLanguage[];
  rate_limit_per_minute: number;
  question_count: number;
  total_marks: number;
};

export default function Dashboard() {
  const router = useRouter();
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [userName, setUserName] = useState("Student");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = getSessionUser();
    if (!token || !user) {
      router.replace("/student/login");
      return;
    }
    if (user.role === "teacher") {
      router.replace("/teacher");
      return;
    }
    if (user.role === "admin") {
      router.replace("/admin");
      return;
    }
    setUserName(user.name?.split(" ")[0] || "Student");

    api
      .get("/exams")
      .then((res) => res.data)
      .then((data) => {
        setExams(data.data ?? []);
      })
      .catch(() => {});
  }, [router]);

  const totals = useMemo(() => {
    const questionCount = exams.reduce((sum, exam) => sum + Number(exam.question_count ?? 0), 0);
    const maxScore = exams.reduce((sum, exam) => sum + Number(exam.total_marks ?? 0), 0);
    return { questionCount, maxScore };
  }, [exams]);

  const logout = () => {
    clearSession();
    router.replace("/student/login");
  };

  return (
    <main className="exam-shell">
      <header className="exam-topbar">
        <div className="brand-mark">
          <ShieldCheck size={18} />
          <span>CodeStream Exams</span>
        </div>
        <nav className="topbar-actions" aria-label="Primary actions">
          <button className="ghost-button" onClick={logout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
          <button className="primary-button" disabled={!exams[0]} onClick={() => router.push(`/exam/${exams[0]?.id}`)}>
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
          <button className="side-item">
            <LockKeyhole size={16} />
            <span>Security Policy</span>
          </button>
        </aside>

        <section className="dashboard-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">Student exam workspace</p>
              <h1>Good day, {userName}</h1>
              <p>
                Open active assessments assigned by your teacher, answer MCQs and coding
                questions, and submit your attempt with security events recorded.
              </p>
            </div>
          </div>

          <div className="metric-row">
            <Metric label="Active exams" value={String(exams.filter((e) => e.status === "active").length)} />
            <Metric label="Questions" value={String(totals.questionCount)} />
            <Metric label="Total marks" value={String(totals.maxScore)} />
            <Metric label="Assigned" value={String(exams.length)} />
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
                    {exam.question_count} questions, {exam.total_marks} marks. Languages:
                    {" "}{exam.allowed_languages.map((lang) => lang.toUpperCase()).join(", ")}.
                  </p>
                  <div className="exam-meta">
                    <span><Clock3 size={14} /> {exam.duration_minutes} min</span>
                    <span><AlertTriangle size={14} /> paste penalty on</span>
                    <span><LockKeyhole size={14} /> DoS limits {exam.rate_limit_per_minute}/min</span>
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
