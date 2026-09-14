"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  FileQuestion,
  Import,
  LogIn,
  LogOut,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { api, getApiErrorMessage } from "../../lib/api";
import {
  emptyStarterCode,
  Exam,
  ExamLanguage,
  ExamQuestion,
  languages,
} from "../../lib/exam";
import { clearSession, getSessionUser, saveSession } from "../../lib/auth";

type AttemptReview = {
  examId: string;
  submittedAt: string;
  score: {
    raw: number;
    adjusted: number;
    penalty: number;
  };
  securityEvents: Array<{ id: string; message: string; penalty: number }>;
};

const makeQuestion = (type: "mcq" | "coding"): ExamQuestion => ({
  id: crypto.randomUUID(),
  title: type === "mcq" ? "New MCQ Question" : "New Coding Question",
  type,
  points: type === "mcq" ? 5 : 10,
  penalty: type === "mcq" ? 1 : 4,
  prompt: "",
  options: type === "mcq" ? ["", "", "", ""] : undefined,
  correctOption: type === "mcq" ? 0 : undefined,
  difficulty: "Medium",
  timeComplexity: type === "coding" ? "O(n)" : undefined,
  spaceComplexity: type === "coding" ? "O(n)" : undefined,
  starterCode: emptyStarterCode,
  testCases:
    type === "coding"
      ? [{ id: crypto.randomUUID(), input: "", expectedOutput: "", isHidden: false }]
      : [],
});

