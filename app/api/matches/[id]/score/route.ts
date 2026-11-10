import { NextRequest } from "next/server";
import { get, run } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { fail, ok, readBody } from "@/lib/http";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await currentUser();
    if (!user) return fail(new Error("Unauthorized"));
    const match = await get<any>("SELECT * FROM matches WHERE id = ?", id);
    if (!match) return fail(new Error("Not found"));
    if (match.player1_id !== user.id && match.player2_id !== user.id) return fail(new Error("Forbidden"));
    const body = await readBody<any>(req);
    const score = Number(body.score) || 0;
    if (match.player1_id === user.id) {
      await run("UPDATE matches SET p1_score = ? WHERE id = ?", score, id);
    } else {
      await run("UPDATE matches SET p2_score = ? WHERE id = ?", score, id);
    }
    return ok({ ok: true });
  } catch (error) {
    return fail(error);
  }
}