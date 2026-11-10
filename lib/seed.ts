import type { DatabaseSync } from "node:sqlite";
import { hashPassword } from "./password";
import { levelForXp } from "./level";
import { CLASSES, STUDENTS, LANG_SUBJECT } from "./data/people";
import { SUBJECTS, HIDDEN_SUBJECT, TOPIC_TITLES } from "./data/subjects";
import { LANG1 } from "./data/questions-lang1";
import { LANG2 } from "./data/questions-lang2";
import { CORE1 } from "./data/questions-core1";
import { CORE2, PENDING } from "./data/questions-core2";
import { ACHIEVEMENTS, COLLECTIBLES } from "./data/content1";
import { ARCADE_GAMES, EVENTS, MENU_ITEMS } from "./data/content2";
import type { QSeed } from "./data/types";

type Row = Record<string, string | number | null>;

async function ins(table: string, row: Row) {
  const keys = Object.keys(row);
  const sql = `INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`;
  await run(sql, ...keys.map((k) => row[k]));
}

function iso(daysFromNow = 0, hour = 9, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function dateKey(daysFromNow = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function mondayKey() {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function avatarJson(emoji: string) {
  return JSON.stringify({ emoji, bg: "aurora", frame: "none", accessory: "none", room: "nebula" });
}

function roomJson() {
  return JSON.stringify({ theme: "nebula", decor: [], wall: "#17123a" });
}

function seedQuestions(conn: DatabaseSync) {
  const now = new Date().toISOString();
  const all: Record<string, QSeed[]> = { ...LANG1, ...LANG2, ...CORE1, ...CORE2 };
  for (const [subject, list] of Object.entries(all)) {
  for (let i = 0; i < list.length; i++) {
    const q = list[i];
      const [prompt, options, correct, difficulty, explanation] = q;
      const lang = ({ spanish_cap: "spanish_capable", spanish_em: "spanish_emergent", french_reg: "french_regular", french_em: "french_emergent", hindi: "hindi", german: "german" } as Record<string, string>)[subject] || "any";
      const track = subject === "math_std" ? "standard" : subject === "math_ext" ? "extended" : "any";
      await ins("questions", {
        id: `q_${subject}_${i}`, subject_id: subject, difficulty,
        marks: difficulty === "hard" ? 3 : difficulty === "medium" ? 2 : 1,
        type: "mcq", prompt, options: JSON.stringify(options), correct_index: correct, explanation,
        status: "approved", official: 1, language_division: lang, math_track: track,
        created_by: "u_teacher", approved_by: "u_teacher", approved_at: now, created_at: now,
      });
      await ins("question_approvals", {
        id: `qa_q_${subject}_${i}`, question_id: `q_${subject}_${i}`, reviewer_id: "u_teacher",
        action: "approved", note: "Approved during Term 1 question-bank setup.", created_at: now,
      });
  }
  }
  for (let i = 0; i < PENDING.length; i++) {
    const p = PENDING[i];
    const [prompt, options, correct, difficulty, explanation] = p.q;
    const lang = ({ spanish_cap: "spanish_capable", spanish_em: "spanish_emergent", french_reg: "french_regular", french_em: "french_emergent", hindi: "hindi", german: "german" } as Record<string, string>)[p.subject] || "any";
    const track = p.subject === "math_std" ? "standard" : p.subject === "math_ext" ? "extended" : "any";
    await ins("questions", {
      id: `q_${p.subject}_pending_${i}`, subject_id: p.subject, difficulty,
      marks: difficulty === "hard" ? 3 : difficulty === "medium" ? 2 : 1,
      type: "mcq", prompt, options: JSON.stringify(options), correct_index: correct, explanation,
      status: "pending", official: 0, language_division: lang, math_track: track,
      created_by: "u_teacher", approved_by: null, approved_at: null, created_at: now,
    });
  }
}

function seedBracket(conn: DatabaseSync, tournamentId: string, rounds: { round: number; matches: { p1: string | null; p2: string | null; s1?: number; s2?: number; winner?: string | null; status?: string }[] }[]) {
  for (const r of rounds) {
  for (let i = 0; i < r.matches.length; i++) {
    const m = r.matches[i];
      await ins("tournament_matches", {
        id: `tm_${tournamentId}_${r.round}_${i}`, tournament_id: tournamentId, round: r.round, slot: i,
        player1_id: m.p1, player2_id: m.p2, p1_score: m.s1 ?? null, p2_score: m.s2 ?? null,
        winner_id: m.winner ?? null, status: m.status ?? (m.winner ? "complete" : "scheduled"),
        scheduled_at: iso(1 + r.round, 16),
      });
  }
  }
}

export async function seedDatabase() {
  const now = new Date().toISOString();
  const today = dateKey(0);

  for (const c of CLASSES) await ins("classes", { ...c, homeroom_teacher_id: "u_teacher", created_at: now });

  for (const s of SUBJECTS) {
    await ins("subjects", {
      id: s.id, name: s.name, slug: s.slug, category: s.category, division: s.division,
      icon: s.icon, color: s.color, description: s.description, order_index: SUBJECTS.indexOf(s), active: 1,
    });
  }
  await ins("subjects", {
    id: HIDDEN_SUBJECT.id, name: HIDDEN_SUBJECT.name, slug: HIDDEN_SUBJECT.slug, category: "logic",
    division: null, icon: HIDDEN_SUBJECT.icon, color: HIDDEN_SUBJECT.color,
    description: HIDDEN_SUBJECT.description, order_index: 99, active: 0,
  });

  const studentHash = hashPassword("student123");
  const teacherHash = hashPassword("teacher123");
  const adminHash = hashPassword("admin123");

  await ins("users", {
    id: "u_admin", username: "admin", display_name: "StudyVerse Admin", password_hash: adminHash,
    role: "admin", grade: 0, class_id: null, language_subject: null, language_division: null, math_track: null,
    avatar: avatarJson("🛡️"), room: roomJson(), xp: 0, coins: 0, level: 1, streak: 0,
    last_active_date: today, status: "active", created_at: now, approved_at: now,
  });
  await ins("users", {
    id: "u_teacher", username: "teacher", display_name: "Ms. Rivera", password_hash: teacherHash,
    role: "teacher", grade: 0, class_id: null, language_subject: null, language_division: null, math_track: null,
    avatar: avatarJson("🧑‍🏫"), room: roomJson(), xp: 0, coins: 0, level: 1, streak: 0,
    last_active_date: today, status: "active", created_at: now, approved_at: now,
  });

  for (const s of STUDENTS) {
    await ins("users", {
      id: s.id, username: s.username, display_name: s.name, password_hash: studentHash,
      role: "student", grade: 9, class_id: s.cls, language_subject: LANG_SUBJECT[s.lang], language_division: s.lang,
      math_track: s.math, avatar: avatarJson(s.emoji), room: roomJson(), xp: s.xp, coins: s.coins,
      level: levelForXp(s.xp), streak: s.streak, last_active_date: today, status: "active",
      created_at: iso(-60 + STUDENTS.indexOf(s), 8), approved_at: now,
    });
  }

  for (const s of STUDENTS) {
    const subjectIds = ["langlit", LANG_SUBJECT[s.lang], "math_std", "physics", "chemistry", "biology", "humanities"];
    if (s.math === "extended") subjectIds.push("math_ext");
    for (const subjectId of subjectIds) {
      await ins("enrollments", { user_id: s.id, subject_id: subjectId, created_at: now });
    }
  }

  for (const subject of SUBJECTS) {
    const unitId = `unit_${subject.id}`;
    await ins("units", {
      id: unitId, subject_id: subject.id, term: 1, title: "Term 1 — Sample Curriculum",
      description: "This unit is sample demonstration content. The official Term 1 syllabus has not been uploaded by the administrator yet. Teachers can edit this unit, add official topics and replace the sample notes.",
      order_index: 1, status: "published", is_sample: 1, created_by: "u_teacher",
      created_at: now, updated_at: now,
    });
    const titles = TOPIC_TITLES[subject.id] || ["Core concepts", "Skills practice", "Exam technique"];
  for (let idx = 0; idx < titles.length; idx++) {
    const title = titles[idx];
      const topicId = `topic_${subject.id}_${idx + 1}`;
      await ins("topics", {
        id: topicId, unit_id: unitId, title, summary: `Sample revision topic for ${title.toLowerCase()}.`,
        notes: [
          `**Sample revision note — not official syllabus content.**`,
          ``,
          `This topic is a demonstration placeholder for **${title}**. The official Term 1 syllabus has not been uploaded yet. A teacher or administrator can edit this topic and replace these notes with the approved curriculum.`,
          ``,
          `**How to use this topic**`,
          `- Read the summary and key terms.`,
          `- Work through the flashcards.`,
          `- Start a 5-question practice quiz and review the explanations.`,
          `- Use the mock assessment when you feel ready.`,
        ].join("\n"),
        order_index: idx + 1, status: "published", is_sample: 1, created_by: "u_teacher",
        created_at: now, updated_at: now,
      });
      const cards = [
        { front: `What is the focus of "${title}"?`, back: `This sample topic focuses on ${title.toLowerCase()}. Replace this with the official syllabus outcome when it is uploaded.` },
        { front: "Is this official Term 1 syllabus content?", back: "No. It is clearly labelled sample content for demonstration. Teachers can edit or replace it in the Teacher Dashboard." },
        { front: "What is the best way to revise a topic?", back: "Read the notes, test yourself with flashcards, then complete practice questions and review every explanation." },
      ];
      for (let ci = 0; ci < cards.length; ci++) {
        const c = cards[ci];
        await ins("flashcards", { id: `flash_${topicId}_${ci}`, topic_id: topicId, front: c.front, back: c.back, order_index: ci });
      }
  }
  }

  seedQuestions(conn);

  for (const a of ACHIEVEMENTS) await ins("achievements", { ...a, hidden: 0 });
  for (const c of COLLECTIBLES) {
    await ins("collectibles", { ...c, active: 1, seasonal: c.type === "seasonal" ? 1 : 0, created_at: now });
  }
  for (const g of ARCADE_GAMES) await ins("arcade_games", { ...g, active: 1 });

  for (const e of EVENTS) {
    await ins("school_events", {
      id: e.id, title: e.title, description: e.description, category: e.category,
      starts_at: iso(e.starts_at, e.start_hour), ends_at: iso(e.ends_at, e.end_hour),
      location: e.location, published: 1, created_by: "u_admin", created_at: now,
    });
  }
  const week = mondayKey();
  for (const [day, items] of Object.entries(MENU_ITEMS)) {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
      await ins("school_menus", {
        id: `menu_${day}_${i}`, day_of_week: Number(day), week_label: week, category: item.category,
        item: item.item, description: item.description, special: item.special ?? 0, active: 1,
        updated_by: "u_teacher", updated_at: now,
      });
  }
  }

  for (let si = 0; si < STUDENTS.length; si++) {
    const s = STUDENTS[si];
    const subjects = ["langlit", LANG_SUBJECT[s.lang], "math_std", "physics", "chemistry", "biology", "humanities"];
    for (let idx = 0; idx < subjects.length; idx++) {
      const subjectId = subjects[idx];
      const answered = 12 + ((si * 7 + idx * 11) % 55);
      const correct = Math.max(4, Math.round(answered * (0.58 + ((si + idx) % 30) / 100)));
      await ins("subject_progress", {
        user_id: s.id, subject_id: subjectId, questions_answered: answered, correct,
        xp: correct * 8 + ((si + idx) % 5) * 15, last_activity: iso(-((si + idx) % 9), 18),
      });
    }
  }

  const activities = [
    { kind: "battle", title: "Won an academic battle", detail: "Mathematics Standard vs Maya Patel · 5–3", icon: "⚔️", created_at: iso(0, 16, 10) },
    { kind: "quiz", title: "Completed a practice quiz", detail: "Spanish Capable · 7/8 correct · +56 XP", icon: "🎯", created_at: iso(0, 14, 22) },
    { kind: "arcade", title: "New personal best in Reaction Test", detail: "342 ms · Hard difficulty", icon: "⚡", created_at: iso(-1, 18, 5) },
    { kind: "tournament", title: "Registered for Term 1 Championship", detail: "School-wide academic tournament", icon: "🏆", created_at: iso(-1, 12, 40) },
    { kind: "collectible", title: "Unlocked Neon Frame", detail: "Purchased from the collectibles shop", icon: "💜", created_at: iso(-2, 19, 15) },
    { kind: "streak", title: "Reached a 6-day streak", detail: "Keep it going!", icon: "🔥", created_at: iso(-2, 8, 30) },
    { kind: "daily", title: "Completed the daily challenge", detail: "5/5 correct · +50 XP bonus", icon: "⭐", created_at: iso(-3, 13, 0) },
  ];
  for (let i = 0; i < activities.length; i++) await ins("activity", { id: `act_alex_${i}`, user_id: "u_alex", ...activities[i] });

  const xpSeed = [
    { amount: 80, reason: "Academic battle victory", ref: "seed_match_1", created_at: iso(0, 16, 10) },
    { amount: 56, reason: "Practice quiz — Spanish Capable", ref: "seed_quiz_1", created_at: iso(0, 14, 22) },
    { amount: 30, reason: "Arcade personal best — Reaction Test", ref: "seed_arcade_1", created_at: iso(-1, 18, 5) },
    { amount: 50, reason: "Daily challenge bonus", ref: "seed_daily_1", created_at: iso(-3, 13, 0) },
  ];
  for (let i = 0; i < xpSeed.length; i++) {
    const t = xpSeed[i];
    await ins("xp_transactions", { id: `xp_alex_${i}`, user_id: "u_alex", ...t });
    await ins("coin_transactions", { id: `coin_alex_${i}`, user_id: "u_alex", amount: Math.round(t.amount / 5), reason: t.reason, ref: t.ref, created_at: t.created_at });
  }

  const matchSeeds = [
    { id: "seed_match_1", subject: "math_std", p1: "u_alex", p2: "u_maya", qs: ["q_math_std_0", "q_math_std_1", "q_math_std_2", "q_math_std_3", "q_math_std_4", "q_math_std_5"], s1: 5, s2: 3, winner: "u_alex", days: 0, hour: 16, status: "complete", mode: "bot", neutral: 0 },
    { id: "seed_match_2", subject: "spanish_cap", p1: "u_alex", p2: "u_lucia", qs: ["q_spanish_cap_0", "q_spanish_cap_1", "q_spanish_cap_2", "q_spanish_cap_3", "q_spanish_cap_4", "q_spanish_cap_5"], s1: 6, s2: 4, winner: "u_alex", days: -1, hour: 15, status: "complete", mode: "bot", neutral: 0 },
    { id: "seed_match_3", subject: "math_std", p1: "u_alex", p2: "u_arjun", qs: ["q_math_std_0", "q_math_std_2", "q_math_std_3", "q_math_std_4", "q_math_std_6", "q_math_std_7"], s1: 2, s2: 5, winner: "u_arjun", days: -2, hour: 17, status: "complete", mode: "bot", neutral: 0 },
    { id: "seed_match_4", subject: "logic", p1: "u_alex", p2: "u_victor", qs: ["q_logic_0", "q_logic_1", "q_logic_2", "q_logic_3", "q_logic_4", "q_logic_5"], s1: 6, s2: 5, winner: "u_alex", days: -3, hour: 18, status: "complete", mode: "bot", neutral: 1 },
    { id: "seed_match_5", subject: "physics", p1: "u_alex", p2: "u_ava", qs: ["q_physics_0", "q_physics_1", "q_physics_2", "q_physics_3", "q_physics_4", "q_physics_5"], s1: 4, s2: 4, winner: null, days: -4, hour: 14, status: "complete", mode: "bot", neutral: 0 },
    { id: "seed_match_pending", subject: "spanish_em", p1: "u_diego", p2: "u_alex", qs: ["q_spanish_em_0", "q_spanish_em_1", "q_spanish_em_2", "q_spanish_em_3", "q_spanish_em_4", "q_spanish_em_5"], s1: 0, s2: 0, winner: null, days: 0, hour: 17, status: "pending", mode: "live", neutral: 0 },
  ];
  for (const m of matchSeeds) {
    await ins("matches", {
      id: m.id, subject_id: m.subject, player1_id: m.p1, player2_id: m.p2, mode: m.mode,
      status: m.status, question_ids: JSON.stringify(m.qs), neutral: m.neutral,
      p1_score: m.s1, p2_score: m.s2, p1_time_ms: 42000, p2_time_ms: 51000, winner_id: m.winner,
      bot_plan: null, started_at: iso(m.days, m.hour), completed_at: m.status === "complete" ? iso(m.days, m.hour) : null,
      xp_awarded: m.status === "complete" ? 60 : 0, coins_awarded: m.status === "complete" ? 15 : 0, created_at: iso(m.days, m.hour - 1),
    });
    if (m.status === "complete") {
      await ins("match_progress", { match_id: m.id, user_id: m.p1, current_index: 6, score: m.s1, started_at: iso(m.days, m.hour), completed_at: iso(m.days, m.hour), total_ms: 42000 });
      await ins("match_progress", { match_id: m.id, user_id: m.p2, current_index: 6, score: m.s2, started_at: iso(m.days, m.hour), completed_at: iso(m.days, m.hour), total_ms: 51000 });
    }
  }

  const arcadeSeed: { user: string; game: string; diff: string; score: number; duration: number }[] = [
    { user: "u_alex", game: "reaction", diff: "hard", score: 342, duration: 9000 },
    { user: "u_alex", game: "memory", diff: "medium", score: 1180, duration: 48000 },
    { user: "u_alex", game: "number", diff: "medium", score: 42, duration: 60000 },
    { user: "u_alex", game: "pattern", diff: "medium", score: 27, duration: 55000 },
    { user: "u_alex", game: "word", diff: "medium", score: 31, duration: 60000 },
    { user: "u_maya", game: "reaction", diff: "hard", score: 388, duration: 9500 },
    { user: "u_maya", game: "pattern", diff: "medium", score: 24, duration: 50000 },
    { user: "u_liam", game: "reaction", diff: "hard", score: 301, duration: 8700 },
    { user: "u_liam", game: "number", diff: "hard", score: 38, duration: 60000 },
    { user: "u_ava", game: "pattern", diff: "hard", score: 33, duration: 62000 },
    { user: "u_ava", game: "memory", diff: "hard", score: 1560, duration: 44000 },
    { user: "u_anya", game: "pattern", diff: "hard", score: 36, duration: 65000 },
    { user: "u_anya", game: "word", diff: "hard", score: 29, duration: 60000 },
    { user: "u_victor", game: "number", diff: "hard", score: 45, duration: 60000 },
    { user: "u_arjun", game: "number", diff: "hard", score: 41, duration: 60000 },
    { user: "u_ethan", game: "word", diff: "medium", score: 27, duration: 60000 },
    { user: "u_priya", game: "pattern", diff: "medium", score: 22, duration: 48000 },
    { user: "u_zara", game: "word", diff: "medium", score: 24, duration: 60000 },
    { user: "u_lucia", game: "memory", diff: "medium", score: 1320, duration: 52000 },
    { user: "u_sofia", game: "reaction", diff: "easy", score: 465, duration: 11000 },
  ];
  for (let i = 0; i < arcadeSeed.length; i++) {
    const s = arcadeSeed[i];
    await ins("arcade_scores", {
      id: `as_seed_${i}`, user_id: s.user, game_key: s.game, difficulty: s.diff, score: s.score,
      duration_ms: s.duration, created_at: iso(-((i % 6) + 1), 17),
    });
  }

  const showdownSeed = [
    { id: "sd_1", game: "pattern", diff: "hard", ch: "u_alex", op: "u_maya", cs: 27, os: 24, winner: "u_alex", status: "complete", days: -1 },
    { id: "sd_2", game: "reaction", diff: "hard", ch: "u_liam", op: "u_alex", cs: 301, os: 342, winner: "u_liam", status: "complete", days: -2 },
    { id: "sd_3", game: "number", diff: "hard", ch: "u_alex", op: "u_victor", cs: 42, os: 45, winner: "u_victor", status: "complete", days: -3 },
    { id: "sd_4", game: "pattern", diff: "medium", ch: "u_maya", op: null, cs: 24, os: null, winner: null, status: "open", days: 0 },
    { id: "sd_5", game: "word", diff: "medium", ch: "u_priya", op: null, cs: 26, os: null, winner: null, status: "open", days: 0 },
  ];
  for (const s of showdownSeed) {
    await ins("showdown_matches", {
      id: s.id, game_key: s.game, difficulty: s.diff, challenger_id: s.ch, opponent_id: s.op,
      challenger_score: s.cs, opponent_score: s.os, status: s.status, winner_id: s.winner,
      created_at: iso(s.days, 16), completed_at: s.status === "complete" ? iso(s.days, 17) : null,
    });
  }

  const tournamentSeed = [
    { id: "t_term1", name: "Term 1 Championship", type: "school", subject_id: null, class_id: null, game_key: null, description: "The flagship school-wide academic tournament. Knockout format, all subjects, one champion.", status: "registration", starts_at: iso(10, 9), ends_at: iso(10, 16), max: 16, winner: null, participants: ["u_alex", "u_maya", "u_liam", "u_zara", "u_sofia", "u_arjun", "u_victor", "u_priya"] },
    { id: "t_mathstd", name: "Mathematics Standard Championship", type: "subject", subject_id: "math_std", class_id: null, game_key: null, description: "A subject championship for the Mathematics Standard division. Standard students compete; Extended students may enter Standard-level matches.", status: "live", starts_at: iso(2, 9), ends_at: iso(3, 16), max: 8, winner: null, participants: ["u_maya", "u_zara", "u_noah", "u_emma", "u_omar", "u_chloe", "u_sofia", "u_ben"] },
    { id: "t_9a", name: "Class 9A Clash", type: "class", subject_id: null, class_id: "c9a", game_key: null, description: "Bragging rights for 9A. A class-only academic knockout.", status: "registration", starts_at: iso(6, 13), ends_at: iso(6, 16), max: 8, winner: null, participants: ["u_alex", "u_maya", "u_liam", "u_zara"] },
    { id: "t_spanish", name: "Spanish Capable Championship", type: "subject", subject_id: "spanish_cap", class_id: null, game_key: null, description: "The Term 1 Spanish Capable subject championship.", status: "complete", starts_at: iso(-8, 9), ends_at: iso(-7, 16), max: 8, winner: "u_alex", participants: ["u_alex", "u_maya", "u_emma", "u_lucia"] },
    { id: "t_showdown_pattern", name: "Pattern Pulse Weekly", type: "showdown", subject_id: null, class_id: null, game_key: "pattern", description: "Weekly Showdown championship on Pattern Pulse. Highest scores advance.", status: "live", starts_at: iso(0, 9), ends_at: iso(2, 20), max: 8, winner: null, participants: ["u_alex", "u_liam", "u_ava", "u_victor", "u_anya", "u_ethan", "u_priya", "u_zara"] },
    { id: "t_showdown_reaction", name: "Reaction Rush Showdown", type: "showdown", subject_id: null, class_id: null, game_key: "reaction", description: "School-wide Showdown on the Reaction Test. Fastest average time wins.", status: "registration", starts_at: iso(4, 16), ends_at: iso(4, 18), max: 16, winner: null, participants: ["u_alex", "u_liam", "u_maya", "u_ava"] },
  ];
  for (const t of tournamentSeed) {
    await ins("tournaments", {
      id: t.id, name: t.name, type: t.type, subject_id: t.subject_id, class_id: t.class_id, game_key: t.game_key,
      description: t.description, format: "knockout", status: t.status, starts_at: t.starts_at, ends_at: t.ends_at,
      max_participants: t.max, created_by: "u_admin", winner_id: t.winner, created_at: iso(-12, 10),
    });
  for (let i = 0; i < t.participants.length; i++) {
    const uid = t.participants[i];
      await ins("tournament_participants", {
        id: `tp_${t.id}_${uid}`, tournament_id: t.id, user_id: uid, seed: i + 1,
        placement: t.winner === uid ? 1 : null, registered_at: iso(-10 + i, 11),
      });
  }
  }

  seedBracket(conn, "t_spanish", [
    { round: 1, matches: [
      { p1: "u_alex", p2: "u_lucia", s1: 6, s2: 3, winner: "u_alex" },
      { p1: "u_maya", p2: "u_emma", s1: 4, s2: 5, winner: "u_emma" },
    ] },
    { round: 2, matches: [{ p1: "u_alex", p2: "u_emma", s1: 7, s2: 4, winner: "u_alex" }] },
  ]);
  seedBracket(conn, "t_mathstd", [
    { round: 1, matches: [
      { p1: "u_maya", p2: "u_ben", s1: 5, s2: 2, winner: "u_maya" },
      { p1: "u_zara", p2: "u_sofia", s1: 4, s2: 3, winner: "u_zara" },
      { p1: "u_noah", p2: "u_omar", s1: 3, s2: 6, winner: "u_omar" },
      { p1: "u_emma", p2: "u_chloe", s1: 6, s2: 5, winner: "u_emma" },
    ] },
    { round: 2, matches: [
      { p1: "u_maya", p2: "u_zara", s1: 5, s2: 4, winner: "u_maya", status: "live" },
      { p1: "u_omar", p2: "u_emma", s1: null as any, s2: null as any, winner: null, status: "scheduled" },
    ] },
  ]);
  seedBracket(conn, "t_showdown_pattern", [
    { round: 1, matches: [
      { p1: "u_alex", p2: "u_zara", s1: 27, s2: 19, winner: "u_alex" },
      { p1: "u_liam", p2: "u_priya", s1: 22, s2: 18, winner: "u_liam" },
      { p1: "u_ava", p2: "u_ethan", s1: 33, s2: 21, winner: "u_ava" },
      { p1: "u_victor", p2: "u_anya", s1: 30, s2: 36, winner: "u_anya" },
    ] },
    { round: 2, matches: [
      { p1: "u_alex", p2: "u_liam", s1: 29, s2: 25, winner: "u_alex", status: "live" },
      { p1: "u_ava", p2: "u_anya", s1: null as any, s2: null as any, winner: null, status: "scheduled" },
    ] },
  ]);

  const owned = [
    { id: "inv_alex_welcome", user_id: "u_alex", collectible_id: "col_badge_welcome", equipped: 0, source: "achievement", days: -60 },
    { id: "inv_alex_star", user_id: "u_alex", collectible_id: "col_sticker_star", equipped: 1, source: "purchase", days: -12 },
    { id: "inv_alex_neon", user_id: "u_alex", collectible_id: "col_frame_neon", equipped: 1, source: "purchase", days: -2 },
    { id: "inv_alex_bolt", user_id: "u_alex", collectible_id: "col_sticker_bolt", equipped: 0, source: "purchase", days: -8 },
  ];
  for (let i = 0; i < owned.length; i++) {
    const item = owned[i];
    await ins("inventory", {
      id: item.id, user_id: item.user_id, collectible_id: item.collectible_id,
      equipped: item.equipped, source: item.source, acquired_at: iso(item.days, 12),
    });
  }

  const unlocked = ["ach_welcome", "ach_quiz_10", "ach_battle_first", "ach_battle_win", "ach_arcade_first", "ach_tournament"];
  for (let i = 0; i < unlocked.length; i++) {
    const achievementId = unlocked[i];
    await ins("user_achievements", {
      id: `ua_alex_${i}`, user_id: "u_alex", achievement_id: achievementId, unlocked_at: iso(-20 + i, 10),
    });
  }

  const notices = [
    { title: "Term 1 Championship registration is open", body: "Register for the flagship school tournament before Friday. Sixteen qualifiers, one champion.", type: "tournament", link: "/academy/tournaments/t_term1", days: 0, hour: 9 },
    { title: "Daily challenge ready", body: "Five Mathematics Standard questions are waiting. Keep your 6-day streak alive.", type: "daily", link: "/academy/revision", days: 0, hour: 8 },
    { title: "Question bank updated", body: "Ms. Rivera approved 8 new practice questions across your subjects.", type: "academic", link: "/academy/subjects", days: -1, hour: 15 },
    { title: "Showdown challenge received", body: "Priya has challenged you to Pattern Pulse on Medium. Beat her score to win.", type: "showdown", link: "/hangout/showdown", days: -1, hour: 18 },
  ];
  for (let i = 0; i < notices.length; i++) {
    const n = notices[i];
    await ins("notifications", {
      id: `ntf_alex_${i}`, user_id: "u_alex", title: n.title, body: n.body, type: n.type,
      link: n.link, read: i > 1 ? 1 : 0, created_at: iso(n.days, n.hour),
    });
  }

  await ins("daily_challenges", {
    id: "daily_seed", date: today, subject_id: "math_std",
    question_ids: JSON.stringify(["q_math_std_0", "q_math_std_1", "q_math_std_2", "q_math_std_3", "q_math_std_4"]),
    xp_reward: 50, coin_reward: 10,
  });

  await ins("reports", {
    id: "report_seed_1", reporter_id: "u_maya", target_type: "profile", target_id: "u_theo",
    reason: "Display name concerns", details: "The display name uses language that made a classmate uncomfortable.",
    status: "open", handled_by: null, resolution_note: null, created_at: iso(-1, 13), resolved_at: null,
  });
  await ins("reports", {
    id: "report_seed_2", reporter_id: "u_liam", target_type: "arcade_score", target_id: "as_seed_1",
    reason: "Suspicious score", details: "Score looks higher than the game's maximum.",
    status: "reviewing", handled_by: "u_teacher", resolution_note: "Checking the score submission log.",
    created_at: iso(-2, 16), resolved_at: null,
  });

  const settings = [
    ["school_name", "Northstar Academy"],
    ["term", "Term 1"],
    ["syllabus_status", "pending_upload"],
    ["syllabus_note", "The official Term 1 syllabus has not been uploaded. All curriculum content is sample demonstration content and is labelled as such."],
    ["registration_mode", "admin_approval"],
    ["leaderboard_weighting", "Accuracy is weighted more heavily than speed. Formula: accuracy × 1000 + correct answers × 10."],
    ["arcade_reward_note", "Coins are cosmetic only. Arcade and Showdown rewards never affect academic scores or grades."],
    ["safe_mode", "on"],
  ];
  for (const [key, value] of settings) await ins("platform_settings", { key, value });
}
