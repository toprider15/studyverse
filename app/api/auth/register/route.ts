import { NextRequest } from "next/server";
import { registerStudent } from "@/lib/auth";
import { fail, ok, readBody } from "@/lib/http";

export async function POST(req: NextRequest) {
  try {
    const body = await readBody<any>(req);
    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    const displayName = String(body.displayName || body.display_name || username).trim();
    const classId = String(body.classId || body.class_id || "");
    const languageDivision = String(body.languageDivision || body.language_division || "");
    const mathTrack = String(body.mathTrack || body.math_track || "standard");
    if (!username || !password || !classId || !languageDivision) {
      throw new Error("username, password, class and language division are required");
    }
    const user = await registerStudent({
      username,
      password,
      displayName,
      grade: 9,
      classId,
      languageSubject: body.languageSubject || null,
      languageDivision,
      mathTrack,
    });
    return ok({ user });
  } catch (error) {
    return fail(error);
  }
}