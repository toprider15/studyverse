import { all, get, run, isoNow } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fail, ok, readBody, requireInt, requireString } from "@/lib/http";
import { awardXp, awardCoins, touchStreak, evaluateAchievements } from "@/lib/rewards";
import crypto from "node:crypto";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");
    const userId = searchParams.get("userId");
    let sql = `SELECT * FROM arcade_scores WHERE 1=1`;
    const params: unknown[] = [];
    if (gameId) { sql += ` AND game_key = ?`; params.push(gameId); }
    if (userId) { sql += ` AND user_id = ?`; params.push(userId); }
    sql += ` ORDER BY score DESC`;
    const scores = (await all<any>(sql, ...params)).map((s) => ({
      id: s.id, userId: s.user_id, gameId: s.game_key, score: Number(s.score),
      difficulty: s.difficulty, createdAt: s.created_at,
    }));
    return ok({ scores });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await readBody<{ gameId: string; score: number; difficulty: string }>(request);
    const gameId = requireString(body.gameId, "gameId");
    const score = requireInt(body.score, "score", 0, 1000000);
    const difficulty = requireString(body.difficulty ?? "normal", "difficulty");

    const id = `as_${crypto.randomBytes(6).toString("hex")}`;
    await run(
      `INSERT INTO arcade_scores (id, user_id, game_key, difficulty, score, duration_ms, created_at)
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
      id, user.id, gameId, difficulty, score, isoNow()
    );

    const xp = Math.floor(score / 10);
    const coins = Math.floor(score / 50);
    if (xp > 0) awardXp(user.id, xp, `Arcade: ${gameId}`, id);
    if (coins > 0) awardCoins(user.id, coins, `Arcade: ${gameId}`, id);
    touchStreak(user.id);
    evaluateAchievements(user.id);

    return ok({ ok: true, entry: { id, userId: user.id, gameId, score, difficulty } });
  } catch (error) {
    return fail(error);
  }
}
