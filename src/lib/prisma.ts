import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

const dbUrl = process.env.DATABASE_URL!;
const authToken = process.env.DATABASE_AUTH_TOKEN;
const adapter = new PrismaLibSql({ url: dbUrl, authToken });
  const client = new PrismaClient({ adapter });

  globalForPrisma.prisma = client;
  return client;
}

export const prisma = getPrisma();
