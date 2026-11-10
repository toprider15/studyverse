import { parseJson } from "./db";
import { levelForXp } from "./level";

export function subjectDto(row: any) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    division: row.division,
    icon: row.icon,
    color: row.color,
    description: row.description,
    orderIndex: Number(row.order_index ?? 0),
  };
}

export function publicUser(row: any) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    className: row.class_name ?? null,
    avatar: parseJson(row.avatar, {}),
    level: levelForXp(Number(row.xp ?? 0)),
  };
}

export function matchDto(row: any, viewerId: string) {
  const isP1 = row.player1_id === viewerId;
  const opponent = isP1
    ? { id: row.player2_id, username: row.p2_username, displayName: row.p2_display_name, className: row.p2_class, avatar: parseJson(row.p2_avatar, {}) }
    : { id: row.player1_id, username: row.p1_username, displayName: row.p1_display_name, className: row.p1_class, avatar: parseJson(row.p1_avatar, {}) };
  const myScore = isP1 ? Number(row.p1_score) : Number(row.p2_score);
  const theirScore = isP1 ? Number(row.p2_score) : Number(row.p1_score);
  return {
    id: row.id,
    subjectId: row.subject_id,
    subjectName: row.subject_name ?? row.subject_id,
    subjectIcon: row.subject_icon ?? "📘",
    mode: row.mode,
    status: row.status,
    neutral: Boolean(row.neutral),
    myScore,
    opponentScore: theirScore,
    myTimeMs: isP1 ? Number(row.p1_time_ms) : Number(row.p2_time_ms),
    opponentTimeMs: isP1 ? Number(row.p2_time_ms) : Number(row.p1_time_ms),
    winnerId: row.winner_id,
    result: row.status !== "complete" ? null : row.winner_id === viewerId ? "win" : row.winner_id ? "loss" : "draw",
    opponent,
    xpAwarded: Number(row.xp_awarded),
    coinsAwarded: Number(row.coins_awarded),
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}

export const MATCH_JOIN = `
  SELECT m.*, s.name AS subject_name, s.icon AS subject_icon,
    p1.username AS p1_username, p1.display_name AS p1_display_name, p1.avatar AS p1_avatar,
    c1.name AS p1_class,
    p2.username AS p2_username, p2.display_name AS p2_display_name, p2.avatar AS p2_avatar,
    c2.name AS p2_class
  FROM matches m
  LEFT JOIN subjects s ON s.id = m.subject_id
  LEFT JOIN users p1 ON p1.id = m.player1_id
  LEFT JOIN classes c1 ON c1.id = p1.class_id
  LEFT JOIN users p2 ON p2.id = m.player2_id
  LEFT JOIN classes c2 ON c2.id = p2.class_id
`;
