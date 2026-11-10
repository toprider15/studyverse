import { authenticate, createSession, safeUser } from "@/lib/auth";
import { fail, ok, readBody } from "@/lib/http";
import { evaluateAchievements, grantAchievement, touchStreak } from "@/lib/rewards";

export async function POST(request: Request) {
  try {
    const body = await readBody<{ username?: string; password?: string }>(request);
    const row = await authenticate(String(body.username ?? "").trim(), String(body.password ?? ""));
    await createSession(row.id);
    touchStreak(row.id);
    grantAchievement(row.id, "welcome");
    evaluateAchievements(row.id);
    return ok({ user: safeUser(row) });
  } catch (error) {
    return fail(error);
  }
}
