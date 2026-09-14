"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Code2,
  ShieldAlert,
  ShieldCheck,
  Send,
} from "lucide-react";
import {
  AttemptAnswer,
  calculatePenaltyAdjustedScore,
  Exam,
  ExamLanguage,
  ExamQuestion,
  getStoredExams,
  languages,
  SecurityEvent,
} from "../../../lib/exam";

export default function ExamAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;
  const [exam, setExam] = useState<Exam | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AttemptAnswer>>({});
  const [language, setLanguage] = useState<ExamLanguage>("python");
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [warning, setWarning] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [startedAt] = useState(Date.now());
  const lastInputAt = useRef(Date.now());
  const activeQuestion = exam?.questions[activeIndex];

  const recordEvent = useCallback(
    (
      type: SecurityEvent["type"],
      message: string,
      penalty: number,
      questionId = activeQuestion?.id,
    ) => {
      if (!exam) return;
      const event: SecurityEvent = {
        id: crypto.randomUUID(),
        examId: exam.id,
        questionId,
        type,
        message,
        penalty,
        createdAt: new Date().toISOString(),
      };
      setEvents((current) => [event, ...current]);
      setWarning(message);
      window.setTimeout(() => setWarning(""), 2800);
    },
    [activeQuestion?.id, exam],
  );

  useEffect(() => {
    const storedExams = getStoredExams();
    const found = storedExams.find((item) => item.id === examId) ?? storedExams[0] ?? null;
    setExam(found);
    if (found) {
      const initialAnswers = Object.fromEntries(
        found.questions.map((question) => [
          question.id,
          {
            questionId: question.id,
            code: question.starterCode.python,
            language: "python" as ExamLanguage,
            typedCharacters: 0,
            pastedCharacters: 0,
          },
        ]),
      );
      setAnswers(initialAnswers);
    }
  }, [examId]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) recordEvent("tab-switch", "Leaving the exam tab is recorded.", 0);
    };
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) recordEvent("fullscreen-exit", "Fullscreen was exited during the exam.", 0);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [recordEvent]);

  const remainingMinutes = exam ? Math.max(0, exam.durationMinutes - Math.floor((Date.now() - startedAt) / 60000)) : 0;

  const score = useMemo(() => {
    if (!exam) return { raw: 0, adjusted: 0, penalty: 0 };
    return exam.questions.reduce(
      (acc, question) => {
        const answer = answers[question.id];
        const hadPaste = Boolean(answer?.pastedCharacters);
        const isCorrect =
          question.type === "mcq"
            ? answer?.selectedOption === question.correctOption
            : Boolean(answer?.code?.trim());
        const raw = isCorrect ? question.points : 0;
        const adjusted = isCorrect ? calculatePenaltyAdjustedScore(question.points, question.penalty, hadPaste) : 0;
        return {
          raw: acc.raw + raw,
          adjusted: acc.adjusted + adjusted,
          penalty: acc.penalty + Math.max(0, raw - adjusted),
        };
      },
      { raw: 0, adjusted: 0, penalty: 0 },
    );
  }, [answers, exam]);

  const updateAnswer = (question: ExamQuestion, patch: Partial<AttemptAnswer>) => {
    setAnswers((current) => ({
      ...current,
      [question.id]: {
        questionId: question.id,
        language,
        typedCharacters: 0,
        pastedCharacters: 0,
        ...current[question.id],
        ...patch,
      },
    }));
  };

  const handleCodeChange = (value: string | undefined) => {
    if (!activeQuestion || value === undefined) return;
    const now = Date.now();
    const previous = answers[activeQuestion.id]?.code ?? "";
    const delta = Math.max(0, value.length - previous.length);
    const elapsedSeconds = Math.max(0.1, (now - lastInputAt.current) / 1000);
    if (delta / elapsedSeconds > 35 && delta > 20) {
      recordEvent("typing-spike", "Unusual typing speed detected and recorded.", 0);
    }
    lastInputAt.current = now;
    updateAnswer(activeQuestion, {
      code: value,
      typedCharacters: (answers[activeQuestion.id]?.typedCharacters ?? 0) + delta,
      language,
    });
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    if (!activeQuestion) return;
    const pasted = event.clipboardData.getData("text");
    updateAnswer(activeQuestion, {
      pastedCharacters: (answers[activeQuestion.id]?.pastedCharacters ?? 0) + pasted.length,
    });
    recordEvent(
      "paste",
      `Copy/paste detected. This question can lose ${activeQuestion.penalty} marks even when correct.`,
      activeQuestion.penalty,
      activeQuestion.id,
    );
  };

  const finishExam = () => {
    if (!exam) return;
    const payload = {
      examId: exam.id,
      submittedAt: new Date().toISOString(),
      score,
      answers,
      securityEvents: events,
    };
    localStorage.setItem(`codestream-attempt-${exam.id}`, JSON.stringify(payload));
    setSubmitted(true);
  };

  if (!exam || !activeQuestion) {
    return <main className="exam-shell"><div className="loading-state">Loading exam...</div></main>;
  }

  const answer = answers[activeQuestion.id];
  const currentLanguage = languages.find((item) => item.id === language) ?? {
    id: "python" as ExamLanguage,
    label: "Python",
    monaco: "python",
  };

  return (
    <main className="attempt-shell" onPaste={handlePaste}>
      <header className="attempt-topbar">
        <button className="icon-action" onClick={() => router.push("/dashboard")} title="Back to dashboard">
          <ArrowLeft size={18} />
        </button>
        <div>
          <strong>{exam.title}</strong>
          <span>{exam.questions.length} questions</span>
        </div>
        <div className="attempt-status">
          <Clock3 size={16} />
          <span>{remainingMinutes} min left</span>
        </div>
        <button className="primary-button" onClick={finishExam}>
          <Send size={16} />
          <span>Finish</span>
        </button>
      </header>

      {warning && (
        <div className="warning-toast">
          <AlertTriangle size={17} />
          <span>{warning}</span>
        </div>
      )}

      {submitted ? (
        <section className="result-view">
          <ShieldCheck size={42} />
          <h1>Exam submitted</h1>
          <p>
            Raw score {score.raw}, penalty {score.penalty}, final score {score.adjusted}.
            Teacher review data has been saved for this attempt.
          </p>
          <button className="primary-button" onClick={() => router.push("/dashboard")}>Return to dashboard</button>
        </section>
      ) : (
        <section className="attempt-grid">
          <aside className="question-nav">
            {exam.questions.map((question, index) => (
              <button
                className={index === activeIndex ? "question-tab active" : "question-tab"}
                key={question.id}
                onClick={() => setActiveIndex(index)}
              >
                <span>{index + 1}</span>
                <strong>{question.title}</strong>
                <small>{question.points} marks</small>
              </button>
            ))}
            <div className="security-feed">
              <div className="feed-title">
                <ShieldAlert size={15} />
                <span>Security Events</span>
              </div>
              {events.length === 0 ? <p>No warnings yet.</p> : events.slice(0, 5).map((event) => <p key={event.id}>{event.message}</p>)}
            </div>
          </aside>

          <section className="question-pane">
            <div className="prompt-panel">
              <div className="question-meta">
                <span className="status-pill">{activeQuestion.type}</span>
                <span>{activeQuestion.points} marks</span>
                <span>{activeQuestion.penalty} mark paste penalty</span>
              </div>
              <h1>{activeQuestion.title}</h1>
              <p>{activeQuestion.prompt || "No prompt supplied yet."}</p>
              {activeQuestion.type === "coding" && (
                <div className="complexity-row">
                  <span>Time: {activeQuestion.timeComplexity}</span>
                  <span>Space: {activeQuestion.spaceComplexity}</span>
                </div>
              )}
            </div>

            {activeQuestion.type === "mcq" ? (
              <div className="mcq-panel">
                {(activeQuestion.options ?? []).map((option, index) => (
                  <button
                    className={answer?.selectedOption === index ? "choice selected" : "choice"}
                    key={`${activeQuestion.id}-${index}`}
                    onClick={() => updateAnswer(activeQuestion, { selectedOption: index })}
                  >
                    <CheckCircle2 size={16} />
                    <span>{option || `Option ${index + 1}`}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="coding-panel">
                <div className="editor-toolbar">
                  <div className="language-tabs">
                    {exam.allowedLanguages.map((item) => {
                      const label = languages.find((lang) => lang.id === item)?.label ?? item.toUpperCase();
                      return (
                        <button
                          className={language === item ? "language-chip selected" : "language-chip"}
                          key={item}
                          onClick={() => {
                            setLanguage(item);
                            updateAnswer(activeQuestion, {
                              language: item,
                              code: answers[activeQuestion.id]?.code || activeQuestion.starterCode[item],
                            });
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <button className="subtle-button">
                    <Code2 size={15} />
                    <span>Run Tests</span>
                  </button>
                </div>
                <Editor
                  height="48vh"
                  theme="vs-dark"
                  language={currentLanguage.monaco}
                  value={answer?.code ?? activeQuestion.starterCode[language]}
                  onChange={handleCodeChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbersMinChars: 3,
                    padding: { top: 12 },
                  }}
                />
                <div className="testcase-preview">
                  {activeQuestion.testCases.filter((tc) => !tc.isHidden).map((testCase) => (
                    <div key={testCase.id}>
                      <strong>Input</strong>
                      <code>{testCase.input || "Not provided"}</code>
                      <strong>Expected</strong>
                      <code>{testCase.expectedOutput || "Not provided"}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </section>
      )}
    </main>
  );
}
