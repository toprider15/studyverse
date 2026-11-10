import { NextRequest } from "next/server";
import { all, get, run } from "@/lib/db";
import { currentUser, requireRole } from "@/lib/auth";
import { fail, ok, readBody } from "@/lib/http";
import { uid } from "@/lib/password";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return fail(new Error("Unauthorized"));
    const rows = await all<any>("SELECT * FROM inventory WHERE user_id = ?", user.id);
    const inventory = rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      collectibleId: r.collectible_id,
      earnedAt: r.acquired_at,
    }));
    const collectibles = (await all<any>("SELECT * FROM collectibles WHERE active = 1")).map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      rarity: c.rarity,
      price: Number(c.price),
      icon: c.icon,
      description: c.description,
    }));
    return ok({ inventory, collectibles });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return fail(new Error("Unauthorized"));
    const body = await readBody<any>(req);
    const targetUserId = body.userId || user.id;
    if (targetUserId !== user.id && user.role !== "admin" && user.role !== "teacher") {
      return fail(new Error("Forbidden"));
    }
    const collectibleId = body.collectibleId;
    if (!collectibleId) throw new Error("collectibleId required");
    const existing = await get<any>("SELECT id FROM inventory WHERE user_id = ? AND collectible_id = ?", targetUserId, collectibleId);
    if (!existing) {
      await run(
        "INSERT INTO inventory (id, user_id, collectible_id, equipped, acquired_at, source) VALUES (?, ?, ?, 0, ?, ?)",
        uid("inv"),
        targetUserId,
        collectibleId,
        new Date().toISOString(),
        body.source || "manual"
      );
    }
    return ok({ ok: true });
  } catch (error) {
    return fail(error);
  }
}