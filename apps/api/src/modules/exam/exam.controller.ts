import type { Request, Response } from "express";
import { createExam, getExam, listExams, saveAttempt } from "./exam.service.js";

const fallbackStarterCode = {
  c: "#include <stdio.h>\n\nint main(void) {\n  return 0;\n}\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  return 0;\n}\n",
  python: "def solve():\n    pass\n\nif __name__ == \"__main__\":\n    solve()\n",
  java: "public class Main {\n  public static void main(String[] args) {\n  }\n}\n",
};

export async function createExamController(req: Request, res: Response) {
  if (!req.userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!req.body?.title || !Array.isArray(req.body?.questions)) {
    return res.status(400).json({ success: false, message: "Missing exam title or questions" });
  }

  const exam = await createExam({
    title: req.body.title,
    teacherId: req.userId,
    durationMinutes: Number(req.body.durationMinutes ?? 60),
    status: req.body.status ?? "draft",
    allowedLanguages: req.body.allowedLanguages ?? ["c", "cpp", "python", "java"],
    security: {
      pastePenaltyEnabled: Boolean(req.body.security?.pastePenaltyEnabled ?? true),
      fullscreenRequired: Boolean(req.body.security?.fullscreenRequired ?? true),
      tabSwitchWarnings: Number(req.body.security?.tabSwitchWarnings ?? 3),
      rateLimitPerMinute: Number(req.body.security?.rateLimitPerMinute ?? 60),
    },
    questions: req.body.questions,
  });

  return res.status(201).json({ success: true, data: exam });
}

export async function listExamsController(req: Request, res: Response) {
  if (!req.userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const exams = await listExams(req.userId);
  return res.json({ success: true, data: exams });
}

export async function getExamController(req: Request, res: Response) {
  const examId = String(req.params.examId ?? "");
  if (!examId) return res.status(400).json({ success: false, message: "Missing exam id" });
  const exam = await getExam(examId);
  if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
  return res.json({ success: true, data: exam });
}

export async function submitAttemptController(req: Request, res: Response) {
  if (!req.userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const examId = String(req.params.examId ?? "");
  if (!examId) return res.status(400).json({ success: false, message: "Missing exam id" });
  const attempt = await saveAttempt({
    examId,
    studentId: req.userId,
    rawScore: Number(req.body.rawScore ?? 0),
    penaltyScore: Number(req.body.penaltyScore ?? 0),
    finalScore: Number(req.body.finalScore ?? 0),
    answers: req.body.answers ?? {},
    securityEvents: req.body.securityEvents ?? [],
  });
  return res.status(201).json({ success: true, data: attempt });
}

export async function importLeetCodeController(req: Request, res: Response) {
  const url = String(req.body?.url ?? "");
  const slug = url.split("/problems/")[1]?.split("/")[0];
  if (!slug) {
    return res.status(400).json({ success: false, message: "Please provide a valid LeetCode problem URL" });
  }

  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: `https://leetcode.com/problems/${slug}/`,
    },
    body: JSON.stringify({
      query: `
        query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            title
            content
            difficulty
            exampleTestcases
            sampleTestCase
            codeSnippets { langSlug code }
          }
        }
      `,
      variables: { titleSlug: slug },
    }),
  });

  if (!response.ok) {
    return res.status(502).json({ success: false, message: "LeetCode import failed" });
  }

  const payload = (await response.json()) as any;
  const question = payload?.data?.question;
  if (!question) {
    return res.status(404).json({ success: false, message: "LeetCode question not found" });
  }

  const starters = { ...fallbackStarterCode };
  for (const snippet of question.codeSnippets ?? []) {
    if (snippet.langSlug === "c") starters.c = snippet.code;
    if (snippet.langSlug === "cpp") starters.cpp = snippet.code;
    if (snippet.langSlug === "python3") starters.python = snippet.code;
    if (snippet.langSlug === "java") starters.java = snippet.code;
  }

  const examples = String(question.exampleTestcases || question.sampleTestCase || "")
    .split("\n")
    .filter(Boolean)
    .slice(0, 6)
    .map((input, index) => ({
      id: `leetcode-${index + 1}`,
      input,
      expectedOutput: "",
      isHidden: index > 1,
    }));

  return res.json({
    success: true,
    data: {
      title: question.title,
      type: "coding",
      prompt: String(question.content ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
      points: 10,
      penalty: 4,
      difficulty: question.difficulty,
      timeComplexity: "Teacher review required",
      spaceComplexity: "Teacher review required",
      starterCode: starters,
      testCases: examples,
      sourceUrl: url,
    },
  });
}
