import { all } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export async function GET() {
  try {
    const user = await requireUser();
    const rows = await all<any>(
      `SELECT qa.*, s.name AS subject_name, s.icon AS subject_icon
       FROM quiz_attempts qa LEFT JOIN subjects s ON s.id = qa.subject_id
       WHERE qa.user_id = ? ORDER BY qa.started_at DESC LIMIT 20`,
      user.id
    );
    return ok({
      attempts: rows.map((r) => ({
        id: r.id,
        kind: r.kind,
        subjectId: r.subject_id,
        subjectName: r.subject_name,
        subjectIcon: r.subject_icon,
        score: Number(r.score),
        total: Number(r.total),
        xpAwarded: Number(r.xp_awarded),
        status: r.status,
        startedAt: r.started_at,
        completedAt: r.completed_at,
      })),
    });
  } catch (error) {
    return fail(error);
  }
}
