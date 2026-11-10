import { destroySession } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export async function POST() {
  try {
    await destroySession();
    return ok({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
