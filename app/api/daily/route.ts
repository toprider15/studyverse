import { get, todayKey } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { ensureDailyChallenge } from "@/lib/practice";
import { subjectDto } from "@/lib/serialize";

export async function GET() {
  try {
    const user = await requireUser();
    const challenge = await ensureDailyChallenge();
    if (!challenge) return ok({ challenge: null, completed: false });
    const subject = await get<any>("SELECT * FROM subjects WHERE id = ?", challenge.subject_id);
    const attempt = await get<any>(
      "SELECT * FROM daily_challenge_attempts WHERE user_id = ? AND date = ?",
      user.id,
      todayKey()
    );
    return ok({
      challenge: {
        id: challenge.id,
        date: challenge.date,
        subject: subject ? subjectDto(subject) : null,
        questionCount: JSON.parse(challenge.question_ids).length,
        xpReward: Number(challenge.xp_reward),
        coinReward: Number(challenge.coin_reward),
      },
      completed: Boolean(attempt),
      result: attempt ? { score: Number(attempt.score), total: Number(attempt.total) } : null,
      streak: Number(user.streak),
    });
  } catch (error) {
    return fail(error);
  }
}
