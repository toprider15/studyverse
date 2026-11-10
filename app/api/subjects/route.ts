import { all } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { subjectDto } from "@/lib/serialize";

export async function GET() {
  try {
    const user = await currentUser();
    const subjects = (await all<any>("SELECT * FROM subjects WHERE active = 1 ORDER BY order_index")).map(subjectDto);
    const progress = user
      ? await all<any>("SELECT * FROM subject_progress WHERE user_id = ?", user.id)
      : [];
    const byId = new Map(progress.map((p) => [p.subject_id, p]));
    return ok({
      subjects: subjects.map((subject) => {
        const p = byId.get(subject.id);
        const answered = Number(p?.questions_answered ?? 0);
        const correct = Number(p?.correct ?? 0);
        return {
          ...subject,
          progress: {
            answered,
            correct,
            accuracy: answered ? Math.round((correct / answered) * 100) : 0,
            xp: Number(p?.xp ?? 0),
            lastActivity: p?.last_activity ?? null,
          },
        };
      }),
    });
  } catch (error) {
    return fail(error);
  }
}
