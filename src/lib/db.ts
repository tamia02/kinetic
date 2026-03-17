import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { env } from "./env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

const pool = globalForPrisma.pgPool ?? new Pool({ 
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pgPool = pool;
}

export const pg = pool;

const adapter = new PrismaPg(pool as any);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
