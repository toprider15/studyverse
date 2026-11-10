import { currentUser, safeUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export async function GET() {
  try {
    const user = await currentUser();
    return ok({ user: user ? safeUser(user) : null });
  } catch (error) {
    return fail(error);
  }
}
