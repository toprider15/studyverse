import { NextRequest } from "next/server";
import { all, get, run } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { eligibleOpponents, selectMatchQuestions, canMatch, needsNeutralQuestions } from "@/lib/matchmaking";
import { fail, ok, readBody } from "@/lib/http";
import { uid } from "@/lib/password";

async function loadMatch(id: string, viewerId: string) {
  const m = await get<any>("SELECT * FROM matches WHERE id = ?", id);
  if (!m) return null;
  const qids = JSON.parse(m.question_ids || "[]");
  const answers: Record<string, Record<string, string>> = { [m.player1_id]: {}, [m.player2_id]: {} };
  const ansRows = await all<any>("SELECT * FROM match_answers WHERE match_id = ?", id);
  // map answer_index to option text
  const qRows = qids.length ? await all<any>("SELECT * FROM questions WHERE id IN (" + qids.map(() => "?").join(",") + ")", ...qids) : [];
  const qMap = new Map(qRows.map((q) => [q.id, q]));
  for (const a of ansRows) {
    const q = qMap.get(a.question_id);
    const opts = q ? JSON.parse(q.options || "[]") : [];
    const text = opts[a.answer_index] ?? String(a.answer_index);
    answers[a.user_id][a.question_id] = text;
  }
  const p1 = await get<any>("SELECT id, username, avatar FROM users WHERE id = ?", m.player1_id);
  const p2 = await get<any>("SELECT id, username, avatar FROM users WHERE id = ?", m.player2_id);
  const players = [p1, p2].filter(Boolean).map((u) => ({ id: u.id, username: u.username, avatar: u.avatar }));
  const questions = qids.map((qid: string) => {
    const q = qMap.get(qid);
    if (!q) return { id: qid };
    return { id: q.id, subjectId: q.subject_id, difficulty: q.difficulty, marks: Number(q.marks), type: "mcq", prompt: q.prompt, options: JSON.parse(q.options || "[]"), answer: JSON.parse(q.options || "[]")[Number(q.correct_index)] ?? "" };
  });
  const xpAwarded: Record<string, number> = {};
  const coinsAwarded: Record<string, number> = {};
  if (m.status === "complete") {
    // award stored as single values; assign to winner? We'll split: winner gets xp_awarded, loser gets 0 for simplicity
    // Actually award both: use xp_awarded for winner. For display, give each their computed. We'll just put xp_awarded on winner.
    if (m.winner_id) { xpAwarded[m.winner_id] = Number(m.xp_awarded); coinsAwarded[m.winner_id] = Number(m.coins_awarded); }
    const loser = m.winner_id === m.player1_id ? m.player2_id : m.player1_id;
    if (loser && loser !== m.winner_id) { xpAwarded[loser] = 0; coinsAwarded[loser] = 0; }
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
  return { match, questions, players };
}

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return fail(new Error("Unauthorized"));
    const rows = await all<any>("SELECT * FROM matches WHERE player1_id = ? OR player2_id = ? ORDER BY created_at DESC", user.id, user.id);
    const matches = rows.map((m) => ({
      id: m.id,
      subjectId: m.subject_id,
      status: m.status === "complete" ? "completed" : m.status,
      createdAt: m.created_at,
    }));
    return ok({ matches });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return fail(new Error("Unauthorized"));
    const body = await readBody<any>(req);
    const subjectId = String(body.subjectId || "");
    const type = body.type || "academic";
    const gameId = body.gameId || null;

    let opponent: any = null;
    if (body.opponentId) {
      opponent = await get<any>("SELECT * FROM users WHERE id = ? AND status = 'active'", body.opponentId);
    } else {
      const candidates = await eligibleOpponents(user, subjectId);
      const eligible = candidates.filter((c) => canMatch(user, c, subjectId));
      opponent = eligible[Math.floor(Math.random() * eligible.length)];
    }
    if (!opponent) return fail(new Error("No eligible opponent found"));
    if (!canMatch(user, opponent, subjectId)) return fail(new Error("Ineligible match"));

    if (type === "showdown") {
      const id = uid("m");
      await run(
        "INSERT INTO matches (id, subject_id, player1_id, player2_id, mode, status, question_ids, neutral, created_at) VALUES (?, ?, ?, ?, 'live', 'active', '[]', 0, ?)",
        id, "showdown", user.id, opponent.id, new Date().toISOString()
      );
      // showdown_matches? skip, use matches with subject 'showdown'
      return ok({ match: { id, subjectId: "showdown", playerA: user.id, playerB: opponent.id, questions: [], answers: {}, scores: { [user.id]: 0, [opponent.id]: 0 }, status: "active", winner: null, xpAwarded: {}, coinsAwarded: {}, createdAt: new Date().toISOString(), timeLimitSec: 0 }, opponent: { id: opponent.id, username: opponent.username, avatar: opponent.avatar } });
    }

    const { questions, neutral } = await selectMatchQuestions(subjectId, user, opponent);
    if (!questions.length) return fail(new Error("No questions available for this match"));
    const qids = questions.map((q) => q.id);
    const id = uid("m");
    await run(
      "INSERT INTO matches (id, subject_id, player1_id, player2_id, mode, status, question_ids, neutral, started_at, created_at) VALUES (?, ?, ?, ?, 'live', 'active', ?, ?, ?, ?)",
      id, subjectId, user.id, opponent.id, JSON.stringify(qids), neutral ? 1 : 0, new Date().toISOString(), new Date().toISOString()
    );
    const match = {
      id,
      subjectId,
      playerA: user.id,
      playerB: opponent.id,
      questions: qids,
      answers: {},
      scores: { [user.id]: 0, [opponent.id]: 0 },
      status: "active",
      winner: null,
      xpAwarded: {},
      coinsAwarded: {},
      createdAt: new Date().toISOString(),
      timeLimitSec: 30 * qids.length,
    };
    return ok({ match, opponent: { id: opponent.id, username: opponent.username, avatar: opponent.avatar } });
  } catch (error) {
    return fail(error);
  }
}