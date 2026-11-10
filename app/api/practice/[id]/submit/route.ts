import { all, get, isoNow, run, todayKey } from "@/lib/db";
import { ApiError, requireUser } from "@/lib/auth";
import { fail, ok, readBody } from "@/lib/http";
import { getAttemptForUser, practiceRewards } from "@/lib/practice";
import { awardCoins, awardXp, bumpSubjectProgress, evaluateAchievements, logActivity, notify, touchStreak } from "@/lib/rewards";
import type { QuestionRow } from "@/lib/matchmaking";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const body = await readBody<{ answers?: { questionId?: string; answerIndex?: number; elapsedMs?: number }[] }>(request);
    const attempt = await getAttemptForUser(id, user.id);
    if (!attempt) throw new ApiError(404, "Attempt not found.");
    if (attempt.status !== "active") throw new ApiError(409, "This attempt has already been submitted.");

    const ids: string[] = JSON.parse(attempt.question_ids);
    const questions = await all<QuestionRow>(
      "SELECT * FROM questions WHERE id IN (" + ids.map(() => "?").join(",") + ")",
      ...ids
    );
    const byId = new Map(questions.map((q) => [q.id, q]));
    const submitted = new Map<string, { answerIndex: number; elapsedMs: number }>();
    for (const answer of body.answers ?? []) {
      if (!answer.questionId) continue;
      const index = Number(answer.answerIndex);
      if (!Number.isInteger(index) || index < 0 || index > 5) continue;
      submitted.set(answer.questionId, {
        answerIndex: index,
        elapsedMs: Math.max(0, Math.min(600000, Number(answer.elapsedMs) || 0)),
      });
    }

    const review: any[] = [];
    const stored: any[] = [];
    let score = 0;
    for (const questionId of ids) {
      const question = byId.get(questionId);
      if (!question) continue;
      const answer = submitted.get(questionId);
      const answerIndex = answer ? answer.answerIndex : -1;
      const correct = answerIndex === Number(question.correct_index);
      if (correct) score += 1;
      const options = JSON.parse(question.options) as string[];
      review.push({
        questionId: question.id,
        prompt: question.prompt,
        options,
        correctIndex: Number(question.correct_index),
        chosenIndex: answerIndex,
        correct,
        explanation: question.explanation,
        difficulty: question.difficulty,
      });
      stored.push({
        questionId: question.id,
        answerIndex,
        correct,
        elapsedMs: answer?.elapsedMs ?? 0,
      });
    }

    const total = ids.length;
    const accuracy = total ? Math.round((score / total) * 100) : 0;
    const rewards = practiceRewards(attempt.kind, score, total);
    const now = isoNow();
    await run(
      `UPDATE quiz_attempts SET answers = ?, score = ?, total = ?, xp_awarded = ?, coins_awarded = ?,
       completed_at = ?, status = 'complete' WHERE id = ?`,
      JSON.stringify(stored),
      score,
      total,
      rewards.xp,
      rewards.coins,
      now,
      id
    );
    if (attempt.kind === "daily") {
      await run(
        "INSERT OR IGNORE INTO daily_challenge_attempts (id, user_id, date, score, total, completed_at) VALUES (?, ?, ?, ?, ?, ?)",
        `dca_${user.id}_${todayKey()}`,
        user.id,
        todayKey(),
        score,
        total,
        now
      );
      notify(
        user.id,
        score >= Math.ceil(total * 0.8) ? "Daily challenge complete" : "Daily challenge finished",
        `${score}/${total} correct. ${rewards.xp} XP${rewards.coins ? ` and ${rewards.coins} coins` : ""} awarded.`,
        "daily",
        "/academy/revision"
      );
    }
    awardXp(user.id, rewards.xp, `${attempt.kind === "mock" ? "Mock assessment" : attempt.kind === "daily" ? "Daily challenge" : "Practice quiz"} — ${attempt.subject_id}`, id);
    if (rewards.coins) awardCoins(user.id, rewards.coins, "Study rewards", id);
    bumpSubjectProgress(user.id, attempt.subject_id, total, score, rewards.xp);
    touchStreak(user.id);
    logActivity(
      user.id,
      "quiz",
      attempt.kind === "mock" ? "Completed a mock assessment" : attempt.kind === "daily" ? "Completed the daily challenge" : "Completed a practice quiz",
      `${attempt.subject_id} · ${score}/${total} correct · +${rewards.xp} XP`,
      attempt.kind === "mock" ? "📝" : attempt.kind === "daily" ? "⭐" : "🎯"
    );
    evaluateAchievements(user.id);

    return ok({ score, total, accuracy, xp: rewards.xp, coins: rewards.coins, review, kind: attempt.kind, subjectId: attempt.subject_id });
  } catch (error) {
    return fail(error);
  }
}
