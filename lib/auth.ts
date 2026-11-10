import { cookies } from "next/headers";
import { get, parseJson, run } from "./db";
import { levelProgress } from "./level";
import { hashPassword, randomToken, uid, verifyPassword } from "./password";

export const SESSION_COOKIE = "sv_session";
const SESSION_DAYS = 7;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const LANGUAGE_DIVISIONS = [
  "spanish_capable",
  "spanish_emergent",
  "french_regular",
  "french_emergent",
  "hindi",
  "german",
] as const;

export const DIVISION_LABEL: Record<string, string> = {
  spanish_capable: "Spanish Capable",
  spanish_emergent: "Spanish Emergent",
  french_regular: "French Regular",
  french_emergent: "French Emergent",
  hindi: "Hindi",
  german: "German",
};

export type Role = "student" | "teacher" | "admin";

export type SafeUser = {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  grade: number;
  classId: string | null;
  className: string | null;
  languageSubject: string | null;
  languageDivision: string | null;
  mathTrack: string | null;
  avatar: { emoji?: string; bg?: string; frame?: string; accessory?: string; room?: string };
  room: { theme?: string; decor?: string[]; wall?: string };
  xp: number;
  coins: number;
  level: number;
  levelProgress: ReturnType<typeof levelProgress>;
  streak: number;
  lastActiveDate: string | null;
  status: "active" | "pending" | "suspended";
  approved: boolean;
  createdAt: string;
};

export function safeUser(row: any): SafeUser {
  const xp = Number(row.xp ?? 0);
  const progress = levelProgress(xp);
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    grade: Number(row.grade ?? 9),
    classId: row.class_id ?? null,
    className: row.class_name ?? null,
    languageSubject: row.language_subject ?? null,
    languageDivision: row.language_division ?? null,
    mathTrack: row.math_track ?? null,
    avatar: parseJson(row.avatar, {}),
    room: parseJson(row.room, {}),
    xp,
    coins: Number(row.coins ?? 0),
    level: progress.level,
    levelProgress: progress,
    streak: Number(row.streak ?? 0),
    lastActiveDate: row.last_active_date ?? null,
    status: row.status,
    approved: row.status === "active",
    createdAt: row.created_at,
  };
}

const USER_SELECT = `SELECT u.*, c.name AS class_name FROM users u LEFT JOIN classes c ON c.id = u.class_id`;

export async function findUserByUsername(username: string) {
  return await get<any>(`${USER_SELECT} WHERE lower(u.username) = lower(?)`, username);
}

export async function findUserById(id: string) {
  return await get<any>(`${USER_SELECT} WHERE u.id = ?`, id);
}

export async function createSession(userId: string) {
  const token = randomToken(32);
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 86400000).toISOString();
  await run("DELETE FROM sessions WHERE expires_at < ?", now.toISOString());
  await run(
    "INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
    uid("sess"),
    userId,
    token,
    expires,
    now.toISOString()
  );
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 86400,
  });
  return token;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await run("DELETE FROM sessions WHERE token = ?", token);
  jar.delete(SESSION_COOKIE);
}

export async function currentUser(): Promise<any | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = await get<any>(
    `SELECT u.*, c.name AS class_name FROM sessions s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN classes c ON c.id = u.class_id
     WHERE s.token = ? AND s.expires_at > ?`,
    token,
    new Date().toISOString()
  );
  if (!row || row.status !== "active") return null;
  return row;
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new ApiError(401, "Please sign in to continue.");
  return user;
}

export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new ApiError(403, "You do not have permission to do that.");
  return user;
}

export function isStaff(user: { role: Role } | null | undefined) {
  return user?.role === "teacher" || user?.role === "admin";
}

export async function authenticate(username: string, password: string) {
  const row = await findUserByUsername(username);
  if (!row || !verifyPassword(password, row.password_hash)) {
    throw new ApiError(401, "That username or password is not correct.");
  }
  if (row.status === "pending") {
    throw new ApiError(403, "Your account is waiting for administrator approval.");
  }
  if (row.status === "suspended") {
    throw new ApiError(403, "This account has been suspended. Speak to an administrator.");
  }
  return row;
}

export async function registerStudent(input: {
  username: string;
  displayName: string;
  password: string;
  classId: string;
  languageDivision: string;
  mathTrack: string;
}) {
  const username = input.username.trim().toLowerCase();
  const displayName = input.displayName.trim();
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    throw new ApiError(400, "Username must be 3–20 characters using letters, numbers or underscores.");
  }
  if (displayName.length < 2 || displayName.length > 40) {
    throw new ApiError(400, "Display name must be between 2 and 40 characters.");
  }
  if (input.password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters.");
  }
  if (!await get("SELECT id FROM classes WHERE id = ?", input.classId)) {
    throw new ApiError(400, "Choose a valid class.");
  }
  if (!LANGUAGE_DIVISIONS.includes(input.languageDivision as any)) {
    throw new ApiError(400, "Choose a valid language division.");
  }
  if (!["standard", "extended"].includes(input.mathTrack)) {
    throw new ApiError(400, "Choose a valid mathematics track.");
  }
  if (await get("SELECT id FROM users WHERE lower(username) = ?", username)) {
    throw new ApiError(409, "That username is already taken.");
  }
  const id = uid("u");
  const now = new Date().toISOString();
  await run(
    `INSERT INTO users (id, username, display_name, password_hash, role, grade, class_id,
      language_subject, language_division, math_track, avatar, room, xp, coins, level, streak,
      last_active_date, status, created_at, approved_at)
     VALUES (?, ?, ?, ?, 'student', 9, ?, ?, ?, ?, ?, ?, 0, 0, 1, 0, NULL, 'active', ?, ?)`,
    id,
    username,
    displayName,
    hashPassword(input.password),
    input.classId,
    languageSubjectFor(input.languageDivision),
    input.languageDivision,
    input.mathTrack,
    JSON.stringify({ emoji: "🚀", bg: "aurora", frame: "none", accessory: "none", room: "nebula" }),
    JSON.stringify({ theme: "nebula", decor: [], wall: "#17123a" }),
    now,
    now
  );
  const langSubject = languageSubjectFor(input.languageDivision);
  for (const subjectId of ["langlit", langSubject, "math_std", "physics", "chemistry", "biology", "humanities"]) {
    await run(
      "INSERT OR IGNORE INTO enrollments (user_id, subject_id, created_at) VALUES (?, ?, ?)",
      id,
      subjectId,
      now
    );
  }
  if (input.mathTrack === "extended") {
    await run("INSERT OR IGNORE INTO enrollments (user_id, subject_id, created_at) VALUES (?, 'math_ext', ?)", id, now);
  }
  return await findUserById(id);
}

export function languageSubjectFor(division: string) {
  return (
    {
      spanish_capable: "spanish_cap",
      spanish_emergent: "spanish_em",
      french_regular: "french_reg",
      french_emergent: "french_em",
      hindi: "hindi",
      german: "german",
    } as Record<string, string>
  )[division] ?? "langlit";
}
