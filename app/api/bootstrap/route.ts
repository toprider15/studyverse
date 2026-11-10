import { all, get } from "@/lib/db";
import { currentUser, safeUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { publicUser, subjectDto } from "@/lib/serialize";

export async function GET() {
  try {
    const user = await currentUser();
    const subjects = (await all<any>("SELECT * FROM subjects WHERE active = 1 ORDER BY order_index")).map(subjectDto);
    const classes = await all<any>("SELECT * FROM classes ORDER BY name");
    const arcadeGames = (await all<any>("SELECT * FROM arcade_games WHERE active = 1 ORDER BY order_index")).map((g) => ({
      id: g.key,
      key: g.key,
      slug: g.key,
      name: g.name,
      description: g.description,
      icon: g.icon,
      instructions: g.instructions,
      scoreDirection: g.score_direction,
      unit: g.unit,
      maxScores: JSON.parse(g.max_scores),
      orderIndex: Number(g.order_index),
    }));
    const collectibles = (await all<any>("SELECT * FROM collectibles WHERE active = 1 ORDER BY price")).map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      rarity: c.rarity,
      price: Number(c.price),
      icon: c.icon,
      description: c.description,
      unlockHint: c.unlock_hint,
      seasonal: Boolean(c.seasonal),
    }));
    const achievements = (await all<any>("SELECT * FROM achievements WHERE hidden = 0 ORDER BY id")).map((a) => ({
      id: a.id,
      key: a.key,
      name: a.name,
      description: a.description,
      icon: a.icon,
      xpReward: Number(a.xp_reward),
      coinReward: Number(a.coin_reward),
    }));
    const events = (await all<any>("SELECT * FROM school_events WHERE published = 1 ORDER BY starts_at")).map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      category: e.category,
      startsAt: e.starts_at,
      endsAt: e.ends_at,
      location: e.location,
    }));
    const week = await all<any>("SELECT DISTINCT week_label FROM school_menus ORDER BY week_label DESC LIMIT 1")[0]?.week_label ?? null;
    const menus = (await all<any>("SELECT * FROM school_menus WHERE active = 1 AND week_label = ? ORDER BY day_of_week, category", week)).map((m) => ({
      id: m.id,
      dayOfWeek: Number(m.day_of_week),
      weekLabel: m.week_label,
      category: m.category,
      item: m.item,
      description: m.description,
      special: Boolean(m.special),
    }));
    const settings = Object.fromEntries(
      (await all<{ key: string; value: string }>("SELECT key, value FROM platform_settings")).map((s) => [s.key, s.value])
    );
    const classmates = user
      ? await all<any>(
          "SELECT u.*, c.name AS class_name FROM users u LEFT JOIN classes c ON c.id = u.class_id WHERE u.role = 'student' AND u.status = 'active' AND u.class_id = ? AND u.id <> ? ORDER BY u.display_name",
          user.class_id,
          user.id
        )).map(publicUser)
      : [];
    const notificationCount = user
      ? Number(await get<{ n: number }>("SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read = 0", user.id)?.n ?? 0)
      : 0;
    return ok({
      user: user ? safeUser(user) : null,
      subjects,
      classes,
      arcadeGames,
      collectibles,
      achievements,
      events,
      menus,
      week,
      settings,
      classmates,
      notificationCount,
    });
  } catch (error) {
    return fail(error);
  }
}
