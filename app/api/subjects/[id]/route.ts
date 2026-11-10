import { all, get } from "@/lib/db";
import { currentUser, isStaff } from "@/lib/auth";
import { ApiError } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { subjectDto } from "@/lib/serialize";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await currentUser();
    const subjectRow = await get<any>("SELECT * FROM subjects WHERE id = ?", id);
    if (!subjectRow) throw new ApiError(404, "Subject not found.");
    const units = await all<any>("SELECT * FROM units WHERE subject_id = ? ORDER BY order_index", id);
    const topics = await all<any>("SELECT * FROM topics WHERE unit_id IN (SELECT id FROM units WHERE subject_id = ?) ORDER BY order_index", id);
    const flashcards = await all<any>(
      "SELECT * FROM flashcards WHERE topic_id IN (SELECT id FROM topics WHERE unit_id IN (SELECT id FROM units WHERE subject_id = ?)) ORDER BY order_index",
      id
    );
    const questionCounts = await all<any>(
      `SELECT difficulty, COUNT(*) AS n FROM questions
       WHERE subject_id = ? AND status = 'approved' GROUP BY difficulty`,
      id
    );
    const progress = user
      ? await get<any>("SELECT * FROM subject_progress WHERE user_id = ? AND subject_id = ?", user.id, id)
      : null;
    const cardsByTopic = new Map<string, any[]>();
    for (const card of flashcards) {
      if (!cardsByTopic.has(card.topic_id)) cardsByTopic.set(card.topic_id, []);
      cardsByTopic.get(card.topic_id)!.push({ id: card.id, front: card.front, back: card.back });
    }
    const topicsByUnit = new Map<string, any[]>();
    for (const topic of topics) {
      if (!topicsByUnit.has(topic.unit_id)) topicsByUnit.set(topic.unit_id, []);
      topicsByUnit.get(topic.unit_id)!.push({
        id: topic.id,
        title: topic.title,
        summary: topic.summary,
        notes: topic.notes,
        status: topic.status,
        isSample: Boolean(topic.is_sample),
        flashcards: cardsByTopic.get(topic.id) ?? [],
      });
    }
    return ok({
      subject: subjectDto(subjectRow),
      enrolled: user
        ? Boolean(await get("SELECT user_id FROM enrollments WHERE user_id = ? AND subject_id = ?", user.id, id))
        : false,
      canManage: isStaff(user),
      units: units.map((unit) => ({
        id: unit.id,
        term: Number(unit.term),
        title: unit.title,
        description: unit.description,
        status: unit.status,
        isSample: Boolean(unit.is_sample),
        topics: topicsByUnit.get(unit.id) ?? [],
      })),
      questionCounts: Object.fromEntries(questionCounts.map((q) => [q.difficulty, Number(q.n)])),
      progress: {
        answered: Number(progress?.questions_answered ?? 0),
        correct: Number(progress?.correct ?? 0),
        accuracy: progress?.questions_answered
          ? Math.round((Number(progress.correct) / Number(progress.questions_answered)) * 100)
          : 0,
        xp: Number(progress?.xp ?? 0),
      },
    });
  } catch (error) {
    return fail(error);
  }
}
