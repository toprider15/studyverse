import { all } from "./db";

export const LANGUAGE_SUBJECTS = ["spanish_cap", "spanish_em", "french_reg", "french_em", "hindi", "german"];

export type PlayerRow = {
  id: string;
  username: string;
  display_name: string;
  role: string;
  status: string;
  class_id: string | null;
  language_division: string | null;
  math_track: string | null;
  xp: number;
};

export type QuestionRow = {
  id: string;
  subject_id: string;
  difficulty: string;
  marks: number;
  prompt: string;
  options: string;
  correct_index: number;
  explanation: string | null;
  status: string;
  language_division: string | null;
  math_track: string | null;
};

export function canMatch(a: PlayerRow, b: PlayerRow, subjectId: string): boolean {
  if (!a || !b) return false;
  if (a.id === b.id) return false;
  if (a.role !== "student" || b.role !== "student") return false;
  if (a.status !== "active" || b.status !== "active") return false;

  if (subjectId === "math_ext") {
    return a.math_track === "extended" && b.math_track === "extended";
  }
  if (subjectId === "math_std") {
    // Extended students may step down into Standard. Standard questions are
    // always used, so a Standard student is never shown Extended-only content.
    return true;
  }
  if (LANGUAGE_SUBJECTS.includes(subjectId)) {
    if (a.language_division === "german" || b.language_division === "german") return true;
    return a.language_division === b.language_division;
  }
  return true;
}

export function needsNeutralQuestions(a: PlayerRow, b: PlayerRow, subjectId: string): boolean {
  if (!LANGUAGE_SUBJECTS.includes(subjectId)) return false;
  if (a.language_division === "german" && b.language_division === "german") return false;
  return a.language_division !== b.language_division || a.language_division === "german" || b.language_division === "german";
}

export function eligibleQuestions(
  questions: QuestionRow[],
  subjectId: string,
  a: PlayerRow,
  b: PlayerRow,
  neutral: boolean
): QuestionRow[] {
  return questions.filter((q) => {
    if (q.status !== "approved") return false;
    if (q.subject_id !== subjectId) return false;
    if (subjectId === "math_std" && q.math_track === "extended") return false;
    if (subjectId === "math_ext" && q.math_track !== "extended") return false;
    if (neutral) return q.language_division === "any";
    if (q.language_division && q.language_division !== "any") {
      return q.language_division === a.language_division && q.language_division === b.language_division;
    }
    return true;
  });
}

export async function eligibleOpponents(user: PlayerRow, subjectId: string) {
  const students = await all<PlayerRow & { class_name: string | null }>(
    `SELECT u.*, c.name AS class_name FROM users u
     LEFT JOIN classes c ON c.id = u.class_id
     WHERE u.role = 'student' AND u.status = 'active' AND u.id <> ?
     ORDER BY u.xp DESC`,
    user.id
  );
  return students.filter((candidate) => canMatch(user, candidate, subjectId));
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Picks an identical, difficulty-balanced question set for both players.
 * Each difficulty tier contributes the same number of questions and marks,
 * so neither player receives an easier paper.
 */
export async function selectMatchQuestions(subjectId: string, a: PlayerRow, b: PlayerRow, count = 6) {
  const neutral = needsNeutralQuestions(a, b, subjectId);
  const pool = await all<QuestionRow>(
    "SELECT * FROM questions WHERE subject_id = ? AND status = 'approved'",
    subjectId
  );
  const eligible = eligibleQuestions(pool, subjectId, a, b, neutral);
  const tiers = ["easy", "medium", "hard"];
  const perTier = Math.max(1, Math.floor(count / tiers.length));
  const picked: QuestionRow[] = [];
  for (const tier of tiers) {
    picked.push(...shuffle(eligible.filter((q) => q.difficulty === tier)).slice(0, perTier));
  }
  if (picked.length < count) {
    const used = new Set(picked.map((q) => q.id));
    picked.push(...shuffle(eligible.filter((q) => !used.has(q.id))).slice(0, count - picked.length));
  }
  return { questions: picked, neutral };
}
