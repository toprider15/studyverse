export function levelForXp(xp: number) {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1);
}

export function xpForLevel(level: number) {
  return Math.pow(Math.max(1, level) - 1, 2) * 100;
}

export function levelProgress(xp: number) {
  const level = levelForXp(xp);
  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const span = Math.max(1, next - current);
  return {
    level,
    current: Math.max(0, xp - current),
    needed: span,
    pct: Math.min(100, Math.max(0, Math.round(((xp - current) / span) * 100))),
    nextAt: next,
  };
}
