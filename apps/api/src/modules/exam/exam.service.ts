import { pool } from "@repo/shared";

type ExamQuestionInput = {
  title: string;
  type: "mcq" | "coding";
  prompt: string;
  points: number;
  penalty: number;
  options?: string[];
  correctOption?: number;
  difficulty?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  starterCode?: Record<string, string>;
  testCases?: Array<{ input: string; expectedOutput: string; isHidden: boolean }>;
  sourceUrl?: string;
};

export type ExamInput = {
  title: string;
  teacherId: string;
  durationMinutes: number;
  status: "draft" | "scheduled" | "active" | "closed";
  allowedLanguages: string[];
  security: {
    pastePenaltyEnabled: boolean;
    fullscreenRequired: boolean;
    tabSwitchWarnings: number;
    rateLimitPerMinute: number;
  };
  questions: ExamQuestionInput[];
};

export async function createExam(data: ExamInput) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const exam = await client.query(
      `
      INSERT INTO exams (
        title, teacher_id, duration_minutes, status, allowed_languages,
        paste_penalty_enabled, fullscreen_required, tab_switch_warnings,
        rate_limit_per_minute
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        data.title,
        data.teacherId,
        data.durationMinutes,
        data.status,
        data.allowedLanguages,
        data.security.pastePenaltyEnabled,
        data.security.fullscreenRequired,
        data.security.tabSwitchWarnings,
        data.security.rateLimitPerMinute,
      ],
    );

    for (const question of data.questions) {
      await client.query(
        `
        INSERT INTO exam_questions (
          exam_id, title, question_type, prompt, points, paste_penalty,
          options, correct_option, difficulty, time_complexity, space_complexity,
          starter_code, test_cases, source_url
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        `,
        [
          exam.rows[0].id,
          question.title,
          question.type,
          question.prompt,
          question.points,
          question.penalty,
          JSON.stringify(question.options ?? []),
          question.correctOption ?? null,
          question.difficulty ?? null,
          question.timeComplexity ?? null,
          question.spaceComplexity ?? null,
          JSON.stringify(question.starterCode ?? {}),
          JSON.stringify(question.testCases ?? []),
          question.sourceUrl ?? null,
        ],
      );
    }

    await client.query("COMMIT");
    return getExam(exam.rows[0].id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listExams(userId: string) {
  const result = await pool.query(
    `
    SELECT e.*,
      COALESCE(COUNT(q.id), 0)::int AS question_count,
      COALESCE(SUM(q.points), 0)::int AS total_marks
    FROM exams e
    LEFT JOIN exam_questions q ON q.exam_id = e.id
    WHERE e.teacher_id = $1 OR e.status = 'active'
    GROUP BY e.id
    ORDER BY e.created_at DESC
    `,
    [userId],
  );
  return result.rows;
}

export async function getExam(examId: string) {
  const exam = await pool.query(`SELECT * FROM exams WHERE id = $1`, [examId]);
  if (exam.rows.length === 0) return null;

  const questions = await pool.query(
    `
    SELECT
      id, title, question_type AS type, prompt, points, paste_penalty AS penalty,
      options, correct_option AS "correctOption", difficulty,
      time_complexity AS "timeComplexity", space_complexity AS "spaceComplexity",
      starter_code AS "starterCode", test_cases AS "testCases", source_url AS "sourceUrl"
    FROM exam_questions
    WHERE exam_id = $1
    ORDER BY created_at ASC
    `,
    [examId],
  );

  const row = exam.rows[0];
  return {
    id: row.id,
    title: row.title,
    durationMinutes: row.duration_minutes,
    status: row.status,
    startsAt: row.starts_at,
    allowedLanguages: row.allowed_languages,
    security: {
      pastePenaltyEnabled: row.paste_penalty_enabled,
      fullscreenRequired: row.fullscreen_required,
      tabSwitchWarnings: row.tab_switch_warnings,
      rateLimitPerMinute: row.rate_limit_per_minute,
    },
    questions: questions.rows,
  };
}

export async function saveAttempt(data: {
  examId: string;
  studentId: string;
  rawScore: number;
  penaltyScore: number;
  finalScore: number;
  answers: unknown;
  securityEvents: Array<{
    questionId?: string;
    type: string;
    message: string;
    penalty: number;
    metadata?: unknown;
  }>;
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const attempt = await client.query(
      `
      INSERT INTO exam_attempts (
        exam_id, student_id, raw_score, penalty_score, final_score, answers, submitted_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,CURRENT_TIMESTAMP)
      RETURNING *
      `,
      [
        data.examId,
        data.studentId,
        data.rawScore,
        data.penaltyScore,
        data.finalScore,
        JSON.stringify(data.answers),
      ],
    );

    for (const event of data.securityEvents) {
      await client.query(
        `
        INSERT INTO exam_security_events (
          attempt_id, exam_id, question_id, event_type, message, penalty, metadata
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        `,
        [
          attempt.rows[0].id,
          data.examId,
          event.questionId ?? null,
          event.type,
          event.message,
          event.penalty,
          JSON.stringify(event.metadata ?? {}),
        ],
      );
    }

    await client.query("COMMIT");
    return attempt.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
