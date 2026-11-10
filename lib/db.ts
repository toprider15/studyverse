import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import { SCHEMA } from "./schema";
import { seedDatabase } from "./seed";

export type Row = Record<string, any>;

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = process.env.STUDYVERSE_DB || path.join(DATA_DIR, "studyverse.db");

type GlobalWithDb = typeof globalThis & { __studyverseDb?: DatabaseSync };
const g = globalThis as GlobalWithDb;

function open(): DatabaseSync {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const conn = new DatabaseSync(DB_PATH);
  conn.exec("PRAGMA journal_mode = WAL;");
  conn.exec("PRAGMA foreign_keys = ON;");
  conn.exec(SCHEMA);
  const row = conn.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number | bigint };
  if (!row || Number(row.n) === 0) {
    seedDatabase(conn);
  }
  return conn;
}

export function db(): DatabaseSync {
  if (!g.__studyverseDb) g.__studyverseDb = open();
  return g.__studyverseDb;
}

export function all<T = Row>(sql: string, ...params: unknown[]): T[] {
  return db().prepare(sql).all(...params) as T[];
}

export function get<T = Row>(sql: string, ...params: unknown[]): T | undefined {
  return db().prepare(sql).get(...params) as T | undefined;
}

export function run(sql: string, ...params: unknown[]) {
  return db().prepare(sql).run(...params);
}

export function tx<T>(fn: () => T): T {
  const conn = db();
  conn.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    conn.exec("COMMIT");
    return result;
  } catch (error) {
    conn.exec("ROLLBACK");
    throw error;
  }
}

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isoNow() {
  return new Date().toISOString();
}

export function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || !value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function placeholders(count: number) {
  return Array.from({ length: count }, () => "?").join(",");
}