import { NextRequest } from "next/server";
import { all, get, run } from "@/lib/db";
import { currentUser, isStaff } from "@/lib/auth";
import { fail, ok, readBody } from "@/lib/http";
import { uid } from "@/lib/password";
import { isoNow } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const subjectId = new URL(req.url).searchParams.get("subjectId");
    let unitsSql = "SELECT * FROM units WHERE 1=1";
    const params: any[] = [];
    if (subjectId) { unitsSql += " AND subject_id = ?"; params.push(subjectId); }
    unitsSql += " ORDER BY order_index, id";
    const units = await all<any>(unitsSql, ...params);
    const unitIds = units.map((u) => u.id);
    let topics: any[] = [];
    if (unitIds.length) {
      const placeholders = unitIds.map(() => "?").join(",");
      topics = await all<any>(`SELECT * FROM topics WHERE unit_id IN (${placeholders}) ORDER BY order_index, id`, ...unitIds);
    }
    return ok({
      units: units.map((u) => ({
        id: u.id,
        subjectId: u.subject_id,
        title: u.title,
        order: Number(u.order_index),
      })),
      topics: topics.map((t) => ({
        id: t.id,
        unitId: t.unit_id,
        title: t.title,
        notes: t.notes ?? "",
        flashcards: [],
      })),
    });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user || !isStaff(user)) return fail(new Error("Forbidden"));
    const body = await readBody<any>(req);
    const now = isoNow();
    if (body.type === "unit") {
      const id = uid("unit");
      await run(
        "INSERT INTO units (id, subject_id, term, title, description, order_index, status, is_sample, created_by, created_at, updated_at) VALUES (?, ?, 1, ?, ?, ?, 'published', 0, ?, ?, ?)",
        id,
        body.subjectId,
        String(body.title || "").trim(),
        body.description ?? null,
        Number(body.order || 0),
        user.id,
        now,
        now
      );
      return ok({ unit: { id, subjectId: body.subjectId, title: body.title, order: body.order || 0 } });
    }
    if (body.type === "topic") {
      const id = uid("topic");
      await run(
        "INSERT INTO topics (id, unit_id, title, summary, notes, order_index, status, is_sample, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, 'published', 0, ?, ?, ?)",
        id,
        body.unitId,
        String(body.title || "").trim(),
        null,
        body.notes ?? "",
        user.id,
        now,
        now
      );
      return ok({ topic: { id, unitId: body.unitId, title: body.title, notes: body.notes || "" } });
    }
    return fail(new Error("Bad type"));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user || !isStaff(user)) return fail(new Error("Forbidden"));
    const body = await readBody<any>(req);
    const now = isoNow();
    if (body.unitId) {
      if (body.title) await run("UPDATE units SET title = ?, updated_at = ? WHERE id = ?", body.title, now, body.unitId);
    }
    if (body.topicId) {
      if (body.title) await run("UPDATE topics SET title = ?, updated_at = ? WHERE id = ?", body.title, now, body.topicId);
      if (body.notes !== undefined) await run("UPDATE topics SET notes = ?, updated_at = ? WHERE id = ?", body.notes, now, body.topicId);
    }
    return ok({ ok: true });
  } catch (error) {
    return fail(error);
  }
}