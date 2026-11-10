export type Role = "student" | "teacher" | "admin";

export type LanguageDivision =
  | "spanish_capable"
  | "spanish_emergent"
  | "french_regular"
  | "french_emergent"
  | "hindi"
  | "german";

export type MathTrack = "standard" | "extended";

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: Role;
  grade: number;
  classId: string;
  languageDivision: LanguageDivision;
  mathTrack: MathTrack;
  avatar: string; // avatar id
  xp: number;
  coins: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  createdAt: string;
  approved: boolean;
}

export interface Class {
  id: string;
  name: string;
  grade: number;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  category: "language" | "math" | "science" | "humanities";
}

export interface SyllabusUnit {
  id: string;
  subjectId: string;
  title: string;
  order: number;
}

export interface SyllabusTopic {
  id: string;
  unitId: string;
  title: string;
  notes: string;
  flashcards: { q: string; a: string }[];
}

export interface Question {
  id: string;
  subjectId: string;
  unitId?: string;
  topicId?: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  type: "mcq" | "short";
  prompt: string;
  options?: string[];
  answer: string;
  languageDivision?: LanguageDivision | "any"; // for language-neutral use "any"
  mathTrack?: MathTrack | "any";
  approved: boolean;
  createdBy: string;
  createdAt: string;
}

export interface Match {
  id: string;
  type: "academic" | "showdown";
  gameId?: string;
  subjectId?: string;
  playerA: string;
  playerB: string;
  questions: string[]; // question ids
  answers: Record<string, Record<string, string>>; // playerId -> questionId -> answer
  scores: Record<string, number>;
  status: "pending" | "active" | "completed";
  winner: string | null;
  xpAwarded: Record<string, number>;
  coinsAwarded: Record<string, number>;
  createdAt: string;
  completedAt?: string;
  timeLimitSec: number;
}

export interface Tournament {
  id: string;
  name: string;
  type: "school" | "class" | "subject";
  subjectId?: string;
  gameId?: string;
  track: "academic" | "showdown";
  status: "registration" | "active" | "completed";
  participants: string[];
  bracket: any;
  winner: string | null;
  createdAt: string;
  startDate: string;
}

export interface XpTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface Collectible {
  id: string;
  name: string;
  type: "badge" | "trophy" | "sticker" | "accessory" | "decoration" | "frame" | "seasonal";
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  description: string;
}

export interface InventoryItem {
  id: string;
  userId: string;
  collectibleId: string;
  earnedAt: string;
  source: string;
}

export interface ArcadeGame {
  id: string;
  name: string;
  slug: string;
  description: string;
  instructions: string;
  category: string;
}

export interface ArcadeScore {
  id: string;
  userId: string;
  gameId: string;
  score: number;
  difficulty: string;
  createdAt: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  createdBy: string;
}

export interface SchoolMenu {
  id: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  items: { name: string; description: string }[];
  specialNote?: string;
  weekOf: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface DB {
  users: User[];
  classes: Class[];
  subjects: Subject[];
  syllabusUnits: SyllabusUnit[];
  syllabusTopics: SyllabusTopic[];
  questions: Question[];
  matches: Match[];
  tournaments: Tournament[];
  xpTransactions: XpTransaction[];
  achievements: Achievement[];
  collectibles: Collectible[];
  inventory: InventoryItem[];
  arcadeGames: ArcadeGame[];
  arcadeScores: ArcadeScore[];
  events: SchoolEvent[];
  menus: SchoolMenu[];
  notifications: Notification[];
}