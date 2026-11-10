import { all, get, run, isoNow } from "@/lib/db";
import { currentUser, isStaff } from "@/lib/auth";
import { fail, ok, readBody, requireString } from "@/lib/http";
import crypto from "node:crypto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get("week");
    let sql = `SELECT * FROM school_menus WHERE active = 1`;
    const params: unknown[] = [];
    if (week) { sql += ` AND week_label = ?`; params.push(week); }
    sql += ` ORDER BY day_of_week, category`;
    const rows = await all<any>(sql, ...params);
    const menus = rows.map((m) => ({
      id: m.id, day: m.day_of_week, weekLabel: m.week_label, category: m.category,
      item: m.item, description: m.description, specialNote: m.special ? m.item : null,
      special: Boolean(m.special), weekOf: m.week_label,
    }));
    return ok({ menus });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user || !isStaff(user)) return fail(new Error("Forbidden."));
    const body = await readBody<{ id?: string; day: string; items?: any[]; specialNote?: string; weekOf?: string }>(request);
    const day = requireString(body.day, "day");
    const weekOf = body.weekOf || new Date().toISOString().slice(0, 10);
    const items = Array.isArray(body.items) ? body.items : [];
    const id = body.id || `menu_${crypto.randomBytes(6).toString("hex")}`;
    await run("DELETE FROM school_menus WHERE id = ?", id);
    for (const item of items) {
      await run(
        `INSERT INTO school_menus (id, day_of_week, week_label, category, item, description, special, active, updated_by, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        `menu_${crypto.randomBytes(6).toString("hex")}`, day, weekOf, item.category || "main",
        item.item || "", item.description || "", item.special ? 1 : 0, user.id, isoNow()
      );
    }
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
    await run("DELETE FROM school_menus WHERE id = ?", id);
    return ok({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