export default function TeacherPage() {
  const router = useRouter();
  const [title, setTitle] = useState("New Secure Assessment");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [questions, setQuestions] = useState<ExamQuestion[]>([makeQuestion("coding")]);
  const [allowedLanguages, setAllowedLanguages] = useState<ExamLanguage[]>(["c", "cpp", "python", "java"]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [attempts, setAttempts] = useState<AttemptReview[]>([]);
  const [saveError, setSaveError] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const user = getSessionUser();
    if (!localStorage.getItem("token") || user?.role !== "teacher") {
      return;
    }
    setIsTeacher(true);

    const reviews = Object.keys(localStorage)
      .filter((key) => key.startsWith("codestream-attempt-"))
      .map((key) => {
        try {
          return JSON.parse(localStorage.getItem(key) ?? "") as AttemptReview;
        } catch {
          return null;
        }
      })
      .filter((item): item is AttemptReview => Boolean(item));
    setAttempts(reviews);
  }, [router]);

  const totalMarks = useMemo(() => questions.reduce((sum, q) => sum + Number(q.points || 0), 0), [questions]);
  const totalPenalty = useMemo(() => questions.reduce((sum, q) => sum + Number(q.penalty || 0), 0), [questions]);

  const updateQuestion = (id: string, patch: Partial<ExamQuestion>) => {
    setQuestions((current) => current.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const importLeetCode = async () => {
    if (!leetcodeUrl.trim()) return;
    setImporting(true);
    try {
      const res = await api.post("/exams/import/leetcode", { url: leetcodeUrl });
      if (res.data?.data) {
        setQuestions((current) => [{ ...res.data.data, id: crypto.randomUUID() }, ...current]);
        setLeetcodeUrl("");
      }
    } catch {
      const slug = leetcodeUrl
        .split("/problems/")[1]
        ?.split("/")[0]
        ?.replaceAll("-", " ");
      setQuestions((current) => [
        {
          ...makeQuestion("coding"),
          title: slug ? slug.replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Imported Coding Question",
          prompt:
            "Imported LeetCode-style prompt. Review the statement, constraints, examples, and hidden tests before publishing.",
          sourceUrl: leetcodeUrl,
        },
        ...current,
      ]);
    } finally {
      setImporting(false);
    }
  };

  const saveExam = async () => {
    setSaveError("");
    const exam: Exam = {
      id: savedId ?? crypto.randomUUID(),
      title,
      durationMinutes,
      status: "active",
      startsAt: new Date().toISOString(),
      questions,
      allowedLanguages,
      security: {
        pastePenaltyEnabled: true,
        fullscreenRequired: true,
        tabSwitchWarnings: 3,
        rateLimitPerMinute: 60,
      },
    };
    try {
      const res = await api.post("/exams", exam);
      setSavedId(res.data?.data?.id ?? exam.id);
    } catch (err: unknown) {
      setSaveError(getApiErrorMessage(err, "Could not publish exam"));
    }
  };

  const logout = () => {
    clearSession();
    setIsTeacher(false);
    setLoginPassword("");
  };

  const loginTeacher = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await api.post("/auth/teacher/login", {
        email: loginEmail,
        password: loginPassword,
      });
      saveSession(res.data.data.token, res.data.data.user);
      setIsTeacher(true);
    } catch (err: unknown) {
      setLoginError(getApiErrorMessage(err, "Invalid teacher credentials"));
    } finally {
      setLoginLoading(false);
    }
  };

  if (!isTeacher) {
    return (
      <main className="auth-shell teacher-auth-shell">
        <form className="auth-card" onSubmit={loginTeacher}>
          <div className="auth-icon">
            <FileQuestion size={24} />
          </div>
          <p className="eyebrow">Teacher portal</p>
          <h1>Unlock teacher workspace</h1>
          <label className="form-label">
            Teacher Gmail
            <input
              className="form-input"
              type="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
            />
          </label>
          <label className="form-label">
            Password
            <input
              className="form-input"
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
            />
          </label>
          {loginError && <p className="auth-error">{loginError}</p>}
          <button className="primary-button auth-submit" disabled={loginLoading}>
            <LogIn size={16} />
            <span>{loginLoading ? "Unlocking" : "Unlock Teacher"}</span>
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="teacher-shell">
      <header className="exam-topbar">
        <div className="brand-mark">
          <FileQuestion size={18} />
          <span>Teacher Section</span>
        </div>
        <nav className="topbar-actions">
          <button className="ghost-button" onClick={logout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
          <button className="primary-button" onClick={saveExam}>
            <Save size={16} />
            <span>Publish Exam</span>
          </button>
        </nav>
      </header>

      <section className="teacher-layout">
        <aside className="teacher-panel">
          <p className="eyebrow">Exam setup</p>
          <label className="form-label">
            Exam title
            <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="form-label">
            Duration
            <input
              className="form-input"
              type="number"
              min={15}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </label>
          <div className="form-label">
            Languages
            <div className="language-grid">
              {languages.map((language) => (
                <button
                  className={allowedLanguages.includes(language.id) ? "language-chip selected" : "language-chip"}
                  key={language.id}
                  onClick={() =>
                    setAllowedLanguages((current) =>
                      current.includes(language.id)
                        ? current.filter((item) => item !== language.id)
                        : [...current, language.id],
                    )
                  }
                >
                  {language.label}
                </button>
              ))}
            </div>
          </div>
          <div className="teacher-summary">
            <span>Total marks <strong>{totalMarks}</strong></span>
            <span>Max paste penalty <strong>{totalPenalty}</strong></span>
            {savedId && <span>Published exam <strong>{savedId.slice(0, 8)}</strong></span>}
          </div>
          {saveError && <p className="auth-error">{saveError}</p>}
          <div className="review-list">
            <strong>Recent submissions</strong>
            {attempts.length === 0 ? (
              <span>No submitted attempts yet.</span>
            ) : (
              attempts.map((attempt) => (
                <div className="review-row" key={`${attempt.examId}-${attempt.submittedAt}`}>
                  <span>Exam {attempt.examId}</span>
                  <strong>{attempt.score.adjusted}/{attempt.score.raw}</strong>
                  <small>Penalty {attempt.score.penalty}</small>
                </div>
              ))
            )}
          </div>
          <div className="security-note">
            <ShieldAlert size={18} />
            <span>Paste tracking, tab-switch warnings, fullscreen checks, and typing-speed telemetry are enforced during the attempt.</span>
          </div>
        </aside>

        <section className="question-builder">
          <div className="import-row">
            <input
              className="form-input"
              placeholder="Paste a LeetCode problem URL"
              value={leetcodeUrl}
              onChange={(e) => setLeetcodeUrl(e.target.value)}
            />
            <button className="ghost-button" onClick={importLeetCode} disabled={importing}>
              <Import size={16} />
              <span>{importing ? "Importing" : "Import"}</span>
            </button>
            <button className="ghost-button" onClick={() => setQuestions((current) => [makeQuestion("mcq"), ...current])}>
              <Plus size={16} />
              <span>MCQ</span>
            </button>
            <button className="ghost-button" onClick={() => setQuestions((current) => [makeQuestion("coding"), ...current])}>
              <Plus size={16} />
              <span>Coding</span>
            </button>
          </div>

          {questions.map((question, index) => (
            <article className="question-editor" key={question.id}>
              <div className="question-toolbar">
                <span className="question-number">Question {index + 1}</span>
                <select
                  className="compact-select"
                  value={question.type}
                  onChange={(e) => updateQuestion(question.id, makeQuestion(e.target.value as "mcq" | "coding"))}
                >
                  <option value="coding">LeetCode coding</option>
                  <option value="mcq">MCQ</option>
                </select>
                <button
                  className="icon-action danger"
                  onClick={() => setQuestions((current) => current.filter((item) => item.id !== question.id))}
                  title="Delete question"
                >
                  <Trash2 size={17} />
                </button>
              </div>

              <div className="question-fields">
                <label className="form-label">
                  Title
                  <input className="form-input" value={question.title} onChange={(e) => updateQuestion(question.id, { title: e.target.value })} />
                </label>
                <label className="form-label">
                  Marks
                  <input className="form-input" type="number" min={1} value={question.points} onChange={(e) => updateQuestion(question.id, { points: Number(e.target.value) })} />
                </label>
                <label className="form-label">
                  Copy/paste penalty
                  <input className="form-input" type="number" min={0} value={question.penalty} onChange={(e) => updateQuestion(question.id, { penalty: Number(e.target.value) })} />
                </label>
              </div>

              <label className="form-label">
                Question prompt
                <textarea className="form-textarea" value={question.prompt} onChange={(e) => updateQuestion(question.id, { prompt: e.target.value })} />
              </label>

              {question.type === "mcq" ? (
                <div className="option-list">
                  {(question.options ?? []).map((option, optionIndex) => (
                    <label className="option-row" key={`${question.id}-option-${optionIndex}`}>
                      <input
                        type="radio"
                        checked={question.correctOption === optionIndex}
                        onChange={() => updateQuestion(question.id, { correctOption: optionIndex })}
                      />
                      <input
                        className="form-input"
                        placeholder={`Option ${optionIndex + 1}`}
                        value={option}
                        onChange={(e) => {
                          const next = [...(question.options ?? [])];
                          next[optionIndex] = e.target.value;
                          updateQuestion(question.id, { options: next });
                        }}
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <>
                  <div className="question-fields">
                    <label className="form-label">
                      Expected time complexity
                      <input className="form-input" value={question.timeComplexity ?? ""} onChange={(e) => updateQuestion(question.id, { timeComplexity: e.target.value })} />
                    </label>
                    <label className="form-label">
                      Expected space complexity
                      <input className="form-input" value={question.spaceComplexity ?? ""} onChange={(e) => updateQuestion(question.id, { spaceComplexity: e.target.value })} />
                    </label>
                  </div>
                  <div className="testcase-list">
                    {question.testCases.map((testCase, testIndex) => (
                      <div className="testcase-row" key={testCase.id}>
                        <input
                          className="form-input"
                          placeholder={`Input ${testIndex + 1}`}
                          value={testCase.input}
                          onChange={(e) => {
                            const next = question.testCases.map((item) =>
                              item.id === testCase.id ? { ...item, input: e.target.value } : item,
                            );
                            updateQuestion(question.id, { testCases: next });
                          }}
                        />
                        <input
                          className="form-input"
                          placeholder="Expected output"
                          value={testCase.expectedOutput}
                          onChange={(e) => {
                            const next = question.testCases.map((item) =>
                              item.id === testCase.id ? { ...item, expectedOutput: e.target.value } : item,
                            );
                            updateQuestion(question.id, { testCases: next });
                          }}
                        />
                        <label className="hidden-toggle">
                          <input
                            type="checkbox"
                            checked={testCase.isHidden}
                            onChange={(e) => {
                              const next = question.testCases.map((item) =>
                                item.id === testCase.id ? { ...item, isHidden: e.target.checked } : item,
                              );
                              updateQuestion(question.id, { testCases: next });
                            }}
                          />
                          Hidden
                        </label>
                      </div>
                    ))}
                    <button
                      className="subtle-button"
                      onClick={() =>
                        updateQuestion(question.id, {
                          testCases: [
                            ...question.testCases,
                            { id: crypto.randomUUID(), input: "", expectedOutput: "", isHidden: false },
                          ],
                        })
                      }
                    >
                      <CheckCircle2 size={15} />
                      <span>Add test case</span>
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
