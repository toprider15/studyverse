import { all, get, run, isoNow } from "@/lib/db";
import { currentUser, isStaff } from "@/lib/auth";
import { fail, ok, readBody, requireString } from "@/lib/http";
import crypto from "node:crypto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    let sql = `SELECT * FROM school_events WHERE published = 1`;
    const params: unknown[] = [];
    if (category) { sql += ` AND category = ?`; params.push(category); }
    sql += ` ORDER BY starts_at`;
    const events = (await all<any>(sql, ...params)).map((e) => ({
      id: e.id, title: e.title, description: e.description, category: e.category,
      startsAt: e.starts_at, endsAt: e.ends_at ?? null, location: e.location,
      createdBy: e.created_by, createdAt: e.created_at,
    }));
    return ok({ events });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user || !isStaff(user)) return fail(new Error("Forbidden."));
    const body = await readBody<{ title: string; description: string; category?: string; date: string }>(request);
    const title = requireString(body.title, "title");
    const description = requireString(body.description, "description");
    const id = `ev_${crypto.randomBytes(6).toString("hex")}`;
    await run(
      `INSERT INTO school_events (id, title, description, category, starts_at, ends_at, location, published, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      id, title, description, body.category ?? "school", body.date, body.date, null, user.id, isoNow()
    );
    return ok({ event: { id, title, description, category: body.category, date: body.date } });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await currentUser();
    if (!user || !isStaff(user)) return fail(new Error("Forbidden."));
    const body = await readBody<{ id: string; title?: string; description?: string; date?: string; category?: string }>(request);
    const id = requireString(body.id, "id");
    const e = await get<any>("SELECT * FROM school_events WHERE id = ?", id);
    if (!e) return fail(new Error("Event not found."));
    const sets: string[] = []; const params: unknown[] = [];
    if (body.title) { sets.push("title = ?"); params.push(body.title); }
    if (body.description) { sets.push("description = ?"); params.push(body.description); }
    if (body.date) { sets.push("starts_at = ?"); params.push(body.date); }
    if (body.category) { sets.push("category = ?"); params.push(body.category); }
    if (sets.length) { params.push(id); await run(`UPDATE school_events SET ${sets.join(", ")} WHERE id = ?`, ...params); }
    return ok({ ok: true });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await currentUser();
    if (!user || !isStaff(user)) return fail(new Error("Forbidden."));
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return fail(new Error("Missing id."));
    await run("DELETE FROM school_events WHERE id = ?", id);
    return ok({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
