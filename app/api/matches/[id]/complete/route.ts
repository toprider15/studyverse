import { NextRequest } from "next/server";
import { get, run, all } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await currentUser();
    if (!user) return fail(new Error("Unauthorized"));
    const match = await get<any>("SELECT * FROM matches WHERE id = ?", id);
    if (!match) return fail(new Error("Not found"));
    if (match.player1_id !== user.id && match.player2_id !== user.id) return fail(new Error("Forbidden"));
    if (match.status === "complete") {
      return ok({ match: { id, scores: { [match.player1_id]: match.p1_score, [match.player2_id]: match.p2_score }, winner: match.winner_id }, scores: { [match.player1_id]: match.p1_score, [match.player2_id]: match.p2_score }, winner: match.winner_id });
    }

    const qids = JSON.parse(match.question_ids || "[]");
    const qRows = qids.length ? await all<any>("SELECT * FROM questions WHERE id IN (" + qids.map(() => "?").join(",") + ")", ...qids) : [];
    const qMap = new Map(qRows.map((q: any) => [q.id, q]));
    const ansRows = await all<any>("SELECT * FROM match_answers WHERE match_id = ?", id);

    const scores: Record<string, number> = { [match.player1_id]: 0, [match.player2_id]: 0 };
    for (const pid of [match.player1_id, match.player2_id]) {
      const myAns = ansRows.filter((a: any) => a.user_id === pid);
      for (const a of myAns) {
        const q = qMap.get(a.question_id);
        if (!q) continue;
        if (a.correct) scores[pid] += Number(q.marks);
      }
    }

    const aScore = scores[match.player1_id];
    const bScore = scores[match.player2_id];
    let winner: string | null = null;
    if (aScore > bScore) winner = match.player1_id;
    else if (bScore > aScore) winner = match.player2_id;

    const xpFor = (pid: string, isWinner: boolean) => scores[pid] * 10 + (isWinner ? 50 : 10);
    const coinsFor = (pid: string, isWinner: boolean) => (isWinner ? 25 : 5) + Math.floor(scores[pid] / 2);

    const p1xp = xpFor(match.player1_id, winner === match.player1_id);
    const p2xp = xpFor(match.player2_id, winner === match.player2_id);
    const p1coins = coinsFor(match.player1_id, winner === match.player1_id);
    const p2coins = coinsFor(match.player2_id, winner === match.player2_id);

    await run(
      "UPDATE matches SET status = 'complete', p1_score = ?, p2_score = ?, winner_id = ?, xp_awarded = ?, coins_awarded = ?, completed_at = ? WHERE id = ?",
      aScore, bScore, winner, (winner === match.player1_id ? p1xp : p2xp), (winner === match.player1_id ? p1coins : p2coins), new Date().toISOString(), id
    );

    const u1 = await get<any>("SELECT xp FROM users WHERE id = ?", match.player1_id);
    await run("UPDATE users SET xp = xp + ?, coins = coins + ?, level = ? WHERE id = ?", p1xp, p1coins, Math.floor((Number(u1?.xp ?? 0) + p1xp) / 100) + 1, match.player1_id);
    const u2 = await get<any>("SELECT xp FROM users WHERE id = ?", match.player2_id);
    await run("UPDATE users SET xp = xp + ?, coins = coins + ?, level = ? WHERE id = ?", p2xp, p2coins, Math.floor((Number(u2?.xp ?? 0) + p2xp) / 100) + 1, match.player2_id);

    const xpAwarded: Record<string, number> = { [match.player1_id]: p1xp, [match.player2_id]: p2xp };
    const coinsAwarded: Record<string, number> = { [match.player1_id]: p1coins, [match.player2_id]: p2coins };

    return ok({ match: { id, scores, winner, xpAwarded, coinsAwarded }, scores, winner, xpAwarded, coinsAwarded });
  } catch (error) {
    return fail(error);
  }
}