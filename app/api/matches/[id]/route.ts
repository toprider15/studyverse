import { NextRequest } from "next/server";
import { get, all } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await currentUser();
    if (!user) return fail(new Error("Unauthorized"));
    const m = await get<any>("SELECT * FROM matches WHERE id = ?", id);
    if (!m) return fail(new Error("Not found"));
    if (m.player1_id !== user.id && m.player2_id !== user.id && user.role !== "admin" && user.role !== "teacher") {
      return fail(new Error("Forbidden"));
    }
    const qids = JSON.parse(m.question_ids || "[]");
    const qRows = qids.length ? await all<any>("SELECT * FROM questions WHERE id IN (" + qids.map(() => "?").join(",") + ")", ...qids) : [];
    const qMap = new Map(qRows.map((q: any) => [q.id, q]));
    const answers: Record<string, Record<string, string>> = { [m.player1_id]: {}, [m.player2_id]: {} };
    const ansRows = await all<any>("SELECT * FROM match_answers WHERE match_id = ?", id);
    for (const a of ansRows) {
      const q = qMap.get(a.question_id);
      const opts = q ? JSON.parse(q.options || "[]") : [];
      answers[a.user_id][a.question_id] = opts[a.answer_index] ?? String(a.answer_index);
    }
    const p1 = await get<any>("SELECT id, username, avatar FROM users WHERE id = ?", m.player1_id);
    const p2 = await get<any>("SELECT id, username, avatar FROM users WHERE id = ?", m.player2_id);
    const players = [p1, p2].filter(Boolean).map((u) => ({ id: u.id, username: u.username, avatar: u.avatar }));
    const questions = qids.map((qid: string) => {
      const q = qMap.get(qid);
      if (!q) return { id: qid };
      return { id: q.id, subjectId: q.subject_id, difficulty: q.difficulty, marks: Number(q.marks), type: "mcq", prompt: q.prompt, options: JSON.parse(q.options || "[]"), answer: (JSON.parse(q.options || "[]"))[Number(q.correct_index)] ?? "" };
    });
    const xpAwarded: Record<string, number> = {};
    const coinsAwarded: Record<string, number> = {};
    if (m.status === "complete") {
      if (m.winner_id) { xpAwarded[m.winner_id] = Number(m.xp_awarded); coinsAwarded[m.winner_id] = Number(m.coins_awarded); }
    }
    const match = {
      id: m.id,
      subjectId: m.subject_id,
      playerA: m.player1_id,
      playerB: m.player2_id,
      questions: qids,
      answers,
      scores: { [m.player1_id]: Number(m.p1_score), [m.player2_id]: Number(m.p2_score) },
      status: m.status === "complete" ? "completed" : m.status === "active" ? "active" : "pending",
      winner: m.winner_id,
      xpAwarded,
      coinsAwarded,
      createdAt: m.created_at,
      timeLimitSec: 30 * qids.length,
    };
    return ok({ match, questions, players });
  } catch (error) {
    return fail(error);
  }
}