"use client";

export type ExamLanguage = "c" | "cpp" | "python" | "java";
export type QuestionType = "mcq" | "coding";

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface ExamQuestion {
  id: string;
  title: string;
  type: QuestionType;
  points: number;
  penalty: number;
  prompt: string;
  options?: string[];
  correctOption?: number;
  difficulty?: "Easy" | "Medium" | "Hard";
  timeComplexity?: string;
  spaceComplexity?: string;
  starterCode: Record<ExamLanguage, string>;
  testCases: TestCase[];
  sourceUrl?: string;
}

export interface Exam {
  id: string;
  title: string;
  durationMinutes: number;
  status: "draft" | "scheduled" | "active" | "closed";
  startsAt: string;
  questions: ExamQuestion[];
  allowedLanguages: ExamLanguage[];
  security: {
    pastePenaltyEnabled: boolean;
    fullscreenRequired: boolean;
    tabSwitchWarnings: number;
    rateLimitPerMinute: number;
  };
}

export interface SecurityEvent {
  id: string;
  examId: string;
  questionId?: string;
  type: "paste" | "tab-switch" | "fullscreen-exit" | "typing-spike";
  message: string;
  penalty: number;
  createdAt: string;
}

export interface AttemptAnswer {
  questionId: string;
  code?: string;
  selectedOption?: number;
  language?: ExamLanguage;
  typedCharacters: number;
  pastedCharacters: number;
}

export const languages: { id: ExamLanguage; label: string; monaco: string }[] = [
  { id: "c", label: "C", monaco: "c" },
  { id: "cpp", label: "C++", monaco: "cpp" },
  { id: "python", label: "Python", monaco: "python" },
  { id: "java", label: "Java", monaco: "java" },
];

export const emptyStarterCode: Record<ExamLanguage, string> = {
  c: "#include <stdio.h>\n\nint main(void) {\n  return 0;\n}\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  return 0;\n}\n",
  python: "def solve():\n    pass\n\nif __name__ == \"__main__\":\n    solve()\n",
  java: "public class Main {\n  public static void main(String[] args) {\n  }\n}\n",
};

export const seedExams: Exam[] = [
  {
    id: "secure-dsa-101",
    title: "Secure DSA Assessment",
    durationMinutes: 75,
    status: "active",
    startsAt: new Date().toISOString(),
    allowedLanguages: ["c", "cpp", "python", "java"],
    security: {
      pastePenaltyEnabled: true,
      fullscreenRequired: true,
      tabSwitchWarnings: 3,
      rateLimitPerMinute: 60,
    },
    questions: [
      {
        id: "q-two-sum",
        title: "Two Sum",
        type: "coding",
        points: 10,
        penalty: 4,
        difficulty: "Easy",
        prompt:
          "Given an array of integers and a target, return indices of two numbers that add up to the target.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        starterCode: {
          ...emptyStarterCode,
          python:
            "from typing import List\n\nclass Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass\n",
          cpp:
            "#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n  vector<int> twoSum(vector<int>& nums, int target) {\n    return {};\n  }\n};\n",
          java:
            "class Solution {\n  public int[] twoSum(int[] nums, int target) {\n    return new int[]{};\n  }\n}\n",
        },
        testCases: [
          { id: "tc-1", input: "nums = [2,7,11,15], target = 9", expectedOutput: "[0,1]", isHidden: false },
          { id: "tc-2", input: "nums = [3,2,4], target = 6", expectedOutput: "[1,2]", isHidden: true },
        ],
      },
      {
        id: "q-complexity",
        title: "Hash Map Complexity",
        type: "mcq",
        points: 5,
        penalty: 1,
        prompt: "What is the average-case lookup time for a hash map?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctOption: 0,
        starterCode: emptyStarterCode,
        testCases: [],
      },
    ],
  },
];

export function getStoredExams() {
  if (typeof window === "undefined") return seedExams;
  const stored = window.localStorage.getItem("codestream-exams");
  if (!stored) {
    window.localStorage.setItem("codestream-exams", JSON.stringify(seedExams));
    return seedExams;
  }
  try {
    return JSON.parse(stored) as Exam[];
  } catch {
    window.localStorage.setItem("codestream-exams", JSON.stringify(seedExams));
    return seedExams;
  }
}

export function saveStoredExam(exam: Exam) {
  const exams = getStoredExams();
  const next = exams.some((item) => item.id === exam.id)
    ? exams.map((item) => (item.id === exam.id ? exam : item))
    : [exam, ...exams];
  window.localStorage.setItem("codestream-exams", JSON.stringify(next));
  return next;
}

export function calculatePenaltyAdjustedScore(points: number, penalty: number, hadPaste: boolean) {
  return Math.max(0, points - (hadPaste ? penalty : 0));
}
