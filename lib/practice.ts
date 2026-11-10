import { all, get, isoNow, run, todayKey } from "./db";
import { LANGUAGE_SUBJECTS, type QuestionRow } from "./matchmaking";

export function publicQuestion(row: QuestionRow) {
  return {
    id: row.id,
    subjectId: row.subject_id,
    difficulty: row.difficulty,
    marks: Number(row.marks),
    prompt: row.prompt,
    options: JSON.parse(row.options) as string[],
  };
}

export async function questionsForUser(user: any, subjectId: string): Promise<QuestionRow[]> {
  const questions = await all<QuestionRow>(
    "SELECT * FROM questions WHERE subject_id = ? AND status = 'approved'",
    subjectId
  );
  return questions.filter((q) => {
    if (subjectId === "math_std" && q.math_track === "extended") return false;
    if (subjectId === "math_ext" && q.math_track !== "extended") return false;
    if (LANGUAGE_SUBJECTS.includes(subjectId)) {
      if (!q.language_division || q.language_division === "any") return true;
      return q.language_division === user.language_division;
    }
    return true;
  });
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickBalanced(questions: QuestionRow[], count: number): QuestionRow[] {
  const tiers = ["easy", "medium", "hard"];
  const perTier = Math.max(1, Math.floor(count / tiers.length));
  const picked: QuestionRow[] = [];
  for (const tier of tiers) {
    picked.push(...shuffle(questions.filter((q) => q.difficulty === tier)).slice(0, perTier));
  }
  if (picked.length < count) {
    const used = new Set(picked.map((q) => q.id));
    picked.push(...shuffle(questions.filter((q) => !used.has(q.id))).slice(0, count - picked.length));
  }
  return picked.slice(0, count);
}

export async function ensureDailyChallenge() {
  const date = todayKey();
  const existing = await get<any>("SELECT * FROM daily_challenges WHERE date = ?", date);
  if (existing) return existing;
  const subject = await get<any>(
    `SELECT s.* FROM subjects s WHERE s.active = 1 AND s.category IN ('math','science','humanities','language')
     ORDER BY (SELECT COUNT(*) FROM questions q WHERE q.subject_id = s.id AND q.status = 'approved') DESC LIMIT 1`
  );
  if (!subject) return null;
  const pool = await all<QuestionRow>(
    "SELECT * FROM questions WHERE subject_id = ? AND status = 'approved' ORDER BY RANDOM() LIMIT 5",
    subject.id
  );
  if (pool.length < 5) return null;
  const row = {
    id: `daily_${date}`,
    date,
    subject_id: subject.id,
    question_ids: JSON.stringify(pool.map((q) => q.id)),
    xp_reward: 50,
    coin_reward: 10,
  };
  await run(
    "INSERT INTO daily_challenges (id, date, subject_id, question_ids, xp_reward, coin_reward) VALUES (?, ?, ?, ?, ?, ?)",
    row.id,
    row.date,
    row.subject_id,
    row.question_ids,
    row.xp_reward,
    row.coin_reward
  );
  return row;
}

export function practiceRewards(kind: string, score: number, total: number) {
  if (kind === "daily") {
    const passed = score >= Math.ceil(total * 0.8);
    return { xp: passed ? 50 : 15, coins: passed ? 10 : 0 };
  }
  if (kind === "mock") {
    return { xp: score * 12, coins: score * 4 };
  }
  return { xp: score * 8, coins: Math.floor(score / 2) * 2 };
}

export async function getAttemptForUser(attemptId: string, userId: string) {
  await run(
    "UPDATE quiz_attempts SET status = 'expired' WHERE user_id = ? AND status = 'active' AND started_at < ?",
    userId,
    new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  );
  return await get<any>("SELECT * FROM quiz_attempts WHERE id = ? AND user_id = ?", attemptId, userId);
}

export function attemptSummary(row: any) {
  return {
    id: row.id,
    kind: row.kind,
    subjectId: row.subject_id,
    score: Number(row.score),
    total: Number(row.total),
    xpAwarded: Number(row.xp_awarded),
    coinsAwarded: Number(row.coins_awarded),
    startedAt: row.started_at,
    completedAt: row.completed_at,
    status: row.status,
  };
}

export const nowIso = isoNow;
