import { NextResponse } from "next/server";
import { ApiError } from "./auth";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data as any, { status });
}

export function fail(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("[studyverse]", error);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

export async function readBody<T = Record<string, any>>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError(400, "Invalid request body.");
  }
}

export function requireString(value: unknown, field: string, min = 1, max = 5000): string {
  if (typeof value !== "string") throw new ApiError(400, `${field} is required.`);
  const text = value.trim();
  if (text.length < min) throw new ApiError(400, `${field} is required.`);
  if (text.length > max) throw new ApiError(400, `${field} is too long.`);
  return text;
}

export function optionalString(value: unknown, max = 5000): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text) return null;
  return text.slice(0, max);
}

export function requireInt(value: unknown, field: string, min = -Infinity, max = Infinity): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) throw new ApiError(400, `${field} must be a whole number.`);
  if (n < min || n > max) throw new ApiError(400, `${field} is out of range.`);
  return n;
}

export function requireOneOf<T extends string>(value: unknown, allowed: readonly T[], field: string): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new ApiError(400, `${field} must be one of: ${allowed.join(", ")}.`);
  }
  return value as T;
}

export function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}
