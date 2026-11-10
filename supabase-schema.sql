`
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  grade INTEGER NOT NULL DEFAULT 9,
  homeroom_teacher_id TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student','teacher','admin')),
  grade INTEGER NOT NULL DEFAULT 9,
  class_id TEXT REFERENCES classes(id),
  language_subject TEXT,
  language_division TEXT,
  math_track TEXT,
  avatar TEXT NOT NULL DEFAULT '{}',
  room TEXT NOT NULL DEFAULT '{}',
  xp INTEGER NOT NULL DEFAULT 0,
  coins INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending','suspended')),
  created_at TEXT NOT NULL,
  approved_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_users_class ON users(class_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  division TEXT,
  icon TEXT NOT NULL DEFAULT '📘',
  color TEXT NOT NULL DEFAULT '#8b5cf6',
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS enrollments (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, subject_id)
);

CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  term INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published')),
  is_sample INTEGER NOT NULL DEFAULT 0,
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published')),
  is_sample INTEGER NOT NULL DEFAULT 0,
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS flashcards (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  unit_id TEXT REFERENCES units(id) ON DELETE SET NULL,
  topic_id TEXT REFERENCES topics(id) ON DELETE SET NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  marks INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL DEFAULT 'mcq' CHECK (type IN ('mcq')),
  prompt TEXT NOT NULL,
  options TEXT NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  official INTEGER NOT NULL DEFAULT 0,
  language_division TEXT DEFAULT 'any',
  math_track TEXT DEFAULT 'any',
  created_by TEXT NOT NULL,
  approved_by TEXT,
  approved_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject_id, status, difficulty);

CREATE TABLE IF NOT EXISTS question_approvals (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL,
  action TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  question_ids TEXT NOT NULL,
  answers TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  coins_awarded INTEGER NOT NULL DEFAULT 0,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','complete','expired'))
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  player1_id TEXT NOT NULL REFERENCES users(id),
  player2_id TEXT NOT NULL REFERENCES users(id),
  mode TEXT NOT NULL DEFAULT 'live' CHECK (mode IN ('live','bot')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','complete','expired')),
  question_ids TEXT NOT NULL,
  neutral INTEGER NOT NULL DEFAULT 0,
  p1_score INTEGER NOT NULL DEFAULT 0,
  p2_score INTEGER NOT NULL DEFAULT 0,
  p1_time_ms INTEGER NOT NULL DEFAULT 0,
  p2_time_ms INTEGER NOT NULL DEFAULT 0,
  winner_id TEXT,
  bot_plan TEXT,
  started_at TEXT,
  completed_at TEXT,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  coins_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_matches_players ON matches(player1_id, player2_id);

CREATE TABLE IF NOT EXISTS match_answers (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer_index INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  elapsed_ms INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS match_progress (
  match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  current_index INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  started_at TEXT,
  completed_at TEXT,
  total_ms INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (match_id, user_id)
);

CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('school','class','subject','showdown')),
  subject_id TEXT,
  class_id TEXT,
  game_key TEXT,
  description TEXT,
  format TEXT NOT NULL DEFAULT 'knockout',
  status TEXT NOT NULL DEFAULT 'registration' CHECK (status IN ('draft','registration','live','complete')),
  starts_at TEXT NOT NULL,
  ends_at TEXT,
  max_participants INTEGER NOT NULL DEFAULT 16,
  created_by TEXT NOT NULL,
  winner_id TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tournament_participants (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seed INTEGER,
  placement INTEGER,
  registered_at TEXT NOT NULL,
  UNIQUE (tournament_id, user_id)
);

CREATE TABLE IF NOT EXISTS tournament_matches (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  slot INTEGER NOT NULL,
  player1_id TEXT,
  player2_id TEXT,
  p1_score INTEGER,
  p2_score INTEGER,
  winner_id TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','complete')),
  scheduled_at TEXT
);

CREATE TABLE IF NOT EXISTS xp_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  ref TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS coin_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  ref TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  coin_reward INTEGER NOT NULL DEFAULT 0,
  hidden INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TEXT NOT NULL,
  UNIQUE (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS collectibles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('badge','trophy','sticker','accessory','decoration','frame','seasonal')),
  rarity TEXT NOT NULL DEFAULT 'common',
  price INTEGER NOT NULL DEFAULT 0,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  unlock_hint TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  seasonal INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  collectible_id TEXT NOT NULL REFERENCES collectibles(id) ON DELETE CASCADE,
  equipped INTEGER NOT NULL DEFAULT 0,
  acquired_at TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'purchase',
  UNIQUE (user_id, collectible_id)
);

CREATE TABLE IF NOT EXISTS arcade_games (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  instructions TEXT NOT NULL,
  score_direction TEXT NOT NULL DEFAULT 'high' CHECK (score_direction IN ('high','low')),
  unit TEXT NOT NULL DEFAULT 'points',
  max_scores TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS arcade_scores (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_key TEXT NOT NULL REFERENCES arcade_games(key),
  difficulty TEXT NOT NULL,
  score INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_arcade_scores ON arcade_scores(game_key, difficulty, score);

CREATE TABLE IF NOT EXISTS showdown_matches (
  id TEXT PRIMARY KEY,
  game_key TEXT NOT NULL REFERENCES arcade_games(key),
  difficulty TEXT NOT NULL,
  challenger_id TEXT NOT NULL REFERENCES users(id),
  opponent_id TEXT REFERENCES users(id),
  challenger_score INTEGER NOT NULL,
  opponent_score INTEGER,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','active','complete','expired')),
  winner_id TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS school_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'school',
  starts_at TEXT NOT NULL,
  ends_at TEXT,
  location TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS school_menus (
  id TEXT PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
  week_label TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'main',
  item TEXT NOT NULL,
  description TEXT NOT NULL,
  special INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  updated_by TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  link TEXT,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved')),
  handled_by TEXT,
  resolution_note TEXT,
  created_at TEXT NOT NULL,
  resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS activity (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT,
  icon TEXT NOT NULL DEFAULT '✨',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_challenges (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  subject_id TEXT NOT NULL,
  question_ids TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  coin_reward INTEGER NOT NULL DEFAULT 10
);

CREATE TABLE IF NOT EXISTS daily_challenge_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  completed_at TEXT NOT NULL,
  UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS subject_progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  questions_answered INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 0,
  last_activity TEXT,
  PRIMARY KEY (user_id, subject_id)
);

CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;