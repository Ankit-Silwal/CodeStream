"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileQuestion,
  Import,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { api } from "../../lib/api";
import {
  emptyStarterCode,
  Exam,
  ExamLanguage,
  ExamQuestion,
  languages,
  saveStoredExam,
} from "../../lib/exam";

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

  useEffect(() => {
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
  }, []);

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

  const saveExam = () => {
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
    saveStoredExam(exam);
    setSavedId(exam.id);
    router.push("/dashboard");
  };

  return (
    <main className="teacher-shell">
      <header className="exam-topbar">
        <div className="brand-mark">
          <FileQuestion size={18} />
          <span>Teacher Section</span>
        </div>
        <nav className="topbar-actions">
          <button className="ghost-button" onClick={() => router.push("/dashboard")}>
            <ArrowLeft size={16} />
            <span>Dashboard</span>
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
          </div>
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
