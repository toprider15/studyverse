import { all, run, get } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { fail, ok, readBody, requireString } from "@/lib/http";


export async function GET(request: Request) {
  try {
    const user = await requireUser();
    if (user.role !== "teacher" && user.role !== "admin" && user.role !== "student") return fail(new Error("Forbidden."));
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    let sql = `SELECT u.id, u.username, u.display_name, u.role, u.grade, u.class_id, u.language_division, u.math_track,
      u.xp, u.coins, u.level, u.streak, u.status, u.created_at, c.name AS class_name, u.avatar
      FROM users u LEFT JOIN classes c ON c.id = u.class_id WHERE u.status = 'active'`;
    const params: unknown[] = [];
    if (user.role === "student") {
      sql += ` AND u.role = 'student' AND u.id <> ?`;
      params.push(user.id);
    }
    if (role) { sql += ` AND u.role = ?`; params.push(role); }
    sql += ` ORDER BY u.username`;
    const rows = await all<any>(sql, ...params);
    if (user.role === "student") {
      return ok({ users: rows.map((u) => ({
        id: u.id, username: u.username, displayName: u.display_name, role: u.role,
        classId: u.class_id, className: u.class_name,
        languageDivision: u.language_division, mathTrack: u.math_track,
        xp: Number(u.xp), level: Number(u.level), avatar: u.avatar,
      })) });
    }
    return ok({ users: rows.map((u) => ({
      id: u.id, username: u.username, displayName: u.display_name, role: u.role,
      grade: Number(u.grade), classId: u.class_id, className: u.class_name,
      languageDivision: u.language_division, mathTrack: u.math_track,
      xp: Number(u.xp), coins: Number(u.coins), level: Number(u.level), streak: Number(u.streak),
      status: u.status, createdAt: u.created_at,
    })) });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    if (user.role !== "admin") return fail(new Error("Forbidden."));
    const body = await readBody<{ id: string; role?: string; classId?: string; languageDivision?: string; mathTrack?: string; approved?: boolean; password?: string; status?: string }>(request);
    const id = requireString(body.id, "id");
    const u = await get("SELECT id FROM users WHERE id = ?", id);
    if (!u) return fail(new Error("User not found."));
    const sets: string[] = []; const params: unknown[] = [];
    if (body.role) { sets.push("role = ?"); params.push(body.role); }
    if (body.classId !== undefined) { sets.push("class_id = ?"); params.push(body.classId); }
    if (body.languageDivision) { sets.push("language_division = ?"); params.push(body.languageDivision); }
    if (body.mathTrack) { sets.push("math_track = ?"); params.push(body.mathTrack); }
    if (body.status) { sets.push("status = ?"); params.push(body.status); }
    if (body.approved !== undefined) { sets.push("status = ?"); params.push(body.approved ? "active" : "pending"); }
    if (body.password) { sets.push("password_hash = ?"); params.push(hashPassword(body.password)); }
    if (sets.length) { params.push(id); await run(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`, ...params); }
    return ok({ ok: true });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    if (user.role !== "admin") return fail(new Error("Forbidden."));
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return fail(new Error("Missing id."));
    await run("DELETE FROM users WHERE id = ?", id);
    return ok({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
