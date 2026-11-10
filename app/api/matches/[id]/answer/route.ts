import { NextRequest } from "next/server";
import { get, run, all } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { fail, ok, readBody } from "@/lib/http";
import { uid } from "@/lib/password";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await currentUser();
    if (!user) return fail(new Error("Unauthorized"));
    const body = await readBody<any>(req);
    const match = await get<any>("SELECT * FROM matches WHERE id = ?", id);
    if (!match) return fail(new Error("Not found"));
    if (match.player1_id !== user.id && match.player2_id !== user.id) return fail(new Error("Forbidden"));
    const q = await get<any>("SELECT * FROM questions WHERE id = ?", body.questionId);
    const opts = q ? JSON.parse(q.options || "[]") : [];
    const answerIndex = Math.max(0, opts.indexOf(String(body.answer)));
    const correct = q ? (Number(q.correct_index) === answerIndex ? 1 : 0) : 0;
    // upsert answer
    const existing = await get<any>("SELECT id FROM match_answers WHERE match_id = ? AND user_id = ? AND question_id = ?", id, user.id, body.questionId);
    if (existing) {
      await run("UPDATE match_answers SET answer_index = ?, correct = ? WHERE id = ?", answerIndex, correct, existing.id);
    } else {
      await run("INSERT INTO match_answers (id, match_id, user_id, question_id, answer_index, correct, elapsed_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", uid("ma"), id, user.id, body.questionId, answerIndex, correct, Number(body.elapsedMs || 0), new Date().toISOString());
    }
    return ok({ ok: true });
  } catch (error) {
    return fail(error);
  }
}