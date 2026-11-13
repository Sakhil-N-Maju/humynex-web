import "server-only";
import { PrismaClient } from "@prisma/client";

// Demo deploys ship a bundled SQLite file and set no env (see scripts/build-demo.mjs).
process.env.DATABASE_URL ||= "file:./demo.db";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export function parseJSON<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
