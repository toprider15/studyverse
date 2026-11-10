import crypto from "node:crypto";
import { get, isoNow, run, todayKey, tx } from "./db";
import { levelForXp } from "./level";

export async function notify(userId: string, title: string, body: string, type = "info", link: string | null = null) {
  await run(
    "INSERT INTO notifications (id, user_id, title, body, type, link, read, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)",
    `ntf_${crypto.randomUUID()}`,
    userId,
    title,
    body,
    type,
    link,
    isoNow()
  );
}

export async function logActivity(userId: string, kind: string, title: string, detail: string, icon = "✨") {
  await run(
    "INSERT INTO activity (id, user_id, kind, title, detail, icon, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    `act_${crypto.randomUUID()}`,
    userId,
    kind,
    title,
    detail,
    icon,
    isoNow()
  );
}

export async function awardXp(userId: string, amount: number, reason: string, ref: string | null = null) {
  const safe = Math.max(0, Math.round(amount));
  if (!safe) return 0;
  await tx(async () => {
    const user = await get<{ xp: number }>("SELECT xp FROM users WHERE id = ?", userId);
    if (!user) return;
    const nextXp = Number(user.xp) + safe;
    await run("UPDATE users SET xp = ?, level = ? WHERE id = ?", nextXp, levelForXp(nextXp), userId);
    await run(
      "INSERT INTO xp_transactions (id, user_id, amount, reason, ref, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      `xp_${crypto.randomUUID()}`,
      userId,
      safe,
      reason,
      ref,
      isoNow()
    );
  });
  return safe;
}

export async function awardCoins(userId: string, amount: number, reason: string, ref: string | null = null) {
  const safe = Math.max(0, Math.round(amount));
  if (!safe) return 0;
  await tx(async () => {
    const user = await get<{ coins: number }>("SELECT coins FROM users WHERE id = ?", userId);
    if (!user) return;
    await run("UPDATE users SET coins = coins + ? WHERE id = ?", safe, userId);
    await run(
      "INSERT INTO coin_transactions (id, user_id, amount, reason, ref, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      `coin_${crypto.randomUUID()}`,
      userId,
      safe,
      reason,
      ref,
      isoNow()
    );
  });
  return safe;
}

export async function touchStreak(userId: string) {
  const user = await get<{ streak: number; last_active_date: string | null }>(
    "SELECT streak, last_active_date FROM users WHERE id = ?",
    userId
  );
  if (!user) return 0;
  const today = todayKey();
  if (user.last_active_date === today) return Number(user.streak);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const streak = user.last_active_date === todayKey(yesterday) ? Number(user.streak) + 1 : 1;
  await run("UPDATE users SET streak = ?, last_active_date = ? WHERE id = ?", streak, today, userId);
  return streak;
}

export async function grantAchievement(userId: string, key: string) {
  const achievement = await get<any>("SELECT * FROM achievements WHERE key = ?", key);
  if (!achievement) return null;
  const owned = await get("SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?", userId, achievement.id);
  if (owned) return null;
  await run(
    "INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES (?, ?, ?, ?)",
    `ua_${crypto.randomUUID()}`,
    userId,
    achievement.id,
    isoNow()
  );
  if (Number(achievement.xp_reward) > 0) {
    awardXp(userId, Number(achievement.xp_reward), `Achievement: ${achievement.name}`, achievement.id);
  }
  if (Number(achievement.coin_reward) > 0) {
    awardCoins(userId, Number(achievement.coin_reward), `Achievement: ${achievement.name}`, achievement.id);
  }
  notify(userId, `Achievement unlocked: ${achievement.name}`, achievement.description, "achievement", "/hangout/space");
  logActivity(userId, "achievement", `Unlocked ${achievement.name}`, achievement.description, achievement.icon);
  return achievement;
}

export async function bumpSubjectProgress(userId: string, subjectId: string, answered: number, correct: number, xp: number) {
  const existing = await get("SELECT user_id FROM subject_progress WHERE user_id = ? AND subject_id = ?", userId, subjectId);
  if (existing) {
    await run(
      `UPDATE subject_progress SET questions_answered = questions_answered + ?,
       correct = correct + ?, xp = xp + ?, last_activity = ?
       WHERE user_id = ? AND subject_id = ?`,
      answered,
      correct,
      xp,
      isoNow(),
      userId,
      subjectId
    );
  } else {
    await run(
      `INSERT INTO subject_progress (user_id, subject_id, questions_answered, correct, xp, last_activity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      userId,
      subjectId,
      answered,
      correct,
      xp,
      isoNow()
    );
  }
}

export async function evaluateAchievements(userId: string) {
  const quiz = await get<{ correct: number; attempts: number }>(
    "SELECT COALESCE(SUM(score),0) AS correct, COUNT(*) AS attempts FROM quiz_attempts WHERE user_id = ? AND status = 'complete'",
    userId
  );
  if (Number(quiz?.correct ?? 0) >= 10) grantAchievement(userId, "quiz_10");
  if (Number(quiz?.correct ?? 0) >= 50) grantAchievement(userId, "quiz_50");

  const battles = await get<{ played: number; wins: number }>(
    `SELECT COUNT(*) AS played, COALESCE(SUM(CASE WHEN winner_id = ? THEN 1 ELSE 0 END),0) AS wins
     FROM matches WHERE (player1_id = ? OR player2_id = ?) AND status = 'complete'`,
    userId,
    userId,
    userId
  );
  if (Number(battles?.played ?? 0) >= 1) grantAchievement(userId, "battle_first");
  if (Number(battles?.wins ?? 0) >= 1) grantAchievement(userId, "battle_win");
  if (Number(battles?.wins ?? 0) >= 5) grantAchievement(userId, "battle_5wins");

  const user = await get<{ streak: number }>("SELECT streak FROM users WHERE id = ?", userId);
  if (Number(user?.streak ?? 0) >= 7) grantAchievement(userId, "streak_7");

  const arcade = await get<{ plays: number; best: number }>(
    "SELECT COUNT(*) AS plays, COALESCE(MAX(score),0) AS best FROM arcade_scores WHERE user_id = ?",
    userId
  );
  if (Number(arcade?.plays ?? 0) >= 1) grantAchievement(userId, "arcade_first");
  if (Number(arcade?.best ?? 0) >= 1000) grantAchievement(userId, "arcade_pro");

  const showdown = await get<{ wins: number }>(
    "SELECT COUNT(*) AS wins FROM showdown_matches WHERE winner_id = ? AND status = 'complete'",
    userId
  );
  if (Number(showdown?.wins ?? 0) >= 1) grantAchievement(userId, "showdown");

  const tournaments = await get<{ n: number }>(
    "SELECT COUNT(*) AS n FROM tournament_participants WHERE user_id = ?",
    userId
  );
  if (Number(tournaments?.n ?? 0) >= 1) grantAchievement(userId, "tournament");

  const inventory = await get<{ n: number }>("SELECT COUNT(*) AS n FROM inventory WHERE user_id = ?", userId);
  if (Number(inventory?.n ?? 0) >= 5) grantAchievement(userId, "collector");
}
