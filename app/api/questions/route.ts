import { all, get, run, isoNow } from "@/lib/db";
import { currentUser, isStaff } from "@/lib/auth";
import { fail, ok, readBody, requireString, optionalString, requireInt, requireOneOf, parseStringArray } from "@/lib/http";
import crypto from "node:crypto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const approved = searchParams.get("approved");
    const user = await currentUser();
    if (!user) return fail(new Error("Unauthorized"));

    let sql = `SELECT * FROM questions WHERE 1=1`;
    const params: unknown[] = [];
    if (subjectId) { sql += ` AND subject_id = ?`; params.push(subjectId); }
    if (approved === "true") { sql += ` AND status = 'approved'`; }
    else if (approved === "false") { sql += ` AND status <> 'approved'`; }
    sql += ` ORDER BY created_at DESC`;
    const questions = await all<any>(sql, ...params);
    return ok({
      questions: questions.map((q) => ({
        id: q.id,
        subjectId: q.subject_id,
        unitId: q.unit_id ?? null,
        topicId: q.topic_id ?? null,
        difficulty: q.difficulty,
        marks: Number(q.marks),
        type: q.type,
        prompt: q.prompt,
        options: parseStringArray(q.options),
        answer: parseStringArray(q.options)[Number(q.correct_index)] ?? "",
        languageDivision: q.language_division ?? "any",
        mathTrack: q.math_track ?? "any",
        approved: q.status === "approved",
        createdBy: q.created_by,
        createdAt: q.created_at,
      })),
    });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user || !isStaff(user)) return fail(new Error("Forbidden"));
    const body = await readBody(request);
    const now = isoNow();
    const subjectId = requireString(body.subjectId, "subjectId");
    const prompt = requireString(body.prompt, "prompt");
    const answer = requireString(body.answer, "answer");
    const difficulty = requireOneOf(body.difficulty ?? "medium", ["easy", "medium", "hard"], "difficulty");
    const marks = requireInt(body.marks ?? 1, "marks", 1, 10);
    const type = requireOneOf(body.type ?? "mcq", ["mcq"], "type");
    const options = parseStringArray(body.options);
    const correctIndex = Math.max(0, options.indexOf(answer));
    const languageDivision = requireOneOf(body.languageDivision ?? "any", ["any", "spanish_capable", "spanish_emergent", "french_regular", "french_emergent", "hindi", "german"], "languageDivision");
    const mathTrack = requireOneOf(body.mathTrack ?? "any", ["any", "standard", "extended"], "mathTrack");
    const approvedByAdmin = user.role === "admin";
    const status = approvedByAdmin ? "approved" : "pending";

    const id = `q_${crypto.randomBytes(6).toString("hex")}`;
    await run(
      `INSERT INTO questions (id, subject_id, unit_id, topic_id, difficulty, marks, type, prompt, options, correct_index, explanation, status, official, language_division, math_track, created_by, approved_by, approved_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, subjectId, body.unitId ?? null, body.topicId ?? null, difficulty, marks, type, prompt,
      JSON.stringify(options), correctIndex, null, status, approvedByAdmin ? 1 : 0, languageDivision, mathTrack,
      user.id, approvedByAdmin ? user.id : null, approvedByAdmin ? now : null, now
    );
    if (!approvedByAdmin) {
      await run(
        `INSERT INTO question_approvals (id, question_id, reviewer_id, action, note, created_at)
         VALUES (?, ?, ?, 'submitted', '', ?)`,
        `qa_${crypto.randomBytes(6).toString("hex")}`, id, user.id, now
      );
    }
    return ok({
      question: { id, subjectId, unitId: body.unitId ?? null, topicId: body.topicId ?? null, difficulty, marks, type, prompt, options, answer, languageDivision, mathTrack, approved: approvedByAdmin, createdBy: user.id, createdAt: now },
    });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await currentUser();
    if (!user || !isStaff(user)) return fail(new Error("Forbidden"));
    const body = await readBody(request);
    const id = requireString(body.id, "id");
    const now = isoNow();

    const existing = await get<any>("SELECT * FROM questions WHERE id = ?", id);
    if (!existing) return fail(new Error("Question not found."));

    const sets: string[] = [];
    const params: unknown[] = [];
    const optionalTitle = optionalString(body.prompt);
    if (optionalTitle !== null && optionalTitle !== undefined) { sets.push("prompt = ?"); params.push(optionalTitle); }
    if (body.answer !== undefined) {
      const opts = body.options !== undefined ? parseStringArray(body.options) : parseStringArray(existing.options);
      const ci = Math.max(0, opts.indexOf(String(body.answer)));
      sets.push("correct_index = ?"); params.push(ci);
    }
    if (body.options !== undefined) { sets.push("options = ?"); params.push(JSON.stringify(parseStringArray(body.options))); }
    if (body.difficulty) { sets.push("difficulty = ?"); params.push(body.difficulty); }
    if (body.marks !== undefined) { sets.push("marks = ?"); params.push(Number(body.marks)); }
    if (body.status || body.approved !== undefined) {
      const newStatus = body.approved !== undefined ? (body.approved ? "approved" : "pending") : String(body.status);
      sets.push("status = ?"); params.push(newStatus);
      if (newStatus === "approved") {
        sets.push("approved_by = ?"); params.push(user.id);
        sets.push("approved_at = ?"); params.push(now);
        sets.push("official = 1");
      }
    }
    sets.push("updated_at = ?"); params.push(now);
    params.push(id);
    await run(`UPDATE questions SET ${sets.join(", ")} WHERE id = ?`, ...params);

    if (body.approved === true) {
      await run(
        `INSERT INTO question_approvals (id, question_id, reviewer_id, action, note, created_at)
         VALUES (?, ?, ?, 'approved', '', ?)`,
        `qa_${crypto.randomBytes(6).toString("hex")}`, id, user.id, now
      );
    }

    return ok({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
