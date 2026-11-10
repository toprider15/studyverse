import { all, get, isoNow, run, todayKey } from "@/lib/db";
import { ApiError, requireUser } from "@/lib/auth";
import { fail, ok, readBody } from "@/lib/http";
import { ensureDailyChallenge, pickBalanced, publicQuestion, questionsForUser } from "@/lib/practice";
import { uid } from "@/lib/password";
import type { QuestionRow } from "@/lib/matchmaking";
import { subjectDto } from "@/lib/serialize";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await readBody<any>(request);
    const kind = ["practice", "mock", "daily"].includes(body.kind) ? body.kind : "practice";
    let subjectId = String(body.subjectId ?? "");
    let count = kind === "mock" ? 10 : kind === "daily" ? 5 : Math.min(15, Math.max(3, Number(body.count) || 5));
    let questions: QuestionRow[] = [];
    let challenge: any = null;

    if (kind === "daily") {
      challenge = await ensureDailyChallenge();
      if (!challenge) throw new ApiError(400, "No daily challenge is available yet.");
      subjectId = challenge.subject_id;
      const done = (await get("SELECT id FROM daily_challenge_attempts WHERE user_id = ? AND date = ?", user.id, todayKey());
      if (done) throw new ApiError(409, "You have already completed today's challenge. Come back tomorrow!");
      const ids: string[] = JSON.parse(challenge.question_ids);
      const rows = await all<QuestionRow>("SELECT * FROM questions WHERE id IN (" + ids.map(() => "?").join(",") + ")", ...ids);
      const byId = new Map(rows.map((q) => [q.id, q]));
      questions = ids.map((id) => byId.get(id))).filter(Boolean) as QuestionRow[];
      count = questions.length;
    } else {
      const subject = await get<any>("SELECT * FROM subjects WHERE id = ? AND active = 1", subjectId);
      if (!subject) throw new ApiError(404, "Subject not found.");
      questions = pickBalanced(await questionsForUser(user, subjectId), count);
      if (questions.length < 3) throw new ApiError(400, "There are not enough approved questions for this subject yet.");
      count = questions.length;
    }

    const subject = await get<any>("SELECT * FROM subjects WHERE id = ?", subjectId);
    const id = uid("att");
    const now = isoNow();
    await run(
      `INSERT INTO quiz_attempts (id, user_id, kind, subject_id, question_ids, answers, score, total,
        xp_awarded, coins_awarded, started_at, completed_at, status)
       VALUES (?, ?, ?, ?, ?, NULL, 0, ?, 0, 0, ?, NULL, 'active')`,
      id,
      user.id,
      kind,
      subjectId,
      JSON.stringify(questions.map((q) => q.id)),
      count,
      now
    );
    return ok({
      attemptId: id,
      kind,
      subject: subjectDto(subject),
      questions: questions.map(publicQuestion),
      xpReward: kind === "daily" ? challenge?.xp_reward ?? 50 : null,
      coinReward: kind === "daily" ? challenge?.coin_reward ?? 10 : null,
      timeLimitSec: kind === "mock" ? count * 90 : count * 60,
    });
  } catch (error) {
    return fail(error);
  }
}
