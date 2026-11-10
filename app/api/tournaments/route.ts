import { all, get, run, isoNow } from "@/lib/db";
import { currentUser, isStaff } from "@/lib/auth";
import { fail, ok, readBody, requireString } from "@/lib/http";
import crypto from "node:crypto";

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    let sql = `SELECT t.*, COUNT(tp.user_id) AS participant_count
      FROM tournaments t
      LEFT JOIN tournament_participants tp ON tp.tournament_id = t.id
      WHERE 1=1`;
    const params: unknown[] = [];
    if (type) { sql += ` AND t.type = ?`; params.push(type); }
    sql += ` GROUP BY t.id ORDER BY t.created_at DESC`;
    const rows = await all<any>(sql, ...params);
    const tournaments = await Promise.all(rows.map(async (t) => ({
      id: t.id,
      name: t.name,
      type: t.type,
      subjectId: t.subject_id ?? null,
      classId: t.class_id ?? null,
      gameKey: t.game_key ?? null,
      description: t.description,
      status: t.status,
      startsAt: t.starts_at,
      endsAt: t.ends_at,
      maxParticipants: Number(t.max_participants),
      createdBy: t.created_by,
      winnerId: t.winner_id ?? null,
      createdAt: t.created_at,
      participants: Number(t.participant_count),
      registered: user ? Boolean(await get("SELECT id FROM tournament_participants WHERE tournament_id = ? AND user_id = ?", t.id, user.id)) : false,
    })));
    return ok({ tournaments });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user || !isStaff(user)) return fail(new Error("Forbidden."));
    const body = await readBody<{
      name: string; type?: string; subjectId?: string; classId?: string;
      gameKey?: string; description?: string; startDate?: string; maxParticipants?: number;
    }>(request);
    const name = requireString(body.name, "name");
    const type = body.type === "showdown" ? "showdown" : (body.type === "class" ? "class" : body.type === "subject" ? "subject" : "school");
    const id = `t_${crypto.randomBytes(6).toString("hex")}`;
    const now = isoNow();
    await run(
      `INSERT INTO tournaments (id, name, type, subject_id, class_id, game_key, description, format, status, starts_at, ends_at, max_participants, created_by, winner_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'knockout', 'registration', ?, ?, ?, ?, NULL, ?)`,
      id, name, type, body.subjectId ?? null, body.classId ?? null, body.gameKey ?? null,
      body.description ?? "", body.startDate ?? now, body.startDate ? new Date(new Date(body.startDate).getTime() + 86400000).toISOString() : null,
      Number(body.maxParticipants ?? 16), user.id, now
    );
    return ok({ tournament: { id, name, type, status: "registration" } });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return fail(new Error("Unauthorized."));
    const body = await readBody<{ id: string; action?: string; status?: string; winner?: string }>(request);

    if (body.action === "register") {
      const t = await get<any>("SELECT * FROM tournaments WHERE id = ?", body.id);
      if (!t) return fail(new Error("Tournament not found."));
      if (t.status !== "registration") return fail(new Error("Registration is closed."));
      const existing = await get("SELECT id FROM tournament_participants WHERE tournament_id = ? AND user_id = ?", body.id, user.id);
      if (existing) return ok({ ok: true, registered: true });
      const count = await get<{ n: number }>("SELECT COUNT(*) AS n FROM tournament_participants WHERE tournament_id = ?", body.id);
      if (Number(count?.n ?? 0) >= Number(t.max_participants)) return fail(new Error("Tournament is full."));
      await run(
        "INSERT INTO tournament_participants (id, tournament_id, user_id, seed, placement, registered_at) VALUES (?, ?, ?, ?, NULL, ?)",
        `tp_${crypto.randomBytes(6).toString("hex")}`, body.id, user.id, Number(count?.n ?? 0) + 1, isoNow()
      );
      return ok({ ok: true, registered: true });
    }

    if (!isStaff(user)) return fail(new Error("Forbidden."));
    const t = await get<any>("SELECT * FROM tournaments WHERE id = ?", body.id);
    if (!t) return fail(new Error("Tournament not found."));
    const sets: string[] = []; const params: unknown[] = [];
    if (body.status) { sets.push("status = ?"); params.push(body.status); }
    if (body.winner) { sets.push("winner_id = ?"); params.push(body.winner); }
    if (sets.length) { sets.push("updated_at = ?"); params.push(isoNow()); params.push(body.id); await run(`UPDATE tournaments SET ${sets.join(", ")} WHERE id = ?`, ...params); }
    return ok({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
