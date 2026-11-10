import { all } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "grade";
    const subjectId = searchParams.get("subjectId");
    const classId = searchParams.get("classId");

    let sql = `SELECT u.*, c.name AS class_name FROM users u LEFT JOIN classes c ON c.id = u.class_id
      WHERE u.role = 'student' AND u.status = 'active'`;
    const params: unknown[] = [];
    if (type === "class" && classId) { sql += ` AND u.class_id = ?`; params.push(classId); }
    sql += ` ORDER BY u.xp DESC`;
    const rows = await all<any>(sql, ...params);
    const board = rows.map((u, i) => ({
      id: u.id,
      username: u.username,
      displayName: u.display_name,
      classId: u.class_id,
      className: u.class_name,
      xp: Number(u.xp ?? 0),
      level: Math.max(1, Math.floor(Math.sqrt(Math.max(0, Number(u.xp ?? 0)) / 100)) + 1),
      coins: Number(u.coins ?? 0),
      avatar: u.avatar,
      rank: i + 1,
    }));
    return ok({ leaderboard: board });
  } catch (error) {
    return fail(error);
  }
}
